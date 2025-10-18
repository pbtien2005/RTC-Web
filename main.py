from fastapi import FastAPI,WebSocket, WebSocketDisconnect,Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import json
from fastapi.staticfiles import StaticFiles
from connection_manager import ConnectionManager
app=FastAPI(debug=True)

templates = Jinja2Templates(directory="templates")
app.mount("/rtc", StaticFiles(directory="templates/rtc"), name="rtc")

        
manager=ConnectionManager()

@app.get("/",response_class=HTMLResponse)
async def root(request:Request):
    return templates.TemplateResponse("index.html", {"request" : request})

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket,client_id: str):
    await manager.connect(websocket,client_id) #Nhan ket noi tu client
    try:
        while True:
            data=await websocket.receive_text()
            await manager.send_personal_message(client_id,f"you wrote: {data}",websocket)
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                payload = {"data": data}
            to_id=payload.get("to")   
            if payload.get("type")=="message.send":
                if to_id is not None:
                    await manager.send_1_to_1(client_id,str(to_id),data,"message.receive")
                else: 
                    await manager.send_personal_message(client_id,"Please pick one target!",websocket)
            elif payload.get("type")=="friend.request":
                await manager.send_1_to_1(client_id,str(to_id),"Do you want to accept the connection request?","request.receive")
            elif payload.get("type")=="request.send.accept":
                await manager.send_1_to_1(client_id,to_id,f"User {client_id} accepted your connection request","request.receive.accept")
            elif payload.get("type")=="request.send.reject":
                await manager.send_1_to_1(client_id,to_id,f"You're rejected by {client_id}","request.receive.reject")
    
    except WebSocketDisconnect:
        await manager.disconnect(client_id)
