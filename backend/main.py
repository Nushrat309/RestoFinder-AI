import json
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import chat

app = FastAPI(title="RestoFinder AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data into memory for fast querying
DATA_PATH = Path(__file__).parent / "data" / "restaurants.json"
try:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        RESTAURANTS_CACHE = json.load(f)
except Exception as e:
    print(f"Error loading database: {e}")
    RESTAURANTS_CACHE = []


@app.get("/")
def read_root():
    return {
        "message": "Welcome to RestoFinder AI 500+ Restaurant Discovery API!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "total_restaurants": len(RESTAURANTS_CACHE)
    }


@app.get("/api/restaurants")
def get_restaurants(
    city: Optional[str] = Query(None, description="Filter by City (e.g. Dhaka, Chittagong, Sylhet, Rajshahi)"),
    area: Optional[str] = Query(None, description="Filter by Area (e.g. Dhanmondi, Gulshan, Banani, Uttara)"),
    search: Optional[str] = Query(None, description="Search query for restaurant name, cuisine, or dish"),
    max_price: Optional[int] = Query(None, description="Maximum budget price limit"),
    min_rating: Optional[float] = Query(None, description="Minimum star rating"),
    limit: Optional[int] = Query(600, description="Max restaurants to return")
):
    try:
        results = RESTAURANTS_CACHE

        # Filter City
        if city and city.lower() != 'all':
            results = [r for r in results if r.get('city', 'Dhaka').lower() == city.lower()]

        # Filter Area
        if area and area.lower() != 'all':
            results = [r for r in results if r.get('area', r.get('location', '')).lower() == area.lower()]

        # Filter Rating
        if min_rating:
            results = [r for r in results if float(r.get('rating', 0)) >= min_rating]

        # Filter Search Query & Price
        if search or max_price:
            filtered = []
            q = search.lower() if search else ""
            for rest in results:
                # Name/Cuisine/Location match
                match_rest = not q or (
                    q in rest.get('name', '').lower() or
                    q in rest.get('cuisine', '').lower() or
                    q in rest.get('area', rest.get('location', '')).lower() or
                    q in rest.get('city', '').lower()
                )

                # Menu match
                match_menu = False
                for item in rest.get('menu', []):
                    item_name_match = not q or q in item.get('name', '').lower() or q in item.get('category', '').lower()
                    price_match = not max_price or item.get('price', 0) <= max_price
                    if item_name_match and price_match:
                        match_menu = True
                        break

                if (match_rest and not max_price) or match_menu:
                    filtered.append(rest)
            results = filtered

        return results[:limit]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load restaurant data: {str(e)}"
        )


class MessagePart(BaseModel):
    text: str


class ChatMessage(BaseModel):
    role: str
    parts: list[MessagePart]


class ChatRequest(BaseModel):
    contents: list[ChatMessage]
    stream: Optional[bool] = None


def format_chat_contents(contents: list[ChatMessage]) -> list[dict]:
    api_contents = []
    for msg in contents:
        parts_list = []
        for part in msg.parts:
            parts_list.append({"text": part.text})
        api_contents.append({
            "role": msg.role,
            "parts": parts_list
        })
    return api_contents


def sse_event_generator(api_contents: list[dict]):
    try:
        if not getattr(chat, "ENABLE_STREAMING", True):
            response_text = chat.chat(api_contents)
            yield f"data: {json.dumps({'token': response_text, 'done': False})}\n\n"
        else:
            for token in chat.chat_stream(api_contents):
                yield f"data: {json.dumps({'token': token, 'done': False})}\n\n"
        yield f"data: {json.dumps({'token': '', 'done': True})}\n\n"
    except Exception as e:
        error_msg = str(e)
        if "RESOURCE_EXHAUSTED" in error_msg or "quota" in error_msg.lower():
            err_detail = "Gemini API Quota Exceeded. Please try again in a few moments."
        else:
            err_detail = f"AI Service Error: {error_msg}"
        yield f"data: {json.dumps({'error': err_detail, 'done': True})}\n\n"


@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    api_contents = format_chat_contents(request.contents)
    
    enable_streaming = getattr(chat, "ENABLE_STREAMING", True)
    if request.stream is False or not enable_streaming:
        try:
            response = chat.chat(api_contents)
            return {
                "response": response
            }
        except Exception as e:
            error_msg = str(e)
            if "RESOURCE_EXHAUSTED" in error_msg or "quota" in error_msg.lower():
                raise HTTPException(
                    status_code=429, 
                    detail="Gemini API Quota Exceeded. Please try again in a few moments."
                )
            raise HTTPException(status_code=500, detail=f"AI Service Error: {error_msg}")

    return StreamingResponse(
        sse_event_generator(api_contents),
        media_type="text/event-stream"
    )


@app.post("/chat/stream")
def chat_stream_endpoint(request: ChatRequest):
    api_contents = format_chat_contents(request.contents)
    return StreamingResponse(
        sse_event_generator(api_contents),
        media_type="text/event-stream"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)