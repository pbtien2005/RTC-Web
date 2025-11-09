from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth,students,chat_request,conversation

from ws.routes import ws_router


app=FastAPI(debug=True)


app.include_router(auth.router)
app.include_router(students.router)
app.include_router(chat_request.router)
app.include_router(ws_router)
app.include_router(conversation.router)
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



