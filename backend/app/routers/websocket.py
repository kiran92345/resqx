from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.ws_manager import manager

router = APIRouter()


@router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Clients don't need to send anything; this just keeps the
            # connection open and lets the server push events.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
