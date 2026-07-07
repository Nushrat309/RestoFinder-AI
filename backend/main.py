from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chat import chat

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



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


class MessagePart(BaseModel):
    text: str


class ChatMessage(BaseModel):
    role: str
    parts: list[MessagePart]


class ChatRequest(BaseModel):
    contents: list[ChatMessage]


@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    api_contents = []
    for msg in request.contents:
        parts_list = []
        for part in msg.parts:
            parts_list.append({"text": part.text})
        api_contents.append({
            "role": msg.role,
            "parts": parts_list
        })
    response = chat(api_contents)
    return {
        "response": response
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)