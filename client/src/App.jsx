import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Pozdravljen! Kako ti lahko pomagam?",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  async function sendMessage() {
    const userMessage = message.trim();

    if (userMessage === "" || isTyping) return;

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        sender: "Ti",
        text: userMessage,
      },
    ]);

    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Napaka na strežniku.");
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "AI",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "AI",
          text: "Prišlo je do napake pri komunikaciji z AI.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <main className="app">
      <section className="chat">
        <header className="chat-header">
          <h1>🤖 AI Chat</h1>
          <p>Tvoj osebni AI pomočnik</p>
        </header>

        <div className="messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.sender === "Ti"
                  ? "message-row user-row"
                  : "message-row ai-row"
              }
            >
              <div
                className={
                  msg.sender === "Ti"
                    ? "message user-message"
                    : "message ai-message"
                }
              >
                <strong>{msg.sender}</strong>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-row ai-row">
              <div className="message ai-message">
                <strong>AI</strong>
                <p>✍️ AI piše...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Napiši sporočilo..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <button onClick={sendMessage}>Pošlji</button>
        </div>
      </section>
    </main>
  );
}

export default App;