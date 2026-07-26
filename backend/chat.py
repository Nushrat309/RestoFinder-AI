import os
import json
import re
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Load database on module startup
data_path = Path(__file__).parent / "data" / "restaurants.json"
try:
    with open(data_path, "r", encoding="utf-8") as f:
        RESTAURANTS_DATA = json.load(f)
except Exception as e:
    print(f"Error loading restaurants.json: {e}")
    RESTAURANTS_DATA = []

# List of known locations for entity extraction
ALL_AREAS = list(set([r.get("area", r.get("location")) for r in RESTAURANTS_DATA if r.get("area") or r.get("location")]))
ALL_CITIES = list(set([r.get("city", "Dhaka") for r in RESTAURANTS_DATA if r.get("city")]))


def extract_query_intent(user_text: str):
    """
    Extract area, city, price budget, and food keywords from user prompt.
    """
    text_lower = user_text.lower()

    # 1. Detect City
    detected_city = None
    if "chittagong" in text_lower:
        detected_city = "Chattogram"
    elif "coxs bazar" in text_lower or "cox bazar" in text_lower or "cox's bazar" in text_lower:
        detected_city = "Cox's Bazar"
    else:
        for city in ALL_CITIES:
            if city.lower() in text_lower:
                detected_city = city
                break

    # 2. Detect Area
    detected_area = None
    for area in ALL_AREAS:
        if area.lower() in text_lower:
            detected_area = area
            break

    # 3. Detect Budget / Price Limit
    budget = None
    price_matches = re.findall(r'(?:under|below|less than|within|৳|bdt|tk|\$)\s*(\d+)', text_lower)
    if price_matches:
        try:
            budget = int(price_matches[0])
        except ValueError:
            budget = None
    else:
        # Fallback standalone numbers if query mentions cheap / budget
        num_matches = re.findall(r'\b(\d{3,4})\b', text_lower)
        if num_matches and any(w in text_lower for w in ["under", "budget", "cheap", "max", "limit"]):
            try:
                budget = int(num_matches[0])
            except ValueError:
                budget = None

    # 4. Detect Keywords
    words = re.findall(r'\b[a-zA-Z]{3,}\b', text_lower)
    stop_words = {"the", "and", "for", "with", "near", "best", "top", "cheap", "good", "show", "recommend", "find", "where", "can", "get", "in", "at", "under", "restaurants", "food", "place", "places", "spots", "list"}
    keywords = [w for w in words if w not in stop_words and len(w) > 2]

    return {
        "city": detected_city,
        "area": detected_area,
        "budget": budget,
        "keywords": keywords,
        "text": text_lower
    }


def retrieve_relevant_restaurants(intent: dict, max_results: int = 20) -> list:
    """
    Intelligent candidate search & scoring algorithm to select top 15-20 matching restaurants
    from 500+ database for LLM context prompt.
    """
    target_city = intent.get("city")
    target_area = intent.get("area")
    budget = intent.get("budget")
    keywords = intent.get("keywords", [])
    raw_text = intent.get("text", "")

    scored_restaurants = []

    for rest in RESTAURANTS_DATA:
        score = 0
        rest_area = rest.get("area", rest.get("location", ""))
        rest_city = rest.get("city", "Dhaka")
        rest_name = rest.get("name", "")
        rest_cuisine = rest.get("cuisine", "")

        # City match
        if target_city:
            if rest_city.lower() == target_city.lower():
                score += 50
            else:
                score -= 100 # Penalize wrong city

        # Area match
        if target_area:
            if rest_area.lower() == target_area.lower():
                score += 80
            elif target_area.lower() in rest_area.lower():
                score += 40

        # Cuisine / Name match
        for kw in keywords:
            if kw in rest_name.lower():
                score += 35
            if kw in rest_cuisine.lower():
                score += 30

        # Menu matching & budget check
        matching_menu_items = []
        for item in rest.get("menu", []):
            item_name = item.get("name", "").lower()
            item_cat = item.get("category", "").lower()
            item_price = item.get("price", 0)

            # Price constraint check
            if budget and item_price > budget:
                continue

            # Check keyword match in food item
            item_score = 0
            for kw in keywords:
                if kw in item_name:
                    item_score += 40
                if kw in item_cat:
                    item_score += 25

            if budget and item_price <= budget:
                item_score += 15

            if item_score > 0 or (not keywords and budget and item_price <= budget):
                matching_menu_items.append(item)
                score += item_score

        # Rating boost
        score += float(rest.get("rating", 4.0)) * 5

        # Only include if score > 0 or if general query
        if score > 0 or (not target_area and not keywords and not budget):
            # Trim restaurant object to relevant menu items to conserve token budget
            condensed_rest = dict(rest)
            if matching_menu_items:
                condensed_rest["menu"] = matching_menu_items[:10]
            else:
                condensed_rest["menu"] = rest.get("menu", [])[:6]

            scored_restaurants.append((score, condensed_rest))

    # Sort candidates by score descending
    scored_restaurants.sort(key=lambda x: x[0], reverse=True)
    
    # Return top N candidates
    return [r[1] for r in scored_restaurants[:max_results]]


def build_system_prompt(candidates: list) -> str:
    db_summary = json.dumps(candidates, indent=2, ensure_ascii=False)
    
    return f"""
You are RestoFinder AI, a production-grade restaurant & food discovery platform assistant covering restaurants across multiple major cities and districts in Bangladesh (including Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh, Cox's Bazar, Cumilla, Bogura, Narayanganj, Gazipur, Jessore, etc.).

Here is the retrieved list of most relevant matching restaurants and menu items for the user's request:
{db_summary}

Your responsibilities:
1. Recommend restaurants, food items, and menus ONLY from the provided database snippet above. Do not invent outside restaurants.
2. Support searches by City, Area, Restaurant Name, Food Name, Cuisine, Budget limit, and Rating.
3. For each recommended restaurant, ALWAYS include:
   - Location details: City, Area, complete address.
   - Price range, Rating (⭐), and delivery/dine-in status.
   - Google Maps link: `[Restaurant Name on Maps](https://www.google.com/maps/search/?api=1&query=url_encoded_search_query)`.
   - Interactive UI button: `[Explore Menu: restaurant-id]`.
4. Present answers in a clear, friendly, structured markdown list with bold item names and prices in BDT (e.g. "**Mutton Kacchi Biryani** - ৳380").
"""


def chat(contents: list) -> str:
    # Get last user prompt to extract intent
    last_user_msg = ""
    for msg in reversed(contents):
        if msg.get("role") == "user":
            parts = msg.get("parts", [])
            if parts and isinstance(parts[0], dict):
                last_user_msg = parts[0].get("text", "")
            elif parts and isinstance(parts[0], str):
                last_user_msg = parts[0]
            break

    # Extract intent & retrieve candidate candidates
    intent = extract_query_intent(last_user_msg)
    top_candidates = retrieve_relevant_restaurants(intent, max_results=18)
    
    # Build dynamic prompt
    system_prompt = build_system_prompt(top_candidates)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt
        )
    )

    return response.text


def main():
    print("🍽️ Welcome to RestoFinder AI (500+ Restaurant Production Directory)")
    print("Type 'exit' to quit.\n")

    history = []
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Bot: Goodbye!")
            break

        history.append({
            "role": "user",
            "parts": [{"text": user_input}]
        })

        reply = chat(history)
        print(f"Bot: {reply}\n")

        history.append({
            "role": "model",
            "parts": [{"text": reply}]
        })


if __name__ == "__main__":
    main()