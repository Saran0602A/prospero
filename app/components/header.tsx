'use client'

import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import { Inter } from 'next/font/google'
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const PROFILE_TABLE_NAME = (process.env.NEXT_PUBLIC_PROFILE_TABLE || 'users') as 'users'; 

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  // Use a sensible default avatar placeholder
  const [avatarUrl, setAvatarUrl] = useState<string>('/default-avatar.png') 

  const supabase = createClientComponentClient()
  const router = useRouter()
  const avatarRef = useRef<HTMLDivElement>(null)

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch session & user avatar (FIXED TABLE NAME)
  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      
      if (data.session?.user) {
        // --- FIX IS HERE ---
        const { data: userData } = await supabase
          .from(PROFILE_TABLE_NAME) // ✅ Use conditional table name
          .select('avatar_url')
          .eq('id', data.session.user.id)
          .maybeSingle()
        
        // Ensure we handle null/undefined data safely
        setAvatarUrl(userData?.avatar_url || '/default-avatar.png')
      } else {
        setAvatarUrl('/default-avatar.png');
      }
    }
    fetchSession()
  }, [supabase])

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Close avatar menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header
      className={`${inter.className} fixed top-0 left-0 right-0 z-[800] h-[75px] flex items-center justify-between px-6 sm:px-8 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-lg bg-white/90 border-b border-white/30 shadow-lg h-[65px]'
          : 'bg-white/20 border-b border-white/20'
      }`}
    >
      {/* Logo */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#000000] tracking-tight">
          Pros
          <span className="text-[#14213d] font-medium">pero</span>
          <sup className="text-[#14213d] font-bold text-xl">.</sup>
        </h1>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-8 text-lg font-medium text-[#1f1f1f]">
        {session?.user && (
          <Link href={`/Feed/${session.user.id}`} className="hover:text-[#14213d] transition-colors">
            Feed
          </Link>
        )}
          {session?.user && (
        <Link href={`/chat/${session.user.id}`} className="hover:text-[#14213d] transition-colors">ChatBot</Link>
          )}
        <Link href="/About" className="hover:text-[#14213d] transition-colors">About</Link>
         {session?.user && (
        <Link href={`/Dasboard/${session.user.id}`} className="hover:text-[#14213d] transition-colors">DashBoard</Link>
          )}
      </nav>

      {/* Desktop Auth */}
      <div className="hidden md:flex items-center space-x-4 text-lg font-medium relative">
        {session?.user ? (
          <div ref={avatarRef} className="relative">
            {/* Avatar */}
            <img
              src={avatarUrl} // Using the state variable
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-[#fca311] object-cover"
              onClick={() => setAvatarMenuOpen(prev => !prev)}
            />

            {/* Dropdown */}
            {avatarMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col z-50"
              >
                <button
                  onClick={() => router.push(`/profile/${session.user.id}`)}
                  className="px-4 py-2 text-left text-gray-700 hover:bg-[#fca311]/20 transition-colors rounded-t-lg"
                >
                  Go to Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-left text-gray-700 hover:bg-[#fca311]/20 flex items-center gap-1 rounded-b-lg"
                >
                  Logout <FiLogOut />
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/Signin"
              className="px-4 py-2 rounded-lg border border-[#14213d] text-[#14213d] hover:bg-[#14213d] hover:text-white transition-all shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/SignUp"
              className="px-4 py-2 rounded-lg bg-[#14213d] text-white hover:bg-[#0d1b2a] transition-all shadow-sm"
            >
              Signup
            </Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-3xl text-[#14213d] z-[1000]"
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        variants={{
          open: { opacity: 1, y: 0, height: 'auto' },
          closed: { opacity: 0, y: -50, height: 0 },
        }}
        transition={{ duration: 0.3 }}
        className="fixed top-[75px] left-0 right-0 backdrop-blur-xl shadow-lg border-b border-white/30 overflow-hidden md:hidden"
      >
        <nav className="flex flex-col items-center space-y-5 py-6 text-xl font-semibold">
          {session?.user && (
            <Link
              href={`/Feed/${session.user.id}`}
              onClick={() => setIsOpen(false)}
              className="text-gray-800 hover:text-[#14213d]"
            >
              Feed
            </Link>
          )}
          {session?.user && (  <Link href={`/chat/${session.user.id}`} onClick={() => setIsOpen(false)} className="text-gray-800 hover:text-[#14213d]">ChatBot</Link> )}
          <Link href="/About" onClick={() => setIsOpen(false)} className="text-gray-800 hover:text-[#14213d]">About</Link>
               {session?.user && (  <Link href={`/Dasboard/${session.user.id}`} onClick={() => setIsOpen(false)} className="text-gray-800 hover:text-[#14213d]">DashBoard</Link>)}

          <div className="flex space-x-4 pt-4">
            {session?.user ? (
              <>
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-[#fca311] object-cover"
                  onClick={() => router.push(`/profile/${session.user.id}`)}
                />
                <button
                  onClick={() => { handleLogout(); setIsOpen(false) }}
                  className="px-5 py-2 rounded-lg bg-[#fca311] text-white flex items-center gap-1 shadow-md hover:bg-amber-600 transition"
                >
                  Logout <FiLogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/Signin"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-lg border border-[#14213d] text-[#14213d] hover:bg-[#14213d] hover:text-white transition-all shadow-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/SignUp"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 rounded-lg bg-[#14213d] text-white hover:bg-[#0d1b2a] transition-all shadow-sm"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </nav>
      </motion.div>
    </header>
  )
}