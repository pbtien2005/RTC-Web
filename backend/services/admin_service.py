from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from core.security import hash_password
from models.user import User, Student, Coach, UserRole
from models.user_certificates import UserCertificate
from repositories.user_repo import UserRepository
from schemas.admin_schema import (
    StudentCreate, CoacherCreate, DashboardStats,
    StudentUpdate, CoacherUpdate, CertificateCreate, CertificateOutput
)
from typing import Optional, List
from datetime import date
import os
import shutil
import uuid
from PIL import Image
from core.utils import save_base64_string_as_avatar, save_base64_string_as_certificate
from models.booking_requests import BookingRequest


class AdminService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)
        self.db = db 

    # --- (Các hàm khác giữ nguyên) ---
    def create_student(self, payload: StudentCreate) -> User:
        existing = self.repo.get_by_email(payload.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        hashed_password = hash_password(payload.password)
        new_user = User(
            email=payload.email,
            password_hash=hashed_password,
            full_name=payload.full_name,
            role=UserRole.STUDENT.value,
            is_active=payload.is_active,
            is_email_verified=True 
        )
        new_student_details = Student(
            slot_quota=payload.slot_quota,
            slot_used=0
        )
        new_user.student = new_student_details
        return self.repo.create_user(new_user)

    def create_coacher(self, payload: CoacherCreate) -> User:
        existing = self.repo.get_by_email(payload.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        hashed_password = hash_password(payload.password)
        new_user = User(
            email=payload.email,
            password_hash=hashed_password,
            full_name=payload.full_name,
            role=UserRole.COACHER.value,
            is_active=payload.is_active,
            is_email_verified=True 
        )
        new_user.coach = Coach(
            student_number=payload.student_number
        ) 
        return self.repo.create_user(new_user)
    
    def get_all_students(self, full_name, start_date, end_date, skip, limit):
        return self.repo.get_users_by_role(UserRole.STUDENT.value, full_name, start_date, end_date, skip, limit)
    
    def get_all_coachers(self, full_name, start_date, end_date, skip, limit):
        return self.repo.get_users_by_role(UserRole.COACHER.value, full_name, start_date, end_date, skip, limit)

    def get_dashboard_stats(self) -> DashboardStats:
        total_students = self.repo.get_user_count_by_role(UserRole.STUDENT.value)
        total_coachers = self.repo.get_user_count_by_role(UserRole.COACHER.value)
        return DashboardStats(total_students=total_students, total_coachers=total_coachers, total_active_sessions=0)

    def get_user_profile(self, user_id: int) -> User:
        user = self.repo.get_by_id(user_id) 
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    def update_student(self, user_id: int, payload: StudentUpdate) -> User:
        user = self.repo.get_user_by_id_and_role(user_id, UserRole.STUDENT)
        if not user or not user.student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

        update_data = payload.model_dump(exclude_none=True) 

        if "avatar_base64" in update_data and update_data["avatar_base64"]:
            new_avatar_url = save_base64_string_as_avatar(user, update_data["avatar_base64"])
            user.avatar_url = new_avatar_url
            del update_data["avatar_base64"] 

        student_fields = ['goal', 'slot_quota']
        
        for key, value in update_data.items():
            if key in student_fields:
                setattr(user.student, key, value)
            elif hasattr(user, key):
                setattr(user, key, value) 
        
        return self.repo.save(user) 

    def delete_student(self, user_id: int):
        user = self.repo.get_user_by_id_and_role(user_id, UserRole.STUDENT)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
        self.repo.delete_user(user)
        return True 

    def update_coacher(self, user_id: int, payload: CoacherUpdate) -> User:
        user = self.repo.get_user_by_id_and_role(user_id, UserRole.COACHER)
        if not user or not user.coach:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coacher not found")

        update_data = payload.model_dump(exclude_none=True) 

        if "avatar_base64" in update_data and update_data["avatar_base64"]:
            new_avatar_url = save_base64_string_as_avatar(user, update_data["avatar_base64"])
            user.avatar_url = new_avatar_url
            del update_data["avatar_base64"]

        coach_fields = ['student_number']

        for key, value in update_data.items():
            if key in coach_fields:
                setattr(user.coach, key, value)
            elif hasattr(user, key):
                setattr(user, key, value)
        
        return self.repo.save(user)

    def delete_coacher(self, user_id: int):
        user = self.repo.get_user_by_id_and_role(user_id, UserRole.COACHER)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coacher not found")
        self.repo.delete_user(user)
        return True

    def update_user_avatar(self, user_id: int, role: UserRole, file: UploadFile) -> User:
        pass

    def add_certificate(self, user_id: int, payload: CertificateCreate) -> UserCertificate:
        user = self.repo.get_by_id(user_id) 
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        final_image_url = None 

        if payload.image_base64:
            final_image_url = save_base64_string_as_certificate(user, payload.image_base64)
        
        new_cert = UserCertificate(
            user_id=user_id,
            title=payload.title,
            image_url=final_image_url 
        )
        
        return self.repo.create_certificate(new_cert)

    def remove_certificate(self, user_id: int, cert_id: int):
        cert = self.repo.get_certificate_by_id(cert_id, user_id)
        if not cert:
            raise HTTPException(status_code=404, detail="Certificate not found or does not belong to this user")
        
        if cert.image_url and cert.image_url.startswith("/static/"):
            pass

        self.repo.delete_certificate(cert)
        return True


    def get_student_coachers_list(self, student_id: int) -> List[BookingRequest]:
        student = self.repo.get_user_by_id_and_role(student_id, UserRole.STUDENT)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
            
        return self.repo.get_registered_coachers_for_student(student_id)

    def get_coacher_students_list(self, coacher_id: int) -> List[BookingRequest]:
        coacher = self.repo.get_user_by_id_and_role(coacher_id, UserRole.COACHER)
        if not coacher:
            raise HTTPException(status_code=404, detail="Coacher not found")
            
        return self.repo.get_registered_students_for_coacher(coacher_id)

    def get_coacher_ranking(self, limit: int) -> List[tuple[User, int]]:
        return self.repo.get_coacher_ranking(limit)