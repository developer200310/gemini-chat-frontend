from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

GENAI_API_KEY = os.getenv("GENAI_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "models/gemini-flash-latest")

if not GENAI_API_KEY:
    raise RuntimeError("GENAI_API_KEY not set")

genai.configure(api_key=GENAI_API_KEY)
model = genai.GenerativeModel(MODEL_NAME)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict later
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    sender: str
    text: str

class ChatRequest(BaseModel):
    messages: List[Message]

@app.post("/api/chat")
async def chat(req: ChatRequest):
    try:
        parts = []
        for m in req.messages:
            role = "User" if m.sender.lower() == "user" else "Assistant"
            parts.append(f"{role}: {m.text.strip()}")
        parts.append("Assistant:")
        prompt = "\n".join(parts)

        response = model.generate_content(prompt)
        reply = response.text.strip() if hasattr(response, "text") else str(response)

        return {"response": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
