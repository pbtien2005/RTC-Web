from fastapi import (
    APIRouter, Depends, Query, HTTPException, 
    status, UploadFile, File, Response
)
from sqlalchemy.orm import Session
from typing import List, Optional, Union
from datetime import date 

from core.db import get_db
from dependencies import get_current_admin_user 
from models.user import User, UserRole
from schemas.admin_schema import (
    StudentCreate, StudentOutput, 
    CoacherCreate, CoacherOutput,
    DashboardStats,
    StudentUpdate, CoacherUpdate,
    StudentPage, CoacherPage,CertificateCreate, CertificateOutput, 
    RegisteredCoacherInfo,
    RegisteredStudentInfo, CoacherRankingInfo
)
from services.admin_service import AdminService

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin_user)] 
)

# --- Helpers    ---
def map_user_to_student_output(user: User) -> StudentOutput:
    """Hàm helper để 'làm phẳng' User và User.student"""
    if not user.student:
        raise HTTPException(status_code=500, detail=f"User {user.user_id} có role 'student' nhưng không có 'student' entry.")
    
    return StudentOutput(
        # Lấy từ User
        user_id=user.user_id,
        email=user.email,
        is_active=user.is_active,
        role=user.role,
        full_name=user.full_name,
        dob=user.dob,
        avatar_url=user.avatar_url,
        phone=user.phone,
        job=user.job,
        university=user.university, # --- THÊM MỚI ---
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login_at=user.last_login_at,
        certificates=user.certificates,
        
        # Lấy từ User.student
        goal=user.student.goal,
        slot_quota=user.student.slot_quota,
        slot_used=user.student.slot_used
    )

def map_user_to_coacher_output(user: User) -> CoacherOutput:
    """Hàm helper để 'làm phẳng' User và User.coach"""
    if not user.coach:
        raise HTTPException(status_code=500, detail=f"User {user.user_id} có role 'coacher' nhưng không có 'coach' entry.")

    return CoacherOutput(
        # Lấy từ User
        user_id=user.user_id,
        email=user.email,
        is_active=user.is_active,
        role=user.role,
        full_name=user.full_name,
        dob=user.dob,
        avatar_url=user.avatar_url,
        phone=user.phone,
        job=user.job,
        university=user.university, # --- THÊM MỚI ---
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login_at=user.last_login_at,
        certificates=user.certificates,
        
        # Lấy từ User.coach
        student_number=user.coach.student_number
    )

# --- Dashboard ---
@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    service = AdminService(db)
    return service.get_dashboard_stats()

# --- Profile ---
@router.get("/profile/{user_id}", response_model=Union[StudentOutput, CoacherOutput])
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    service = AdminService(db)
    user = service.get_user_profile(user_id) 
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == UserRole.STUDENT.value:
        return map_user_to_student_output(user)
        
    elif user.role == UserRole.COACHER.value:
        return map_user_to_coacher_output(user)
    else:
        raise HTTPException(status_code=400, detail="Profile view not supported for this role")

@router.get("/coachers/ranking", response_model=List[CoacherRankingInfo])
def get_top_coachers(
    limit: int = Query(5, ge=1, le=10), 
    db: Session = Depends(get_db)
):
    """Lấy bảng xếp hạng coacher theo số học viên (approved)"""
    service = AdminService(db)
    ranking_data = service.get_coacher_ranking(limit)
    
    # Map (User, count) tuple sang Pydantic model
    results = []
    for user, count in ranking_data:
        results.append(
            CoacherRankingInfo(
                user_id=user.user_id,
                full_name=user.full_name,
                avatar_url=user.avatar_url,
                student_count=count
            )
        )
    return results

