import base64
import re
import uuid
import os
import binascii
from fastapi import HTTPException, status
from models.user import User

# --- SỬA LOGIC LƯU FILE ---

# 1. Định nghĩa đường dẫn gốc của thư mục backend
# (Giả sử file utils.py nằm trong /core, chúng ta lùi 1 cấp)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 2. Định nghĩa đường dẫn tuyệt đối
STATIC_DIR = os.path.join(BASE_DIR, "static")
AVATAR_UPLOAD_DIR = os.path.join(STATIC_DIR, "avatars")
CERT_UPLOAD_DIR = os.path.join(STATIC_DIR, "certificates") 

# (Đảm bảo 2 thư mục này tồn tại - file main.py đã làm)

def _save_base64_to_file(user: User, base64_str: str, upload_dir: str, file_prefix: str) -> str:
    """Hàm helper chung để giải mã và lưu file"""
    try:
        header, data = base64_str.split(',', 1)
        file_ext_match = re.search(r'image/(png|jpeg|jpg|webp)', header)
        if not file_ext_match:
            raise HTTPException(status_code=400, detail="Định dạng ảnh không hợp lệ (chỉ .png, .jpg, .webp).")
        
        file_ext = f".{file_ext_match.group(1).replace('jpeg', 'jpg')}"
        decoded_data = base64.b64decode(data)

    except (ValueError, TypeError, binascii.Error):
        raise HTTPException(status_code=400, detail="Định dạng chuỗi Base64 không hợp lệ.")

    unique_filename = f"{file_prefix}_{user.user_id}_{uuid.uuid4()}{file_ext}"
    
    # 3. Dùng đường dẫn TUYỆT ĐỐI để lưu
    file_path = os.path.join(upload_dir, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(decoded_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Không thể lưu file ảnh: {str(e)}")

    # 4. Trả về URL tương đối (để FE sử dụng)
    relative_dir = os.path.basename(upload_dir) # (ví dụ: "avatars" hoặc "certificates")
    return f"/static/{relative_dir}/{unique_filename}"

def save_base64_string_as_avatar(user: User, base64_str: str) -> str:
    """Lưu ảnh avatar"""
    new_avatar_url = _save_base64_to_file(user, base64_str, AVATAR_UPLOAD_DIR, "user")
    
    # Xóa avatar CŨ (nếu có)
    if user.avatar_url and user.avatar_url.startswith("/static/"):
        # Chuyển URL (/static/...) thành đường dẫn tuyệt đối
        old_avatar_path = os.path.join(BASE_DIR, user.avatar_url.lstrip('/'))
        if os.path.exists(old_avatar_path):
            os.remove(old_avatar_path)
            
    return new_avatar_url

def save_base64_string_as_certificate(user: User, base64_str: str) -> str:
    """Lưu ảnh chứng chỉ"""
    # Chỉ lưu file (dùng helper)
    return _save_base64_to_file(user, base64_str, CERT_UPLOAD_DIR, "cert")