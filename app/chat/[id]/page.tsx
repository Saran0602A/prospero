'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
const PRIMARY_COLOR = 'bg-[#fca311]';
const HOVER_COLOR = 'hover:bg-[#e6940f]';

// 🎯 Helper function to safely generate a UUID only in the browser environment
const generateUUID = (): string => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    // Fallback/Placeholder if called in SSR/Node environment, though execution should be guarded.
    return 'temp-id-' + Math.random().toString(36).substring(2, 9);
};


export default function Chat() {
  const supabase = createClientComponentClient();
  const params = useParams();
  const router = useRouter();
  
  // FIX: User ID should be the only state based on params
  const userIdFromParams = (params.id as string) || null;
  const [userId, setUserId] = useState<string | null>(userIdFromParams);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // --- Data Handlers ---

  const loadSessions = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`${API_URL}/sessions/${uid}`);
      if (!res.ok) throw new Error('Failed to fetch sessions.');
      
      const data: Session[] = await res.json();
      const sorted = data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setSessions(sorted);

      if (sorted.length > 0 && (!selectedSessionId || !sorted.find(s => s.id === selectedSessionId))) {
        setSelectedSessionId(sorted[0].id);
        loadMessages(sorted[0].id);
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  }, [API_URL, selectedSessionId]);

  const loadMessages = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setMessages([]);
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

  // 🟢 FIX: Ensures UUID is generated only on click/interaction
  const startNewSession = () => {
    const newSessionUUID = generateUUID(); 
    setSelectedSessionId(newSessionUUID);
    setMessages([]);
    setInput('');
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;
    
    // 🟢 FIX: Generates UUID safely if necessary for the *very first* message
    const currentSessionId = selectedSessionId || generateUUID(); 
    
    const userMessage: Message = { role: 'user', content: input };
    
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    
    // Set the state ID if we had to generate it just now
    if (!selectedSessionId) {
        setSelectedSessionId(currentSessionId);
    }

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, user_id: userId, session_id: currentSessionId }), 
      });

      if (!res.ok) throw new Error(`Backend request failed with status ${res.status}`);

      const data = await res.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.answer || '⚠️ No response from model', 
        created_at: new Date().toISOString()
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      loadSessions(userId); 

    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ Server error: ${err instanceof Error ? err.message : 'Unknown'}` }]);
    } finally {
      setLoading(false);
    }
  };

  // --- Core Effects ---

  // 1. Initial Load: Check auth/sessions based on URL userId
  useEffect(() => {
    if (userIdFromParams) {
      const verifyUserAndLoadSessions = async () => {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user?.id || authData.user.id !== userIdFromParams) {
             console.warn("Security warning: Authenticated user ID does not match URL ID or user is logged out.");
        }
        
        setUserId(userIdFromParams);
        loadSessions(userIdFromParams);
      };
      verifyUserAndLoadSessions();
    }
  }, [userIdFromParams, loadSessions, supabase.auth]);

  // 2. Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  if (!userId) return <p className="p-4 text-center text-gray-600">🔒 Access Denied. Please ensure you are logged in and the URL contains your User ID.</p>;


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
                  ? "bg-[#fca311] text-white shadow-lg border-[#e6940f]" 
                  : "bg-gray-100 text-gray-800 hover:bg-yellow-50 hover:border-yellow-300"
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <p className="font-semibold truncate">{s.title || "Untitled Chat"}</p>
              <span className={`text-xs ${selectedSessionId === s.id ? 'text-orange-200' : 'text-gray-500'}`}>
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
                {selectedSessionId ? (
                    <p className='text-sm mt-2'>Session ID: <code className='text-xs bg-gray-200 p-1 rounded'>{selectedSessionId}</code></p>
                ) : (
                    <p>Start a conversation below to begin a new session.</p>
                )}
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
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#fca311] transition"
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