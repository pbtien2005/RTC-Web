import json
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str,WebSocket]={}
    
    async def connect(self,websocket: WebSocket,id_client: str):
        self.active_connections[id_client]=websocket
        print(self.active_connections)


    
    async def disconnect(self,id_client: str):
        self.active_connections.pop(id_client,None)
        leave_msg = json.dumps({"type": "leave", "id": id_client})
        for ws in self.active_connections.values():
            await ws.send_text(leave_msg)
    
    async def send_personal_message(self, client_id: str, message: str, websocket: WebSocket):
        """Gửi lại cho chính client (echo)"""
        payload = {"type": "message.receive","id": client_id, "data": message}
        await websocket.send_text(json.dumps(payload))


    async def broadcast(self, sender_id: str, message: str):
        """Gửi cho tất cả mọi người (bao gồm cả người gửi, tùy bạn)"""
        payload = {"id": sender_id, "data": message}
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
