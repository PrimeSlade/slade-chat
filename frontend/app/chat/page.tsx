"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "../styles/messaging-theme.css";
import { User } from "@backend/shared";

const socket: Socket = io("http://localhost:3001/chat");

const Page = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const [test, setTest] = useState<User>();

  useEffect(() => {
    // 1. Listen for incoming messages
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // 2. Cleanup listener on component unmount
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      // Emit event to server
      socket.emit("sendMessage", input);
      setInput("");
    }
  };

  return (
    <div className="bg-gradient-messaging min-h-screen p-4">
      <h2>Simple Chat</h2>

      {/* Message List */}
      <div className="border h-64 overflow-y-scroll mb-4 p-2">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.id.slice(0, 4)}: </strong>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border p-2 mr-2"
        placeholder="Type a message..."
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white p-2">
        Send
      </button>
    </div>
  );
};

export default Page;
