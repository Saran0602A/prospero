'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Inter } from '@next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { MdMailOutline, MdLock, MdPhone, MdArrowForward } from 'react-icons/md';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const supabase = createClientComponentClient();

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [step, setStep] = useState<'default' | 'phoneOtp' | 'emailOtp'>('default');
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  // Email + Password Signin
  const handleEmailSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSuccessMsg('Signed in successfully!');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Email OTP (Magic Link)
  const handleEmailOtpSignin = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setStep('emailOtp');
      setSuccessMsg('Check your email for the magic link to sign in.');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Request
  const handlePhoneSignin = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!/^\+\d{10,15}$/.test(phone)) {
      setErrorMsg('Enter a valid phone number with country code, e.g., +919876543210');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setStep('phoneOtp');
      setSuccessMsg('OTP sent to your phone.');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Verification
  const handleOtpVerify = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
      if (error) throw error;
      setSuccessMsg('Signed in successfully!');
      setStep('default');
      setPhone('');
      setOtp('');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${inter.className} w-full min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100`}>
      
      {/* Left Side - GIF */}
      <motion.div
        className="relative w-full h-80 md:h-full overflow-hidden"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/ricefield.gif"
          alt="Signin illustration"
          fill
          className="object-cover"
          priority
        />
        <motion.div
          className="absolute inset-0 bg-black/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
        />
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#14213d] mb-4">
            Welcome Back to <span className="text-[#fca311]">Prospero</span>
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Sign in to continue
          </p>

          {/* Toggle Email / Phone */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => { setMethod('email'); setStep('default'); }}
              className={`px-4 py-2 rounded-full font-medium ${method === 'email' ? 'bg-[#fca311] text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Email
            </button>
            <button
              onClick={() => { setMethod('phone'); setStep('default'); }}
              className={`px-4 py-2 rounded-full font-medium ${method === 'phone' ? 'bg-[#fca311] text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Phone
            </button>
          </div>

          {/* Email Form */}
          {method === 'email' && step === 'default' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 border border-gray-300 px-4 py-3 rounded-xl">
                <MdMailOutline className="text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 outline-none text-gray-800"
                />
              </div>
              <div className="flex items-center gap-3 border border-gray-300 px-4 py-3 rounded-xl">
                <MdLock className="text-gray-500 w-5 h-5" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 outline-none text-gray-800"
                />
              </div>
              <button
                onClick={handleEmailSignin}
                disabled={loading}
                className="w-full bg-[#fca311] text-white py-3 rounded-xl font-medium shadow-lg"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <button
                onClick={handleEmailOtpSignin}
                disabled={loading}
                className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-xl font-medium shadow"
              >
                {loading ? 'Sending OTP...' : 'Sign in with Email OTP'}
              </button>
            </div>
          )}

          {/* Phone Form */}
          {method === 'phone' && step === 'default' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 border border-gray-300 px-4 py-3 rounded-xl">
                <MdPhone className="w-5 h-5 text-gray-500" />
                <input
                  type="tel"
                  placeholder="+91XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 outline-none text-gray-800"
                />
              </div>
              <button
                onClick={handlePhoneSignin}
                disabled={loading}
                className="bg-[#fca311] text-white font-medium py-3 rounded-xl shadow"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          )}

          {/* Phone OTP Verification */}
          {step === 'phoneOtp' && (
            <div className="mt-6 p-6 rounded-xl border border-gray-300 shadow bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 text-[#14213d]">Enter OTP</h3>
              <input
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border px-4 py-3 rounded-xl outline-none text-gray-800 mb-4"
              />
              <button
                onClick={handleOtpVerify}
                disabled={loading}
                className="w-full bg-[#fca311] text-white py-3 rounded-lg font-medium shadow"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <p
                onClick={() => { setStep('default'); setOtp(''); }}
                className="text-sm text-center text-gray-600 mt-3 cursor-pointer hover:underline"
              >
                ← Back
              </p>
            </div>
          )}

          {/* Email OTP Notice */}
          {step === 'emailOtp' && (
            <div className="mt-6 p-6 rounded-xl border border-gray-300 shadow bg-gray-50">
              <p className="text-center text-gray-700 mb-4">
                Check your email for the magic link to sign in.
              </p>
              <button
                onClick={() => setStep('default')}
                className="w-full bg-[#fca311] text-white py-3 rounded-lg font-medium shadow"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Messages */}
          {errorMsg && <p className="text-red-500 text-sm mt-3">{errorMsg}</p>}
          {successMsg && <p className="text-green-600 text-sm mt-3">{successMsg}</p>}

          <p className="text-center text-gray-700 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/SignUp" className="text-[#fca311] font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
