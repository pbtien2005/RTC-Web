from fastapi import APIRouter, FastAPI,WebSocket, WebSocketDisconnect,Request,Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import json
from fastapi.staticfiles import StaticFiles
from ws.connection_manager import ConnectionManager
from auth.dependencies import get_current_user


ws_router=APIRouter()

        
manager=ConnectionManager()


@ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket,user=Depends(get_current_user)):
    await manager.connect(websocket,user.user_id) #Nhan ket noi tu client
    
    try:
        while True:
            data=await websocket.receive_text()
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                payload = {"data": data}
                await manager.send_personal_message(client_id, "invalid JSON", websocket)
                continue
            client_id=user.user_id
            type=payload.get("type")
            to_id=payload.get("to")   
            data=payload.get("data")

            await manager.send_1_to_1(type,client_id,to_id,data)

            # if payload.get("type")=="message.send":
            #     if to_id is not None:
            #         await manager.send_1_to_1(client_id,str(to_id),f'{payload.get("id")}: {payload.get("data")}',"message.receive")
            #     else: 
            #         await manager.send_personal_message(client_id,"Please pick one target!",websocket)
            # elif payload.get("type")=="friend.request":
            #     await manager.send_1_to_1(client_id,str(to_id),"Do you want to accept the connection request?","request.receive")
            # elif payload.get("type")=="request.send.accept":
            #     await manager.send_1_to_1(client_id,to_id,f"User {client_id} accepted your connection request","request.receive.accept")
            # elif payload.get("type")=="request.send.reject":
            #     await manager.send_1_to_1(client_id,to_id,f"You're rejected by {client_id}","request.receive.reject")
            # elif payload.get("type")=="call.request":
            #     await manager.send_1_to_1(client_id,to_id,f"You're called by {client_id}","call.request")
            # elif payload.get("type")=="call.accept":
            #     await manager.send_1_to_1(client_id,to_id,f"user {client_id} accepted your call","call.accept")
            # elif payload.get("type")=="call.ice":
            #     await manager.send_1_to_1(client_id,to_id,payload.get("data"),"call.ice")
            # elif payload.get("type")=="call.offer":
            #     await manager.send_1_to_1(client_id,to_id,payload.get("data"),"call.offer")
            # elif payload.get("type")=="call.answer":
            #     await manager.send_1_to_1(client_id,to_id,payload.get("data"),"call.answer")
            # elif payload.get("type")=="call.end":
            #     await manager.send_1_to_1(client_id,to_id,f"user {client_id} left the call!","call.end")
            # elif payload.get("type")=="connect.end":
            #     await manager.send_1_to_1(client_id,to_id,f"user {client_id} left the chat!","connect.end")

    
    except WebSocketDisconnect:
        await manager.disconnect(client_id)
