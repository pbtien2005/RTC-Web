import json
from fastapi import WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str,WebSocket]={}
    
    async def connect(self,websocket: WebSocket,id_client: str):
        await websocket.accept()
        self.active_connections[id_client]=websocket

        peers = [cid for cid in self.active_connections.keys() if cid != id_client]
        await websocket.send_text(json.dumps({"type": "peers", "list": peers}))

        # ✅ báo cho người khác là id_client vừa vào
        join_msg = json.dumps({"type": "join", "id": id_client})
        for cid, ws in self.active_connections.items():
            if cid != id_client:
                await ws.send_text(join_msg)

    
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


    async def send_1_to_1(self, sender_id: str, target_id: str, message: str,type: str):
        """Gửi riêng 1-1"""
        ws = self.active_connections.get(target_id)
        if ws:
            payload = {"type":type,"id": sender_id, "data": message}
            await ws.send_text(json.dumps(payload))