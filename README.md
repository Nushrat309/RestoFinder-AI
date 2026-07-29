# RestoFinder AI 🍽️🤖

RestoFinder AI is a production-grade, interactive restaurant discovery and food explorer application covering major cities in Bangladesh (including Dhaka, Chattogram, Sylhet, Rajshahi, and more). Inspired by modern ChatGPT-style chat interfaces, it integrates a smart LLM assistant with an interactive map pane to offer a seamless dining search experience.

The platform is powered by the **Google Gemini 2.5 Flash** model via the official `google-genai` SDK, featuring smart query intent extraction and a database retrieval scoring algorithm to find and recommend real restaurants.

---

## 🌟 Core Features

- 💬 **ChatGPT-style Assistant**: A collapsible navigation sidebar for managing chat threads (create new chats, name chats based on prompt, delete chats, clear history).
- ⚡ **Real-Time Token Streaming**: High-performance SSE (Server-Sent Events) streaming that lets you watch the AI response type out token-by-token. Supports fallback to non-streaming if configured.
- 🎯 **Location & Intent-Aware Matching**: 
  - An intelligent local keyword and entity-extraction pipeline parsing your query (extracting city, area/neighborhood, price budget, rating limits, cuisines, dishes).
  - A retrieval-scoring mechanism that filters and ranks candidates from a database of **500+ restaurants**, injecting the top matches into the system instructions to prevent LLM hallucinations.
- 🗺️ **Interactive Leaflet Map & Explorer**:
  - Live map rendering of restaurants.
  - Interactive filters for City, Area, Cuisine, budget price limits, and dietary options (Veg, Gluten-Free, In-stock).
  - Interactive map markers, detail links, and tabs for **Map view**, **Restaurants list**, **Food grid**, and **Favorites**.
- 🍔 **Detailed Menu & Interactive Modals**:
  - **Menu Modal**: Explore detailed menus of restaurants, categorize dishes, and check pricing in BDT (৳).
  - **Auth Modal**: Register, log in, or manage your user profile (session persistent via `localStorage`).
  - **Settings Modal**: Customize preferences (default city, max price limit), toggle Light/Dark themes, clear chat history, or perform a full factory reset.
  - **Help & FAQ Modal**: Structured guidelines on typical search queries and usage.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Vite-based SPA)
- **Styling**: Tailwind CSS & Vanilla HSL variables (for themes)
- **Map Library**: Leaflet.js (React-Leaflet)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **AI Integration**: Google GenAI SDK (`google-genai` library)
- **Deployment & Server**: Uvicorn
- **Testing**: Pytest & FastAPI TestClient
- **Configuration**: Python-dotenv (for environment variable injection)

---

## 📂 Project Structure

```text
RestoFinder-AI/
├── backend/                        # Main backend application
│   ├── data/
│   │   └── restaurants.json        # Database with 500+ restaurants (~13.9 MB)
│   ├── scripts/
│   │   └── generate_restaurants_db.py  # Mock database generator & populator
│   ├── tests/
│   │   └── test_streaming.py      # Unit tests for streaming & endpoints
│   ├── chat.py                     # Gemini models, intent extraction, & scoring logic
│   ├── main.py                     # FastAPI server, endpoints, & SSE generator
│   └── requirements.txt            # Python dependencies
├── frontend/                       # React frontend application
│   ├── public/                     # Static files & map assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx       # Login/Sign-up flow modal
│   │   │   ├── ChatArea.jsx        # Conversational UI & messaging state
│   │   │   ├── ExplorerPane.jsx    # Leaflet map, listings, & advanced filters
│   │   │   ├── HelpFAQModal.jsx    # User guide and FAQ
│   │   │   ├── MenuModal.jsx       # Restaurant menu display & item cards
│   │   │   ├── SettingsModal.jsx   # Prefs, theme switching, & data clearing
│   │   │   ├── Sidebar.jsx         # Collapsible chat thread manager & menu links
│   │   │   └── TopNav.jsx          # Mobile toggles, theme trigger, & user profile
│   │   ├── App.jsx                 # Core orchestrator component
│   │   ├── index.css               # HSL theme system, global resets, & custom scrollbars
│   │   └── main.jsx                # React Entry point
│   ├── package.json
│   ├── tailwind.config.js          # Tailwind theme configurations
│   └── vite.config.js
├── .env                            # Environment variables (API Key)
├── chat.py                         # Root-level console application runner
├── main.py                         # Root-level FastAPI router (backup/delegator)
└── requirements.txt                # Root-level backend package listings
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 18.0 or higher
- **Gemini API Key**: Obtain a key from the [Google AI Studio](https://aistudio.google.com/)

### 2. Configuration Setup
Create a `.env` file in the root directory (or inside the `/backend` folder):
```env
GEMINI_API_KEY=your_gemini_api_key_here
ENABLE_STREAMING=true
```

### 3. Backend Setup
Navigate to the root or backend directory and install Python dependencies:
```bash
# Optional: Create a virtual environment
python -m venv venv
source venv/bin/activate # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

To run the FastAPI server:
```bash
# Run backend on port 8000
python backend/main.py
```
The backend API will be available at `http://localhost:8000`. You can view the Interactive OpenAPI Docs at `http://localhost:8000/docs`.

To run the console chat version:
```bash
python backend/chat.py
```

To execute unit tests:
```bash
pytest backend/tests/test_streaming.py
```

### 4. Frontend Setup
Open a new terminal session, navigate to the `/frontend` directory, and install npm dependencies:
```bash
cd frontend

# Install Node modules
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend application will be running at `http://localhost:3000` (or the port specified in the Vite console).

---

## 🔌 API Endpoints

### `GET /`
Returns a general welcome message.

### `GET /health`
Verifies that the service and database cache are online. Returns the total count of parsed restaurants in memory.

### `GET /api/restaurants`
Retrieves the restaurant list. Supports the following query parameters:
* `city` (string): Filter by city (Dhaka, Chattogram, Sylhet, etc.)
* `area` (string): Filter by area (Dhanmondi, Gulshan, Banani, etc.)
* `search` (string): Search text match for names, cuisines, or menu items.
* `max_price` (integer): Maximum BDT price limit for menu items.
* `min_rating` (float): Filter restaurants above a specific rating threshold.

### `POST /chat`
Submits a chat history prompt.
* **Payload**: `{"contents": [{"role": "user", "parts": [{"text": "Recommend Kacchi"}]}], "stream": boolean}`
* **Response**: Stream of SSE chunks `data: {"token": "...", "done": false}` if streaming is enabled; otherwise a single JSON response `{"response": "..."}`.

### `POST /chat/stream`
Forces SSE streaming response for the conversation history.

---

## 💡 Example Prompt Queries to Try

- *"Find me a good Kacchi place under ৳400 in Dhaka"*
- *"Where can I get high-rated burgers in Banani?"*
- *"Show me restaurants in Cox's Bazar with seafood"*
- *"I have a budget of 300 taka, what snacks can I eat in Chattogram?"*

---

## 🔒 License
This project is open-source and available under the MIT License.