@router.get("/students/{user_id}/coachers", response_model=List[RegisteredCoacherInfo])
def get_student_registered_coachers(
    user_id: int, 
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Lấy danh sách coacher mà student này đã đăng ký"""
    service = AdminService(db)
    bookings = service.get_student_coachers_list(user_id)
    
    # Map kết quả sang schema
    results = []
    for booking in bookings:
        if booking.coacher:
            results.append(RegisteredCoacherInfo(
                user_id=booking.coacher.user_id,
                full_name=booking.coacher.full_name,
                email=booking.coacher.email,
                avatar_url=booking.coacher.avatar_url,
                status=booking.status # 'pending' hoặc 'approved'
            ))
    return results

@router.get("/coachers/{user_id}/students", response_model=List[RegisteredStudentInfo])
def get_coacher_registered_students(
    user_id: int, 
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Lấy danh sách student mà coacher này đang phụ trách"""
    service = AdminService(db)
    bookings = service.get_coacher_students_list(user_id)
    
    # Map kết quả sang schema
    results = []
    for booking in bookings:
        if booking.student: # Kiểm tra xem có join được student không
            results.append(RegisteredStudentInfo(
                user_id=booking.student.user_id,
                full_name=booking.student.full_name,
                email=booking.student.email,
                avatar_url=booking.student.avatar_url,
                status=booking.status # 'pending' hoặc 'approved'
            ))
    return results
# ------------------


# --- Quản lý Student ---
@router.post("/students", response_model=StudentOutput, status_code=status.HTTP_201_CREATED)
def create_new_student(payload: StudentCreate, db: Session = Depends(get_db)):
    service = AdminService(db)
    user = service.create_student(payload)
    return map_user_to_student_output(user)

@router.get("/students", response_model=StudentPage)
def get_all_students(
    skip: int = Query(0, ge=0), 
    limit: int = Query(5, ge=1, le=100), 
    full_name: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    service = AdminService(db)
    users, total_count = service.get_all_students(full_name, start_date, end_date, skip, limit)
    
    outputs = [map_user_to_student_output(u) for u in users if u.student]
        
    return StudentPage(total_count=total_count, data=outputs)

@router.put("/students/{user_id}", response_model=StudentOutput)
def update_student_data(
    user_id: int, 
    payload: StudentUpdate, 
    db: Session = Depends(get_db)
):
    service = AdminService(db)
    try:
        user = service.update_student(user_id, payload)
        return map_user_to_student_output(user)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/students/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student_data(user_id: int, db: Session = Depends(get_db)):
    service = AdminService(db)
    try:
        service.delete_student(user_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException as e:
        raise e

@router.put("/students/{user_id}/avatar", response_model=StudentOutput)
def update_student_avatar(
    user_id: int,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    service = AdminService(db)
    user = service.update_user_avatar(user_id, UserRole.STUDENT, file)
    return map_user_to_student_output(user)

# --- Quản lý Coacher ---
@router.post("/coachers", response_model=CoacherOutput, status_code=status.HTTP_201_CREATED)
def create_new_coacher(payload: CoacherCreate, db: Session = Depends(get_db)):
    service = AdminService(db)
    user = service.create_coacher(payload)
    return map_user_to_coacher_output(user)

@router.get("/coachers", response_model=CoacherPage)
def get_all_coachers(
    skip: int = Query(0, ge=0), 
    limit: int = Query(5, ge=1, le=100), 
    full_name: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    service = AdminService(db)
    users, total_count = service.get_all_coachers(full_name, start_date, end_date, skip, limit)
    
    outputs = [map_user_to_coacher_output(u) for u in users if u.coach]
    
    return CoacherPage(total_count=total_count, data=outputs)


@router.put("/coachers/{user_id}", response_model=CoacherOutput)
def update_coacher_data(
    user_id: int, 
    payload: CoacherUpdate, 
    db: Session = Depends(get_db)
):
    service = AdminService(db)
    try:
        user = service.update_coacher(user_id, payload)
        return map_user_to_coacher_output(user)
    except HTTPException as e:
        raise e

@router.delete("/coachers/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coacher_data(user_id: int, db: Session = Depends(get_db)):
    service = AdminService(db)
    try:
        service.delete_coacher(user_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException as e:
        raise e
    

@router.put("/coachers/{user_id}/avatar", response_model=CoacherOutput)
def update_coacher_avatar(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    service = AdminService(db)
    user = service.update_user_avatar(user_id, UserRole.COACHER, file)
    return map_user_to_coacher_output(user)

# --- Quản lý Certificate ---
@router.post("/users/{user_id}/certificates", response_model=CertificateOutput, status_code=201)
def add_new_certificate(
    user_id: int,
    payload: CertificateCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user) # Chỉ để check auth
):
    """Admin thêm một chứng chỉ mới cho user (student hoặc coacher)"""
    service = AdminService(db)
    return service.add_certificate(user_id, payload)


@router.delete("/certificates/{user_id}/{cert_id}", status_code=204)
def remove_user_certificate(
    user_id: int,
    cert_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    """Admin xóa một chứng chỉ khỏi user"""
    service = AdminService(db)
    service.remove_certificate(user_id, cert_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)