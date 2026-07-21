import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from main import app
import chat

client = TestClient(app)


def test_health_check():
    """Verify health endpoint returns HTTP 200 and restaurant count."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert "total_restaurants" in data


def test_chat_non_streaming(monkeypatch):
    """Verify POST /chat with stream: False returns standard JSON response (backward compatibility)."""
    monkeypatch.setattr(chat, "chat", lambda contents: "Here is a restaurant recommendation in Dhanmondi.")
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": "Hello, recommend a good restaurant in Dhanmondi"}]
            }
        ],
        "stream": False
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert isinstance(data["response"], str)
    assert len(data["response"]) > 0


def test_chat_streaming_sse(monkeypatch):
    """Verify POST /chat/stream returns Server-Sent Events stream with token frames."""
    def mock_stream(contents):
        yield "Top "
        yield "burgers in Gulshan"
    monkeypatch.setattr(chat, "chat_stream", mock_stream)

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": "Recommend top 2 burgers in Gulshan"}]
            }
        ]
    }
    response = client.post("/chat/stream", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")

    # Read SSE body content
    content = response.text
    assert "data: {" in content
    assert '"done": true' in content or '"done":True' in content or '"done": true' in content.lower()


def test_chat_endpoint_default_streaming(monkeypatch):
    """Verify POST /chat without stream parameter returns SSE stream when ENABLE_STREAMING is true."""
    def mock_stream(contents):
        yield "Hi "
        yield "there!"
    monkeypatch.setattr(chat, "chat_stream", mock_stream)

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": "Hi"}]
            }
        ]
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")


def test_chat_stream_fallback_when_disabled(monkeypatch):
    """Verify chat_stream falls back gracefully to non-streaming when ENABLE_STREAMING=False."""
    monkeypatch.setattr(chat, "ENABLE_STREAMING", False)
    monkeypatch.setattr(chat, "chat", lambda contents: "Fallback response when disabled.")

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": "Test disabled stream"}]
            }
        ],
        "stream": False
    }
    response = client.post("/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data

