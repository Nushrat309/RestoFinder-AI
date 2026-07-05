import os

from dotenv import load_dotenv
from google import genai

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
"""

def chat(user_message: str) -> str:
    prompt = f"""
{SYSTEM_PROMPT}

User: {user_message}

Assistant:
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return response.text


def main():
    print("🍽️ Welcome to RestoFinder AI")
    print("Type 'exit' to quit.\n")

    while True:
        user_input = input("You: ")

        if user_input.lower() in ["exit", "quit"]:
            print("Bot: Goodbye!")
            break

        reply = chat(user_input)
        print(f"Bot: {reply}\n")


if __name__ == "__main__":
    main()