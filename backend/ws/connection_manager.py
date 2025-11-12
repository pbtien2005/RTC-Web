import json
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str,WebSocket]={}
    
    async def connect(self,websocket: WebSocket,id_client: str):
        self.active_connections[id_client]=websocket
        print(self.active_connections)

        payload1 = {
            "type": "user.online",
            "sender_id": id_client,
        }
        await self.broadcast(payload1)

        others_online = [uid for uid in self.active_connections.keys() if uid != id_client]
        payload2 = {
            "type": "user.online_list",
            "data": others_online
        }
        await self.send_personal_message(payload2,websocket)
   
    def list_active_user(self):
        return self.active_connections.keys()

    
    async def disconnect(self,id_client: str):
        self.active_connections.pop(id_client,None)
        payload = {
            "type":"user.offline",
            "sender_id": id_client,
        }
        for ws in self.active_connections.values():
            await ws.send_text(json.dumps(payload))
    
    async def send_personal_message(self, payload,websocket: WebSocket):
        """Gửi lại cho chính client (echo)"""
        await websocket.send_text(json.dumps(payload))


    async def broadcast(self, payload):
        """Gửi cho tất cả mọi người (bao gồm cả người gửi, tùy bạn)"""
        for ws in self.active_connections.values():
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                continue  # tránh crash nếu WS đã đóng


    async def send_1_to_1(self, payload):
        """Gửi riêng 1-1"""
        ws = self.active_connections.get(str(payload["receiver_id"])) 
        print("đã gửi ",payload["receiver_id"],ws)
        if ws:
            await ws.send_text(json.dumps(payload))
