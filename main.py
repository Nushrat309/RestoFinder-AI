from fastapi import FastAPI
from pydantic import BaseModel
from chat import chat

app = FastAPI()


@app.get("/")
def read_root():
    return {
        "message": "Welcome to FastAPI!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "OK"
    }


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    response = chat(request.message)
    return {
        "response": response
    }