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

// --- Constants ---
const PRIMARY_COLOR = 'bg-[#fca311]';
const HOVER_COLOR = 'hover:bg-[#e6940f]';

// 🎯 Helper function to safely generate a UUID only in the browser environment
const generateUUID = (): string => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    console.error("Using fallback UUID generator.");
    return 'temp-id-' + Math.random().toString(36).substring(2, 9);
};


export default function Chat() {
  const supabase = createClientComponentClient();
  const params = useParams();
  const router = useRouter();
  
  const userIdFromParams = (params.id as string) || null;
  const [userId, setUserId] = useState<string | null>(userIdFromParams);
  const [userName, setUserName] = useState<string | null>(null);

  // 🚨 SIMPLIFIED STATE: We always assume a new session or a continuation of the current one.
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string>(generateUUID());
  
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // --- Core Logic Effects ---

  // Update real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Initial Load: Fetch User and Name
  useEffect(() => {
    if (userIdFromParams) {
      const fetchUserData = async () => {
        const { data: authData } = await supabase.auth.getUser();
        const authenticatedUserId = authData?.user?.id;

        if (!authenticatedUserId || authenticatedUserId !== userIdFromParams) {
             console.warn("Security warning: User not authenticated or mismatch.");
             setUserId(null);
             return;
        }
        
        // Fetch user name (assuming profile table is 'users')
        const PROFILE_TABLE_NAME = (process.env.NEXT_PUBLIC_PROFILE_TABLE || 'users') as 'users';
        const { data: profile } = await supabase
            .from(PROFILE_TABLE_NAME)
            .select('name')
            .eq('id', authenticatedUserId)
            .maybeSingle();

        // Use name if available, otherwise default to a generic label
        setUserName(profile?.name || 'Authenticated User');
        setUserId(userIdFromParams);
      };
      fetchUserData();
    }
  }, [userIdFromParams, supabase]);

  // Responsive Design Effect
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // --- Data Handlers ---

  const startNewSession = () => {
    setCurrentSessionId(generateUUID()); 
    setMessages([]); 
    setInput('');
    if (isMobile) setIsSidebarOpen(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId) return; 
    
    const currentInput = input;
    const userMessage: Message = { role: 'user', content: currentInput };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

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

    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ Server error: ${err instanceof Error ? err.message : 'Unknown'}` }]);
    } finally {
      setLoading(false);
    }
  };


  if (!userId) return <p className="p-4 text-center text-gray-600">🔒 Access Denied. Please ensure you are logged in and the URL contains your User ID.</p>;


  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Sidebar - Context Panel (Fixed Design) */}
      <motion.div
        initial={false}
        animate={{ 
            width: isMobile ? (isSidebarOpen ? '100%' : '0') : '288px', // w-72 = 288px
            opacity: isMobile ? (isSidebarOpen ? 1 : 0) : 1,
            x: isMobile ? (isSidebarOpen ? 0 : '-100%') : 0,
        }}
        transition={{ duration: 0.2 }}
        className={`fixed md:relative flex flex-col h-screen bg-white shadow-xl p-4 border-r border-gray-200 z-20 
                    ${isMobile ? 'w-full' : 'w-72'}`}
        style={{ width: isMobile ? (isSidebarOpen ? '100%' : '0') : '288px' }}
      >
        {isSidebarOpen && (
          <>
            <div className='flex justify-between items-center mb-4'>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-700 font-semibold p-2 rounded hover:bg-gray-100 transition"
                >
                  <span className="text-xl">←</span>
                  <span>Back</span>
                </button>
                {isMobile && (
                    <button onClick={() => setIsSidebarOpen(false)} className='text-gray-500 text-2xl p-2 rounded-full hover:bg-gray-100'>
                        ✕
                    </button>
                )}
            </div>

            <motion.button
                onClick={startNewSession}
                className={`w-full mb-6 p-3 rounded-xl font-bold text-white ${PRIMARY_COLOR} ${HOVER_COLOR} shadow-md transition`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
            >
                + Start New Chat
            </motion.button>
            
            {/* 🎯 NEW STATIC CONTEXT PANEL */}
            <div className='flex-1 p-3 bg-gray-50 rounded-lg space-y-4'>
                <div className='border-b pb-3'>
                    <h3 className='text-md font-bold text-gray-700'>Current User</h3>
                    {/* Hiding user ID as requested */}
                    <p className='text-sm text-gray-600 mt-1 truncate'>{userName || 'Loading...'}</p>
                </div>
                
                <div className='border-b pb-3'>
                    <h3 className='text-md font-bold text-gray-700'>Session Context</h3>
                    <p className='text-sm text-gray-600 mt-1'>Active Since:</p>
                    <p className='text-md font-mono text-gray-800'>{currentTime.toLocaleTimeString()}</p>
                    <p className='text-xs text-gray-500'>{currentTime.toDateString()}</p>
                </div>
                
                <div className='pt-2'>
                    <h3 className='text-sm font-semibold text-gray-500'>Model</h3>
                    <p className='text-xs font-mono text-gray-700'>Gemini 2.5 Flash</p>
                </div>
            </div>

          </>
        )}
      </motion.div>

      {/* Chat Area (Main Content) */}
      <div className={`flex-1 flex flex-col h-screen md:w-auto ${isMobile && isSidebarOpen ? 'hidden' : 'w-full'}`}>
        
        {/* Mobile Header Button */}
        {isMobile && (
            <div className='p-3 border-b bg-white md:hidden'>
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className='text-gray-700 font-semibold p-2 rounded-lg hover:bg-gray-100'
                >
                    ☰ View Context
                </button>
            </div>
        )}
        
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
          {messages.length === 0 && !loading && (
             <div className='p-10 text-center text-gray-500'>
                <h3 className='text-2xl font-bold mb-2'>Welcome!</h3>
                <p>Start your conversation now. Your history will be automatically saved.</p>
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