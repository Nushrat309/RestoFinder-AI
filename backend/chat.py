import os

from dotenv import load_dotenv
from google import genai

from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """
You are RestoFinder AI, a helpful restaurant assistant.

Your responsibilities:
- Help users find restaurants based on a location.
- Give short, clear, and friendly answers.
- If the location is not provided, politely ask for it.
- Do not make up restaurant details.
- If you are unsure, say that the information may not be accurate.
- For each recommended restaurant, ALWAYS include a Google Maps search link in markdown format so the user can easily find it.
  Example format: `[Restaurant Name on Maps](https://www.google.com/maps/search/?api=1&query=url_encoded_search_query)` (e.g., `[Pizza Hut Dhanmondi on Maps](https://www.google.com/maps/search/?api=1&query=Pizza+Hut+Dhanmondi+Dhaka)`).
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