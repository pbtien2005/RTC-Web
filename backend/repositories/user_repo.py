from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, ScalarResult, func  # <-- THÊM 'func'
from models.user import User, Student, Coach, UserRole
from models.user_certificates import UserCertificate
from typing import Optional, List
from datetime import date, datetime
from models.booking_requests import BookingRequest  # <-- THÊM IMPORT NÀY


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        query = (
            select(User)
            .where(User.user_id == user_id)
            .options(
                joinedload(User.student),
                joinedload(User.coach),
                joinedload(User.certificates)
            )
        )
        return self.db.execute(query).scalars().first()

    def get_user_by_id_and_role(self, user_id: int, role: UserRole) -> User | None:
        query = select(User).where(
            User.user_id == user_id,
            User.role == role.value
        )
        if role == UserRole.STUDENT:
            query = query.options(joinedload(User.student))
        elif role == UserRole.COACHER:
            query = query.options(joinedload(User.coach))
        return self.db.execute(query).scalars().first()

    def create_user(self, new_user: User) -> User:
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user

    def save(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_by_email(self, email: str) -> User | None:
        return self.db.execute(
            select(User).where(User.email == email)
        ).scalars().first()

    def get_all_by_role(self, role: str):
        return self.db.execute(select(User).where(User.role == role)).scalars().all()

    def get_users_by_role(
            self,
            role: str,
            full_name: Optional[str],
            start_date: Optional[date],
            end_date: Optional[date],
            skip: int = 0,
            limit: int = 100
    ):
        query = select(User).where(User.role == role)

        if full_name:
            query = query.where(User.full_name.ilike(f"%{full_name}%"))
        if start_date:
            query = query.where(User.created_at >= start_date)
        if end_date:
            end_of_day = datetime.combine(end_date, datetime.max.time())
            query = query.where(User.created_at <= end_of_day)

        count_query = select(func.count()).select_from(query.subquery())
        total_count = self.db.execute(count_query).scalar_one()

        query = query.options(joinedload(User.certificates))

        if role == UserRole.STUDENT.value:
            query = query.options(joinedload(User.student))
        elif role == UserRole.COACHER.value:
            query = query.options(joinedload(User.coach))

        results = self.db.execute(
            query.order_by(User.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).unique().scalars().all()

        return (results, total_count)

    def get_user_count_by_role(self, role: str) -> int:
        return self.db.execute(
            select(func.count(User.user_id)).where(User.role == role)
        ).scalar_one()

    def delete_user(self, user: User):
        self.db.delete(user)
        self.db.commit()

    def get_certificate_by_id(self, cert_id: int, user_id: int) -> UserCertificate | None:
        return self.db.execute(
            select(UserCertificate).where(
                UserCertificate.id == cert_id,
                UserCertificate.user_id == user_id
            )
        ).scalars().first()

    def create_certificate(self, certificate: UserCertificate) -> UserCertificate:
        self.db.add(certificate)
        self.db.commit()
        self.db.refresh(certificate)
        return certificate

    def delete_certificate(self, certificate: UserCertificate):
        self.db.delete(certificate)
        self.db.commit()

    def get_registered_coachers_for_student(self, student_id: int) -> List[BookingRequest]:
        query = (
            select(BookingRequest)
            .where(BookingRequest.student_id == student_id)
            .where(BookingRequest.status.in_(['approved', 'pending']))
            .options(joinedload(BookingRequest.coacher))
            .order_by(BookingRequest.created_at.desc())
        )

        return self.db.execute(query).scalars().all()

    def get_registered_students_for_coacher(self, coacher_id: int) -> List[BookingRequest]:
        query = (
            select(BookingRequest)
            .where(BookingRequest.coacher_id == coacher_id)
            .where(BookingRequest.status.in_(['approved', 'pending']))
            .options(joinedload(BookingRequest.student))
            .order_by(BookingRequest.created_at.desc())
        )

        return self.db.execute(query).scalars().all()

    def get_coacher_ranking(self, limit: int = 5) -> List[tuple[User, int]]:
        query = (
            select(
                User,
                func.count(BookingRequest.student_id).label("student_count")
            )
            .join(User, User.user_id == BookingRequest.coacher_id)
            .where(BookingRequest.status == 'approved')
            .group_by(User.user_id)
            .order_by(func.count(BookingRequest.student_id).desc())
            .limit(limit)
        )
        return self.db.execute(query).all()