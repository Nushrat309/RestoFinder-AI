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
    from fastapi import HTTPException
    
    api_contents = []
    for msg in request.contents:
        parts_list = []
        for part in msg.parts:
            parts_list.append({"text": part.text})
        api_contents.append({
            "role": msg.role,
            "parts": parts_list
        })
    
    try:
        response = chat(api_contents)
        return {
            "response": response
        }
    except Exception as e:
        error_msg = str(e)
        if "RESOURCE_EXHAUSTED" in error_msg or "quota" in error_msg.lower():
            raise HTTPException(
                status_code=429, 
                detail="Gemini API Quota Exceeded. You have hit the limit (20 requests/day) for this free tier API key. Please check your API usage or wait a bit before trying again."
            )
        raise HTTPException(status_code=500, detail=f"AI Service Error: {error_msg}")




if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)