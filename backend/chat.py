import os
import json
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Load restaurant database
data_path = Path(__file__).parent / "data" / "restaurants.json"
try:
    with open(data_path, "r", encoding="utf-8") as f:
        RESTAURANTS_DATA = json.load(f)
except Exception as e:
    RESTAURANTS_DATA = []

# Format a condensed string of the database for the system prompt
db_summary = json.dumps(RESTAURANTS_DATA, indent=2)

SYSTEM_PROMPT = f"""
You are RestoFinder AI, a helpful restaurant & menu recommendation assistant.

You have access to the following restaurant database in Dhaka:
{db_summary}

Your responsibilities:
1. Recommend restaurants and menus ONLY from the database above. Do not recommend or make up any other restaurants.
2. Support budget-based queries (e.g., "under ৳300"), dietary tags (e.g., "Veg", "Non-Veg", "Gluten-Free"), category filters (e.g., "Burgers", "Sides", "Drinks", "Dessert", "Main Course"), and location queries (e.g., "Dhanmondi", "Banani", "Gulshan"). Perform accurate calculations on item prices to ensure they meet the budget.
3. For each recommended restaurant, ALWAYS include:
   - A Google Maps search link: `[Restaurant Name on Maps](https://www.google.com/maps/search/?api=1&query=url_encoded_search_query)` (e.g. `[Burger Lab Dhanmondi on Maps](https://www.google.com/maps/search/?api=1&query=Burger+Lab+Dhanmondi+Dhaka)`).
   - An interactive button command to explore their menu in the UI, formatted exactly as: `[Explore Menu: restaurant-id]` (e.g., `[Explore Menu: burger-lab]`). The frontend will parse this and render it as a clickable button.
4. Keep answers short, clear, friendly, and structured. Use markdown lists and bold text for item names and prices (e.g., "**Smoky Grill Burger** - ৳280").
"""

def chat(contents: list) -> str:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT
        )
    )

    return response.text


def main():
    print("🍽️ Welcome to RestoFinder AI")
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