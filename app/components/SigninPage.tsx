'use client'

import React, { useState, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MdLock, MdEmail, MdLogin } from 'react-icons/md'
import { Inter } from 'next/font/google'

// --- Configuration & Setup ---
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const supabase = createClientComponentClient()
const PRIMARY_HEX = '#fca311'

// Conditional table name logic (for Vercel/Local consistency)
const PROFILE_TABLE_NAME = (process.env.NEXT_PUBLIC_PROFILE_TABLE || 'users') as 'users';


export default function SigninPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // --- Handle Sign In ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      return setErrorMsg('Email and password are required.')
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle common errors (e.g., Invalid login credentials)
        if (error.message.includes('Invalid login credentials')) {
            setErrorMsg('Invalid email or password. Please try again.')
        } else {
            setErrorMsg(error.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        // 1. Sign-in successful, now fetch the user's profile to get the ID and role
        const { data: profile, error: profileError } = await supabase
            .from(PROFILE_TABLE_NAME)
            .select('id, name') // Fetching ID and Name for redirect
            .eq('id', data.user.id)
            .maybeSingle()

        if (profileError || !profile) {
            // This is a rare case where the auth account exists but the profile record doesn't
            console.error('Profile fetch error:', profileError?.message || 'Profile not found after sign-in.')
            setSuccessMsg('Signed in, but redirect failed. Check console.')
            // You might redirect to a profile completion page here instead of the feed
            setLoading(false)
            return
        }

        // 2. Redirect to the main feed/dashboard using the user's ID
        setSuccessMsg('Sign in successful! Redirecting to feed...')
        setTimeout(() => router.push(`/Feed/${profile.id}`), 1000)

      }

    } catch (err: any) {
      setErrorMsg('An unexpected error occurred.')
    } finally {
      // Loading is reset after successful redirect or immediately upon error
      if (errorMsg) setLoading(false)
    }
  }

  return (
    <div className={`${inter.className} w-full min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100`}>
      {/* Left Form Section */}
      <motion.div
        className="flex items-center justify-center p-6 md:p-12 bg-white"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#14213d] mb-4">
            Welcome Back to <span style={{ color: PRIMARY_HEX }}>Prospero</span>
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Sign in to access your jobs and community feed.
          </p>

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            
            {/* Email Input */}
            <div className="relative flex items-center gap-3 border px-4 py-3 rounded-xl shadow-sm">
              <MdEmail className="text-gray-500 w-5 h-5" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="flex-1 outline-none font-medium" 
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative flex items-center gap-3 border px-4 py-3 rounded-xl shadow-sm">
              <MdLock className="text-gray-500 w-5 h-5" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="flex-1 outline-none font-medium" 
                required
              />
            </div>

            {/* Error/Success Messages */}
            {successMsg && <p className="text-green-600 mt-2 text-sm bg-green-50 p-3 rounded-lg">{successMsg}</p>}
            {errorMsg && <p className="text-red-500 mt-2 text-sm bg-red-50 p-3 rounded-lg">{errorMsg}</p>}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? '#9ca3af' : PRIMARY_HEX }}
              className="w-full text-white py-3 rounded-xl font-bold text-lg shadow-lg mt-4 transition duration-200 flex items-center justify-center"
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Signing In...
                </>
              ) : (
                <>
                    <MdLogin className="mr-2 w-6 h-6" />
                    Sign In
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-gray-700 mt-6">
            Don't have an account?{' '}
            <Link href="/Signup" className="font-bold hover:underline" style={{ color: PRIMARY_HEX }}>
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Right Illustration */}
      <motion.div
        className="relative w-full h-64 md:h-full overflow-hidden bg-gray-900"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Image 
            src="/hero2.jpg" // Replace with your actual image path
            alt="Community and prosperity illustration" 
            fill 
            className="object-cover object-center opacity-80" 
            priority 
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-8">
            <h3 className="text-4xl font-extrabold text-center">Empower Your Path.</h3>
            <p className="text-lg mt-2 text-center">Connect, learn, and grow with a supportive network.</p>
        </div>
      </motion.div>
    </div>
  )
}