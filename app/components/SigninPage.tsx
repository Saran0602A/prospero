'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MdMailOutline, MdLock, MdPhone } from 'react-icons/md'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const supabase = createClientComponentClient()

export default function SigninPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [step, setStep] = useState<'default' | 'otp'>('default')
  const [otpCountdown, setOtpCountdown] = useState(60)

  // OTP Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === 'otp' && otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [otpCountdown, step])

  // Email login
  const handleEmailSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(''); setSuccessMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Force Header re-render
      router.refresh()
      setSuccessMsg('Login successful')
      router.push('/')
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally { setLoading(false) }
  }

  // Phone OTP request
  const handlePhoneSignin = async () => {
    setLoading(true); setErrorMsg(''); setSuccessMsg('')
    if (!/^\+\d{10,15}$/.test(phone)) {
      setErrorMsg('Enter valid phone with country code')
      setLoading(false)
      return
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
      setStep('otp'); setOtpCountdown(60); setSuccessMsg('OTP sent to your phone')
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally { setLoading(false) }
  }

  // OTP Verify
  const handleOtpVerify = async () => {
    setLoading(true); setErrorMsg(''); setSuccessMsg('')
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
      if (error) throw error

      router.refresh() // update Header
      setSuccessMsg('Login successful')
      router.push('/')
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className={`${inter.className} w-full min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100`}>
      {/* Left GIF */}
      <motion.div className="relative w-full h-80 md:h-full overflow-hidden" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1 }}>
        <Image src="/ricefield.gif" alt="Signin illustration" fill className="object-cover" priority />
        <motion.div className="absolute inset-0 bg-black/25" initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} />
      </motion.div>

      {/* Right Form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-white">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#14213d] mb-4">
            Welcome Back to <span className="text-[#fca311]">Prospero</span>
          </h2>
          <p className="text-center text-gray-600 mb-8">Sign in to continue</p>

          {/* Toggle Method */}
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={() => { setMethod('email'); setStep('default') }} className={`px-4 py-2 rounded ${method === 'email' ? 'bg-[#fca311] text-white' : 'bg-gray-200'}`}>Email</button>
            <button onClick={() => { setMethod('phone'); setStep('default') }} className={`px-4 py-2 rounded ${method === 'phone' ? 'bg-[#fca311] text-white' : 'bg-gray-200'}`}>Phone</button>
          </div>

          {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}
          {successMsg && <p className="text-green-500 mb-2">{successMsg}</p>}

          {method === 'email' && (
            <form onSubmit={handleEmailSignin} className="space-y-4">
              <div className="flex items-center border rounded px-3 py-2">
                <MdMailOutline className="mr-2 text-gray-500 w-6 h-6" />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full outline-none" />
              </div>
              <div className="flex items-center border rounded px-3 py-2">
                <MdLock className="mr-2 text-gray-500 w-6 h-6" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full outline-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-[#fca311] text-white rounded hover:bg-[#e59400] transition">{loading ? 'Signing in...' : 'Sign In'}</button>
            </form>
          )}

          {method === 'phone' && (
            <div className="space-y-4">
              {step === 'default' ? (
                <>
                  <div className="flex items-center border rounded px-3 py-2">
                    <MdPhone className="mr-2 text-gray-500 w-6 h-6" />
                    <input type="tel" placeholder="+911234567890" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full outline-none" />
                  </div>
                  <button onClick={handlePhoneSignin} disabled={loading} className="w-full py-2 px-4 bg-[#fca311] text-white rounded hover:bg-[#e59400] transition">{loading ? 'Sending OTP...' : 'Send OTP'}</button>
                </>
              ) : (
                <>
                  <div className="flex items-center border rounded px-3 py-2">
                    <MdLock className="mr-2 text-gray-500 w-6 h-6" />
                    <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required className="w-full outline-none" />
                  </div>
                  <button onClick={handleOtpVerify} disabled={loading} className="w-full py-2 px-4 bg-[#fca311] text-white rounded hover:bg-[#e59400] transition">{loading ? 'Verifying...' : `Verify OTP (${otpCountdown}s)`}</button>
                </>
              )}
            </div>
          )}

          <p className="text-center text-gray-500 mt-4">
            Don’t have an account? <Link href="/SignUp" className="text-[#fca311] font-semibold">Sign Up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
