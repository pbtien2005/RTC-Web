from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, students, chat, booking, coacher, user, availability , session,slot

from ws.routes import ws_router


app=FastAPI(debug=True)


app.include_router(auth.router)
app.include_router(booking.router)
app.include_router(students.router)
app.include_router(availability.router)
app.include_router(chat.router)
app.include_router(slot.router)
app.include_router(ws_router)

app.include_router(coacher.router)
app.include_router(user.router)
app.include_router(session.router)



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



