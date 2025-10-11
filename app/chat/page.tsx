"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface Session {
  id: string;
  title: string;
  created_at: string;
}

export default function Chatbot() {
  const supabase = createClientComponentClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Backend URL
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL ;

  // Fetch logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        loadSessions(data.user.id);
      }
    };
    getUser();
  }, []);

  const loadSessions = async (uid: string) => {
    const res = await fetch(`${API_URL}/sessions/${uid}`);
    const data = await res.json();
    const sorted = data.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setSessions(sorted);
  };

  const loadMessages = async (sessionId: string) => {
    setSelectedSession(sessionId);
    const res = await fetch(`${API_URL}/messages/${sessionId}`);
    const data = await res.json();
    const sorted = data
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((m: any) => ({ role: m.role, content: m.content, created_at: m.created_at }));
    setMessages(sorted);
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setLoading(true);
    let sid = selectedSession;

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, user_id: userId, session_id: sid }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "⚠️ No response" },
      ]);
      setInput("");

      if (!sid && data.session_id) {
        setSelectedSession(data.session_id);
        loadSessions(userId);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Server error" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!userId) return <p className="p-4 text-center text-gray-600">🔒 Please sign in to chat.</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4 h-screen flex flex-col">
        <button
          onClick={() => (window.location.href = "/")}
          className="flex items-center gap-2 cursor-pointer text-gray-700 font-semibold mb-4 hover:text-green-600"
        >
          <span className="text-xl">←</span>
          <span>Back</span>
        </button>

        <h2 className="text-lg font-bold mb-4">💬 Your Sessions</h2>

        <div className="flex-1 overflow-y-auto space-y-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => loadMessages(s.id)}
              className={`block w-full text-left p-2 rounded ${
                selectedSession === s.id ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-green-100"
              }`}
            >
              {s.title || "Untitled"}
              <br />
              <span className="text-xs text-gray-500">
                {new Date(s.created_at).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        <div className="flex-1 p-4 overflow-y-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`my-2 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[70%] ${
                    msg.role === "user"
                      ? "bg-green-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  } shadow`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && <p className="text-gray-500 animate-pulse">Typing...</p>}
          <div ref={chatEndRef}></div>
        </div>

        <div className="p-4 border-t bg-white flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
            placeholder="Ask about schools, universities, or skills..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
