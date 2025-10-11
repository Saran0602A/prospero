"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link"; // NEW: For client-side navigation
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion, AnimatePresence } from "framer-motion";

// Interfaces remain the same
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
  
  // IMPROVED: More descriptive state management
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  // NEW: Granular loading and error states for better UX
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Backend URL - ensure this is set in your .env.local file
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Fetch logged-in user and initial sessions
  useEffect(() => {
    const getUserAndSessions = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        loadSessions(data.user.id);
      } else {
        setSessionsLoading(false); // Stop loading if no user
      }
    };
    getUserAndSessions();
  }, [supabase]);

  // Scroll to the bottom of the chat on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // IMPROVED: Load sessions with error handling and loading state
  const loadSessions = async (uid: string) => {
    setSessionsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/sessions/${uid}`);
      if (!res.ok) throw new Error("Failed to fetch sessions.");
      
      const data: Session[] = await res.json();
      const sorted = data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setSessions(sorted);
    } catch (err) {
      setError("Could not load your chat sessions. Please try again later.");
      console.error(err);
    } finally {
      setSessionsLoading(false);
    }
  };

  // IMPROVED: Load messages for a session with error handling and loading state
  const loadMessages = async (sessionId: string) => {
    if (selectedSession === sessionId) return; // Avoid reloading the same session

    setSelectedSession(sessionId);
    setMessagesLoading(true);
    setMessages([]); // Clear previous messages for better UX
    setError(null);
    try {
      const res = await fetch(`${API_URL}/messages/${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch messages.");

      const data: (Message & { id: string })[] = await res.json();
      const sorted = data
        .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())
        .map(({ role, content, created_at }) => ({ role, content, created_at }));
      setMessages(sorted);
    } catch (err) {
      setError("Could not load messages for this session.");
      console.error(err);
    } finally {
      setMessagesLoading(false);
    }
  };
  
  // NEW: Function to start a new chat
  const startNewChat = () => {
    setSelectedSession(null);
    setMessages([]);
    setInput("");
  };

  // IMPROVED: Send message with better state handling and clarity
  const sendMessage = async () => {
    if (!input.trim() || !userId) return;

    const optimisticUserMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, user_id: userId, session_id: selectedSession }),
      });

      if (!res.ok) throw new Error("Failed to get a response from the server.");
      
      const data = await res.json();
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer || "Sorry, I couldn't process that.",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // If it was a new chat, update session state and reload the session list
      if (!selectedSession && data.session_id) {
        setSelectedSession(data.session_id);
        loadSessions(userId); // Refresh sessions to show the new one
      }
    } catch (err) {
      console.error(err);
      const errorMessage: Message = { role: "assistant", content: "⚠️ Oops! A server error occurred. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  if (!userId && !sessionsLoading) {
    return <p className="p-4 text-center text-gray-600">🔒 Please sign in to chat.</p>;
  }

  return (
    <div className="flex h-screen max-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 cursor-pointer text-gray-700 font-semibold hover:text-green-600">
              <span className="text-xl">←</span>
              <span>Back to Home</span>
          </Link>
        </div>
        <div className="p-4">
          <button 
            onClick={startNewChat}
            className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            + New Chat
          </button>
        </div>
        <h2 className="text-sm font-bold mb-2 px-4 text-gray-500 uppercase">Your Sessions</h2>
        <div className="flex-1 overflow-y-auto space-y-2 px-4 pb-4">
          {sessionsLoading ? (
            // NEW: Skeleton loader for sessions
            [...Array(5)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-200 animate-pulse h-16"></div>
            ))
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => loadMessages(s.id)}
                className={`block w-full text-left p-3 rounded-lg transition-colors ${
                  selectedSession === s.id
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 hover:bg-green-100"
                }`}
              >
                <p className="font-semibold truncate">{s.title || "Untitled Session"}</p>
                <span className="text-xs text-gray-500">{new Date(s.created_at).toLocaleString()}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col h-screen max-h-screen">
        <div className="flex-1 p-6 overflow-y-auto">
          {messagesLoading ? (
            <p className="text-center text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            // NEW: Welcome/placeholder message
            <div className="text-center text-gray-500 h-full flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold">EduBot</h2>
              <p>Select a session or start a new one to begin chatting!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`my-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`p-3 rounded-2xl max-w-[70%] whitespace-pre-wrap shadow-md ${
                      msg.role === "user"
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isSending && <p className="text-gray-500 animate-pulse ml-4">Typing...</p>}
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div ref={chatEndRef}></div>
        </div>

        <div className="p-4 border-t bg-white/80 backdrop-blur-sm flex items-center gap-4">
          <input
            type="text"
            className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
            placeholder="Ask about schools, universities, or skills..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isSending && sendMessage()}
            disabled={messagesLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isSending || !input.trim() || messagesLoading}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-all"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}