"""
Simple in-memory WebSocket connection manager. Broadcasts JSON events
(new incident, priority change, stock alert, dispatch update) to every
connected Admin/Citizen client. For multi-instance deployments, swap
the in-memory set for a Redis pub/sub backed fan-out.
"""
import json
from typing import List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, event_type: str, payload: dict) -> None:
        message = json.dumps({"type": event_type, "payload": payload})
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                dead.append(connection)
        for d in dead:
            self.disconnect(d)


manager = ConnectionManager()
