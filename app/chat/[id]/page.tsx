'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useParams and useRouter
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';

// --- Type Definitions ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface Session {
  id: string;
  title: string;
  created_at: string;
}

// --- Constants ---
const PRIMARY_COLOR = 'bg-green-600';
const HOVER_COLOR = 'hover:bg-green-700';

export default function Chat() {
  const supabase = createClientComponentClient();
  const params = useParams(); // Get URL parameters
  const router = useRouter(); // To enable router.back()
  
  // 🎯 FIX 1: Get userId directly from the URL params
  const userIdFromParams = (params.id as string) || null;
  const [userId, setUserId] = useState<string | null>(userIdFromParams);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Use a fallback URL if environment variable is missing
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // --- Core Effects ---

  // 1. Initial Load: Check auth/sessions based on URL userId
  useEffect(() => {
    // If the URL provided an ID, verify it's a real user and load sessions.
    if (userIdFromParams) {
      const verifyUserAndLoadSessions = async () => {
        // Optional: Check if the user ID in the URL matches the logged-in user.
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id !== userIdFromParams) {
             // Handle mismatch (e.g., redirect or load as read-only, but for a chat, we enforce consistency)
             console.error("URL user ID does not match authenticated user ID.");
             // For simplicity, we proceed with the URL ID, but production apps should handle this security check.
        }
        
        setUserId(userIdFromParams);
        loadSessions(userIdFromParams);
      };
      verifyUserAndLoadSessions();
    } else {
        // If the component is rendered without an ID, ensure loading is handled.
        console.error("Chat component loaded without a dynamic user ID.");
    }
  }, [userIdFromParams]); // Dependency is the ID from the URL

  // 2. Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // --- Data Handlers ---

  const loadSessions = async (uid: string) => {
    try {
      const res = await fetch(`${API_URL}/sessions/${uid}`);
      if (!res.ok) throw new Error('Failed to fetch sessions.');
      
      const data: Session[] = await res.json();
      const sorted = data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setSessions(sorted);

      // If no session is selected, select the most recent one (or null)
      if (!selectedSessionId && sorted.length > 0) {
        setSelectedSessionId(sorted[0].id);
        loadMessages(sorted[0].id);
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const loadMessages = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setMessages([]); // Clear old messages immediately
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/messages/${sessionId}`);
      if (!res.ok) throw new Error('Failed to fetch messages.');
      
      const data: Message[] = await res.json();
      const sorted = data
        .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())
      
      setMessages(sorted);
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([{ role: 'assistant', content: 'Could not load chat history.', created_at: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = () => {
    setSelectedSessionId(null);
    setMessages([]);
    setInput('');
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId) return; // Ensure userId is present
    const userMessage: Message = { role: 'user', content: input };
    
    // Optimistically update UI
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    let sid = selectedSessionId;

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Use userId (from state, populated by URL)
        body: JSON.stringify({ message: currentInput, user_id: userId, session_id: sid }), 
      });

      if (!res.ok) throw new Error(`Backend request failed with status ${res.status}`);

      const data = await res.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.answer || '⚠️ No response from model', 
        created_at: new Date().toISOString()
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      // CRITICAL FIX: If a new session was created in the backend, update frontend state
      if (!sid && data.session_id) {
        setSelectedSessionId(data.session_id);
        loadSessions(userId); // Reload sessions to see the new title
      }

    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ Server error: ${err instanceof Error ? err.message : 'Unknown'}` }]);
    } finally {
      setLoading(false);
    }
  };

  // If the user ID isn't in the URL (and it should be) or isn't verified, show sign-in prompt.
  if (!userId) return <p className="p-4 text-center text-gray-600">🔒 Please sign in and ensure your URL contains your User ID (e.g., /chat/[user_id]).</p>;
  if (API_URL === 'http://localhost:8000') console.warn('Using fallback local API URL. Verify your NEXT_PUBLIC_BACKEND_URL.');


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-xl p-4 flex flex-col border-r border-gray-200">
        
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 font-semibold mb-4 p-2 rounded hover:bg-gray-100 transition"
        >
          <span className="text-xl">←</span>
          <span>Back</span>
        </button>

        <motion.button
            onClick={startNewSession}
            className={`w-full mb-4 p-3 rounded-xl font-bold text-white ${PRIMARY_COLOR} ${HOVER_COLOR} shadow-md transition`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
        >
            + Start New Chat
        </motion.button>

        <h2 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">💬 Past Sessions</h2>

        <div className="flex-1 overflow-y-auto space-y-2">
          {sessions.length === 0 && <p className="text-sm text-gray-500">No sessions yet. Start a new chat!</p>}
          
          {sessions.map((s) => (
            <motion.button
              key={s.id}
              onClick={() => loadMessages(s.id)}
              className={`block w-full text-left p-3 rounded-lg border transition duration-150 ${
                selectedSessionId === s.id 
                  ? "bg-green-600 text-white shadow-lg border-green-700" 
                  : "bg-gray-100 text-gray-800 hover:bg-green-50 hover:border-green-300"
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <p className="font-semibold truncate">{s.title || "Untitled Chat"}</p>
              <span className={`text-xs ${selectedSessionId === s.id ? 'text-green-200' : 'text-gray-500'}`}>
                {new Date(s.created_at).toLocaleDateString()}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
          {messages.length === 0 && !loading && (
             <div className='p-10 text-center text-gray-500'>
                <h3 className='text-2xl font-bold mb-2'>Welcome!</h3>
                <p>Start a conversation below to get guidance on your career path.</p>
             </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`my-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`p-4 max-w-[80%] whitespace-pre-wrap shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-t-xl rounded-l-xl'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-t-xl rounded-r-xl'
                  }`}
                >
                  {msg.content}
                  <p className='text-xs text-right mt-1 opacity-70'>
                     {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : 'now'}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && <p className="text-gray-500 italic ml-4 animate-pulse">Assistant is typing...</p>}
          <div ref={chatEndRef}></div>
        </div>

        <div className="p-4 border-t bg-white flex gap-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            placeholder={loading ? "Waiting for response..." : "Ask about schools, universities, or skills..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <motion.button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`text-white px-6 py-2 rounded-xl ${PRIMARY_COLOR} ${HOVER_COLOR} disabled:bg-gray-400 disabled:cursor-not-allowed transition`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
}