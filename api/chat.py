from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.requests import Request
import os
import google.generativeai as genai

# Configure Gemini
GENAI_API_KEY = os.environ.get("GENAI_API_KEY")
MODEL_NAME = os.environ.get("MODEL_NAME", "models/gemini-flash-latest")
genai.configure(api_key=GENAI_API_KEY)
model = genai.GenerativeModel(MODEL_NAME)

app = Starlette()

@app.route("/chat", methods=["POST"])
async def chat(request: Request):
    data = await request.json()
    messages = data.get("messages", [])

    parts = []
    for m in messages:
        role = "User" if m["sender"] == "user" else "Assistant"
        parts.append(f"{role}: {m['text']}")
    parts.append("Assistant:")
    prompt = "\n".join(parts)

    response = model.generate_content(prompt)
    return JSONResponse({"response": response.text})
