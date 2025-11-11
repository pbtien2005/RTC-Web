from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, students, admin
from fastapi.staticfiles import StaticFiles 
import os 

# --- SỬA Ở ĐÂY ---
AVATAR_UPLOAD_DIR = "static/avatars"
CERT_UPLOAD_DIR = "static/certificates" # <-- Thêm
os.makedirs(AVATAR_UPLOAD_DIR, exist_ok=True)
os.makedirs(CERT_UPLOAD_DIR, exist_ok=True) # <-- Thêm
# ------------------

app = FastAPI(
    debug=True,
    servers=[
        {"url": "http://127.0.0.1:8000", "description": "Local server"}
    ]
)

app.mount("/static", StaticFiles(directory="static"), name="static") 

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(admin.router) 

origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

@app.on_event("startup")
def startup_event():
    print("DB connected")