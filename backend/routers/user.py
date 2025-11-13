from fastapi import APIRouter, Depends, HTTPException
from fastapi.openapi.models import Response
from sqlalchemy.orm import Session
from starlette import status

from models.user import User  # Model User của bạn
from core.db import get_db
from auth.dependencies import get_current_user  # Hàm auth của bạn
from models.user_certificates import UserCertificate
from schemas.coacher_schema import CertificateOut, CertificateCreate
# Import repo mới
from repositories.user_repo import UserRepository

# Import các schema đã tạo trước đó
from schemas.user_schema import UserProfileOut, UserProfileUpdate

router = APIRouter(prefix="/users", tags=["Users (Me)"])


# API 1: Lấy thông tin profile của tôi
@router.get("/me/profile", response_model=UserProfileOut)
def get_my_profile(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)  # ✅ Thêm get_db
):
    repo = UserRepository(db)
    full_user_data = repo.get_by_id(current_user.user_id)

    if not full_user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return full_user_data


# API 2: Cập nhật thông tin profile của tôi
@router.put("/me/profile", response_model=UserProfileOut)
def update_my_profile(
        body: UserProfileUpdate,  # Schema chứa các trường muốn cập nhật
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Cập nhật profile cho user đang đăng nhập."""
    repo = UserRepository(db)

    # 1. Lấy dữ liệu update (chỉ các trường được gửi lên)
    update_data = body.model_dump(exclude_unset=True)

    # 2. Cập nhật các trường cho đối tượng user
    for key, value in update_data.items():
        if value is not None:  # Chỉ cập nhật nếu giá trị không phải None
            setattr(current_user, key, value)

    # 3. Dùng hàm .save() của repo (hàm này đã tự commit)
    try:
        updated_user = repo.save(current_user)
        return updated_user
    except Exception as e:
        # Nếu repo.save() không tự rollback, bạn nên rollback ở đây
        # db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi cập nhật profile: {e}")


@router.post("/me/certificates", response_model=CertificateOut, status_code=status.HTTP_201_CREATED)


def add_my_certificate(
        body: CertificateCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Thêm một bằng cấp mới cho user đang đăng nhập."""
    repo = UserRepository(db)
    new_cert = UserCertificate(
        user_id=current_user.user_id,
        title=body.title,
        image_url=body.image_url
        # created_at sẽ tự động (nếu model có server_default)
    )

    # Dùng hàm của repo (hàm này tự commit)
    try:
        created_cert = repo.create_certificate(new_cert)
        return created_cert
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu bằng cấp: {e}")


@router.delete("/me/certificates/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_certificate(
        cert_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Xóa một bằng cấp của user đang đăng nhập."""
    repo = UserRepository(db)

    # Lấy cert và kiểm tra xem nó có thuộc user này không
    cert_to_delete = repo.get_certificate_by_id(cert_id, current_user.user_id)

    if not cert_to_delete:
        raise HTTPException(status_code=404, detail="Không tìm thấy bằng cấp")

    try:
        repo.delete_certificate(cert_to_delete)  # Hàm này tự commit
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xóa bằng cấp: {e}")