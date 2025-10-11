'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MdLock, MdEmail } from 'react-icons/md'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const supabase = createClientComponentClient()

export default function SignupPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'worker' | 'employer'>('worker')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  const [location, setLocation] = useState('')
  const [socialLinks, setSocialLinks] = useState({ linkedin: '', twitter: '' })
  const [avatarUrl, setAvatarUrl] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'signup' | 'otp'>('signup')
  const [otpCode, setOtpCode] = useState('')
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === 'otp' && otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000)
    }
    if (step === 'otp' && otpCountdown === 0) {
      setErrorMsg('Verification code expired. You can resend below.')
    }
    return () => clearTimeout(timer)
  }, [otpCountdown, step])

  // Step 1: Send verification email
  const handleSendOtp = async () => {
    if (!email) return setErrorMsg('Email is required.')
    if (!password || password.length < 6) return setErrorMsg('Password must be at least 6 characters.')
    if (!fullName) return setErrorMsg('Full Name is required.')

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        if (error.message.toLowerCase().includes('user already registered')) {
          setErrorMsg('Account already registered. Redirecting to Sign In...')
          setTimeout(() => router.push('/Signin'), 1200)
          return
        }
        throw error
      }

      if (data.user && !data.session) {
        // Email confirmation ON → OTP needed
        setStep('otp')
        setOtpCountdown(30)
        setSuccessMsg(`Verification code sent to ${email}. Check your inbox.`)
      } else if (data.user && data.session) {
        // Email confirmation OFF → auto verified
        await handleProfileInsert(data.user)
      }

    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP & create user profile
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) return setErrorMsg('Enter the 6-digit verification code.')
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup', // ✅ Correct type for email verification
      })
      if (error) throw error

      const user = data.user
      if (!user?.id) throw new Error('Verification failed. User not found.')

      await handleProfileInsert(user)
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Insert profile into DB
  const handleProfileInsert = async (user: any) => {
    try {
      const { data: existingProfile, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (selectError) throw selectError

      if (!existingProfile) {
        const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean)
        const { error: dbError } = await supabase.from('users').insert({
          id: user.id,
          name: fullName,
          email: user.email,
          role,
          bio: bio || null,
          skills: skillsArray,
          location: location || null,
          avatar_url: avatarUrl || null,
          social_links: socialLinks,
        })
        if (dbError) throw dbError
      }

      setSuccessMsg('Signup complete! Redirecting to dashboard...')
      setTimeout(() => router.push(`/`), 1000)
    } catch (err: any) {
      setErrorMsg(err.message)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return
    await handleSendOtp()
  }

  return (
    <div className={`${inter.className} w-full min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100`}>
      {/* Left Form Section */}
      <motion.div
        className="flex items-center justify-center p-6 md:p-12 bg-white"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#14213d] mb-4">
            {step === 'signup' ? 'Join' : 'Verify Account'} <span className="text-[#fca311]">Prospero</span>
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {step === 'signup' ? 'Create your account' : `Enter the code sent to ${email}`}
          </p>

          {step === 'signup' ? (
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Full Name *" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border px-4 py-3 rounded-xl outline-none" />
              <select value={role} onChange={e => setRole(e.target.value as 'worker' | 'employer')} className="w-full border px-4 py-3 rounded-xl">
                <option value="worker">Worker (Seeking Jobs)</option>
                <option value="employer">Employer (Posting Jobs)</option>
              </select>
              <input type="text" placeholder="Short Bio" value={bio} onChange={e => setBio(e.target.value)} className="w-full border px-4 py-3 rounded-xl outline-none" />
              <input type="text" placeholder="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} className="w-full border px-4 py-3 rounded-xl outline-none" />
              <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="w-full border px-4 py-3 rounded-xl outline-none" />

              <div className="flex items-center gap-3 border px-4 py-3 rounded-xl">
                <MdEmail className="text-gray-500 w-5 h-5" />
                <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 outline-none" />
              </div>

              <div className="flex items-center gap-3 border px-4 py-3 rounded-xl">
                <MdLock className="text-gray-500 w-5 h-5" />
                <input type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} className="flex-1 outline-none" />
              </div>

              <motion.button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-[#fca311] text-white py-3 rounded-xl font-medium shadow-lg mt-2 hover:bg-amber-600 transition"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Processing...' : 'Create Account & Send Code'}
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Enter OTP" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full border px-4 py-3 rounded-xl outline-none text-center text-lg tracking-wider" maxLength={6} />
              <p className="text-gray-500 text-sm text-center">Code expires in {otpCountdown}s</p>

              <motion.button
                onClick={handleVerifyOtp}
                disabled={loading || otpCountdown <= 0}
                className="w-full bg-[#fca311] text-white py-3 rounded-xl font-medium shadow-lg hover:bg-amber-600 transition"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Verifying...' : 'Verify & Complete Signup'}
              </motion.button>

              {otpCountdown === 0 && (
                <motion.button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="w-full text-[#fca311] py-2 rounded-xl font-medium border border-[#fca311] mt-2 hover:bg-[#fca311]/10 transition"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Sending New Code...' : 'Resend Code'}
                </motion.button>
              )}

              <p onClick={() => setStep('signup')} className="text-sm text-center text-gray-600 mt-2 cursor-pointer hover:underline">
                ← Change Details
              </p>
            </div>
          )}

          {successMsg && <p className="text-green-600 mt-2 text-sm">{successMsg}</p>}
          {errorMsg && <p className="text-red-500 mt-2 text-sm">{errorMsg}</p>}

          <p className="text-center text-gray-700 mt-6">
            Already have an account?{' '}
            <Link href="/Signin" className="text-[#fca311] font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Right Illustration */}
      <motion.div
        className="relative w-full h-80 md:h-full overflow-hidden"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Image src="/ricefield.gif" alt="Signup illustration" fill className="object-cover" priority />
        <motion.div className="absolute inset-0 bg-black/25" initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} />
      </motion.div>
    </div>
  )
}
