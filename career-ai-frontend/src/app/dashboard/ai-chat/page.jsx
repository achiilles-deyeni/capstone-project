import React, { useState, useRef, useEffect } from "react";
import API from "@/services/api";
import { Card } from "@/components/ui/card";

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    { role: "system", text: "You are a helpful career assistant." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const prompt = `${messages
        .map((m) => `${m.role}: ${m.text}`)
        .join("\n")}\nuser: ${input}`;
      const res = await API.post("/api/ai/generate", { prompt });
      const aiText = res.data.explanation || res.data.title || "(no response)";
      setMessages((m) => [...m, { role: "assistant", text: aiText }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "AI service unavailable." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <h1 className="h4 mb-3">Chat with AI</h1>
      <Card>
        <div
          style={{ height: 400, overflow: "auto" }}
          ref={listRef}
          className="p-3"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`mb-3 ${
                m.role === "user" ? "text-end" : "text-start"
              }`}
            >
              <div
                className={`d-inline-block p-2 rounded ${
                  m.role === "user" ? "bg-primary text-white" : "bg-light"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-top">
          <div className="d-flex gap-2">
            <input
              className="form-control"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI about career paths, resources, or advice"
            />
            <button
              className="btn btn-primary"
              onClick={send}
              disabled={loading}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
