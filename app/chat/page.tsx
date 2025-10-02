"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion, AnimatePresence } from "framer-motion";

interface Resource {
  name: string;
  location: string;
  eligibility?: string;
  benefit?: string;
  website?: string;
  contact?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  top_resources?: Resource[];
  skill?: string;
  steps?: string[];
}

interface Session {
  id: string;
  title?: string;
  created_at: string;
}

const Chatbot = ({ userId }: { userId: string }) => {
  const supabase = createClientComponentClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) setSessions(data);
  };

  const loadSessionMessages = async (sessionId: string) => {
    setSelectedSession(sessionId);
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setMessages(
        data.map((m: any) => ({
          role: m.role,
          content: m.content,
        }))
      );
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    let sessionId = selectedSession;

    // If no session selected, create new
    if (!sessionId) {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, user_id: userId }),
      });
      const data = await res.json();
      sessionId = data.session_id || null;
      setSelectedSession(sessionId);
      loadSessions();
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          user_id: userId,
          session_id: sessionId,
        }),
      });
      const data = await res.json();

      const botMessage: Message = {
        role: "assistant",
        content: data.answer || "⚠️ No response",
        top_resources: data.top_resources || [],
        skill: data.skill,
        steps: data.steps,
      };

      setMessages((prev) => [...prev, botMessage]);
      loadSessions();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Could not reach server, try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
        <h2 className="font-bold text-lg mb-3">Your Sessions</h2>
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`p-2 mb-2 rounded cursor-pointer ${
              selectedSession === s.id ? "bg-green-200" : "bg-gray-100 hover:bg-green-100"
            }`}
            onClick={() => loadSessionMessages(s.id)}
          >
            {s.title || "New Chat"} <br />
            <span className="text-xs text-gray-500">
              {new Date(s.created_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-3 h-[90vh]">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-xl max-w-[80%] text-sm shadow ${
                    msg.role === "user"
                      ? "bg-green-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{msg.content}</p>

                  {msg.top_resources && msg.top_resources.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.top_resources.map((r, idx) => (
                        <div
                          key={idx}
                          className="border p-2 rounded-lg bg-green-50 hover:bg-green-100 transition"
                        >
                          <p className="font-semibold text-green-700">
                            {r.name} ({r.location})
                          </p>
                          {r.eligibility && <p className="text-xs">Eligibility: {r.eligibility}</p>}
                          {r.benefit && <p className="text-xs">Benefit: {r.benefit}</p>}
                          {r.website && (
                            <p className="text-xs">
                              Website:{" "}
                              <a
                                href={r.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-green-600"
                              >
                                Visit
                              </a>
                            </p>
                          )}
                          {r.contact && <p className="text-xs">Contact: {r.contact}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.steps && msg.steps.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.steps.map((s, idx) => (
                        <p key={idx}>{`${idx + 1}️⃣ ${s}`}</p>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex justify-start">
              <motion.div
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-sm animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Typing...
              </motion.div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Input */}
        <div className="flex items-center p-3 border-t border-gray-200">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ask about schools, universities, scholarships..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-transform transform active:scale-95 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
