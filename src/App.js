import React, { useEffect, useRef, useState } from "react";
import './App.css';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

function ChatMessage({ m }) {
  const isUser = m.sender === "user";
  return (
    <div className="conversation" style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", margin: "6px 0" }}>
      <div style={{
        maxWidth: "75%",
        padding: "10px 14px",
        borderRadius: 14,
        color: isUser ? "white" : "rgba(139, 38, 217, 1)",
        background: isUser ? "rgba(139, 38, 217, 1)" : "#f6f5f5ff",
        boxShadow: "0 1px 1px rgba(82, 81, 81, 0.05)"
      }}>
        {m.text}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello — ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
  const text = input.trim();
  if (!text) return;

  const newMessages = [...messages, { sender: "user", text }];
  setMessages(newMessages);
  setInput("");
  setLoading(true);

  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await response.json();
    const botText = data.response;

    setMessages(prev => [...prev, { sender: "bot", text: botText }]);
  } catch (err) {
    setMessages(prev => [...prev, { sender: "bot", text: "Network error. Check backend." }]);
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="container" style={{
      maxWidth: 720,
      margin: "24px auto",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }}>
      <h1>Gemini Chat</h1>

      <div ref={scrollRef} className="boot" style={{
        height: 520,
        overflowY: "auto",
        border: "1px solid #ddd",
        padding: 12,
        borderRadius: 8,
        background: "#fff",
      
        }}    >
        {messages.map((m, i) => <ChatMessage key={i} m={m} />)}
        {loading && <div style={{ color: "#b8b6b6ff", marginTop: 8 }}>Thinking...</div>}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input className="message_input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          style={{ flex: 1, padding: "10px 12px", borderRadius: 15, border: "1px  #dad6d6ff" }}
        />
        <button className="sendButton" onClick={sendMessage} disabled={loading} style={{ padding: "10px 14px", borderRadius: 8 }}>
          Send
        </button>
      </div>
    </div>
  );
}
