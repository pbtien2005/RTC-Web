from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth,students

app=FastAPI(debug=True)

app.include_router(auth.router)
app.include_router(students.router)

origins = [
    "http://localhost:5173",   
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # domain được phép gọi
    allow_credentials=True,
    allow_methods=["*"],             # GET, POST, PUT, DELETE, ...
    allow_headers=["*"],             # cho phép mọi header (Authorization, Content-Type, ...)
)

@app.on_event("startup")
def startup_event():
    print("DB connected")

