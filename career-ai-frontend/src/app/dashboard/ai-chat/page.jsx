import React, { useState, useRef, useEffect } from "react";
import API from "@/services/api";
import { Card } from "@/components/ui/card";

const INITIAL_SYSTEM_MESSAGE = {
  role: "system",
  text: "You are a helpful career assistant. I can help you explore career paths, find learning resources, understand salary expectations, and discover job opportunities.",
  timestamp: Date.now(),
};

export default function AIChatPage() {
  const [messages, setMessages] = useState([INITIAL_SYSTEM_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatAIResponse = (data) => {
    // Create a comprehensive response from the AI data
    let response = "";

    if (data.title) {
      response += `**${data.title}**\n\n`;
    }

    if (data.explanation) {
      response += `${data.explanation}\n\n`;
    }

    if (data.average_salary) {
      response += `💰 **Average Salary:** ${data.average_salary}\n\n`;
    }

    if (data.job_openings) {
      response += `📊 **Job Market:** ${data.job_openings}\n\n`;
    }

    if (data.learning_resources && data.learning_resources.length > 0) {
      response += `📚 **Learning Resources:**\n`;
      data.learning_resources.forEach((resource, idx) => {
        const emoji =
          resource.type === "course"
            ? "🎓"
            : resource.type === "youtube"
            ? "📺"
            : resource.type === "book"
            ? "📖"
            : "📄";
        response += `${idx + 1}. ${emoji} [${resource.title}](${
          resource.url
        })\n`;
      });
      response += "\n";
    }

    if (data.youtube_video_recommendation) {
      response += `🎥 **Recommended Video:** [Watch on YouTube](${data.youtube_video_recommendation})\n`;
    }

    return (
      response.trim() ||
      "I received your request but couldn't generate a complete response. Please try rephrasing your question."
    );
  };

  const parseMarkdown = (text) => {
    // Simple markdown parser for bold and links
    let parsed = text;

    // Escape HTML to prevent XSS
    parsed = parsed
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Bold text (**text**)
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Links [text](url)
    parsed = parsed.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary text-decoration-underline">$1</a>'
    );

    // Line breaks
    parsed = parsed.replace(/\n/g, "<br/>");

    return parsed;
  };

  const send = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Clear any previous errors
    setError(null);

    // Add user message
    const userMsg = {
      role: "user",
      text: trimmedInput,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      // Build context from conversation history (last 5 messages for context)
      const recentMessages = messages.slice(-5);
      const contextPrompt = recentMessages
        .filter((m) => m.role !== "system")
        .map((m) => `${m.role}: ${m.text}`)
        .join("\n");

      const fullPrompt = contextPrompt
        ? `${contextPrompt}\nuser: ${trimmedInput}`
        : trimmedInput;

      console.log("Sending prompt to API:", fullPrompt);

      // Call API
      const res = await API.post("/api/ai/generate", { prompt: fullPrompt });

      console.log("API response:", res.data);

      // Format the response
      const formattedResponse = formatAIResponse(res.data);

      console.log("Formatted response:", formattedResponse);

      // Add a small delay to simulate typing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Add assistant message
      const assistantMsg = {
        role: "assistant",
        text: formattedResponse,
        timestamp: Date.now(),
        cached: res.data.cached || false,
        generationTime: res.data.generation_time_ms || null,
      };

      setMessages((m) => [...m, assistantMsg]);
    } catch (e) {
      console.error("AI request failed:", e);

      let errorMessage = "I'm having trouble connecting to the AI service. ";

      if (e.response) {
        switch (e.response.status) {
          case 429:
            errorMessage +=
              "You've sent too many requests. Please wait a moment and try again.";
            break;
          case 503:
            errorMessage +=
              "The AI service is temporarily unavailable. Please try again later.";
            break;
          case 400:
            errorMessage +=
              "There was an issue with your request. Please try rephrasing your question.";
            break;
          default:
            errorMessage += "Please try again in a moment.";
        }
      } else if (e.request) {
        errorMessage += "Please check your internet connection.";
      } else {
        errorMessage += "An unexpected error occurred.";
      }

      setError(errorMessage);

      // Add error message to chat
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: errorMessage,
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_SYSTEM_MESSAGE]);
    setError(null);
    inputRef.current?.focus();
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">💬 Chat with AI Career Assistant</h1>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={clearChat}
          disabled={loading || messages.length <= 1}
        >
          Clear Chat
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      <Card>
        {/* Messages Container */}
        <div
          style={{ height: 500, overflow: "auto" }}
          ref={listRef}
          className="p-3 bg-light"
        >
          {messages.map((m, i) => {
            if (m.role === "system") {
              return (
                <div key={i} className="mb-3 text-center">
                  <small className="text-muted fst-italic">{m.text}</small>
                </div>
              );
            }

            return (
              <div
                key={i}
                className={`mb-3 d-flex ${
                  m.role === "user"
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`position-relative ${
                    m.role === "user" ? "text-end" : "text-start"
                  }`}
                  style={{ maxWidth: "75%" }}
                >
                  <div
                    className={`d-inline-block p-3 rounded-3 shadow-sm ${
                      m.role === "user"
                        ? "bg-primary text-white"
                        : m.isError
                        ? "bg-danger text-white"
                        : "bg-white"
                    }`}
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.role === "assistant" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: parseMarkdown(m.text),
                        }}
                      />
                    ) : (
                      <div>{m.text}</div>
                    )}
                  </div>
                  <div className="mt-1">
                    <small className="text-muted">
                      {formatTimestamp(m.timestamp)}
                      {m.cached && " • Cached"}
                      {m.generationTime && ` • ${m.generationTime}ms`}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="mb-3 d-flex justify-content-start">
              <div className="bg-white p-3 rounded-3 shadow-sm">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Container */}
        <div className="p-3 border-top bg-white">
          <div className="d-flex gap-2">
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about career paths, salaries, learning resources..."
              disabled={loading}
              maxLength={2000}
            />
            <button
              className="btn btn-primary px-4"
              onClick={send}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                "Send"
              )}
            </button>
          </div>
          <div className="mt-2 d-flex justify-content-between">
            <small className="text-muted">
              Press Enter to send, Shift+Enter for new line
            </small>
            <small className="text-muted">{input.length}/2000</small>
          </div>
        </div>
      </Card>

      {/* Typing Indicator CSS */}
      <style jsx>{`
        .typing-indicator {
          display: flex;
          gap: 4px;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #6c757d;
          animation: typing 1.4s infinite;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
