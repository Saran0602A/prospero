'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { MdEmail, MdLock, MdPhone } from 'react-icons/md';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const supabase = createClientComponentClient();

export default function SignupPage() {
  const router = useRouter();

  // User info
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'worker' | 'employer'>('worker');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [socialLinks, setSocialLinks] = useState({ linkedin: '', twitter: '' });
  const [avatarUrl, setAvatarUrl] = useState('');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpTarget, setOtpTarget] = useState<{ email?: string; phone?: string }>({});

  // OTP Countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown, step]);

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!email && !phone) return setErrorMsg('Provide email or phone.');

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const target = email ? { email } : { phone };
      setOtpTarget(target);

      const { error } = await supabase.auth.signInWithOtp(target);
      if (error) throw error;

      setStep('otp');
      setOtpCountdown(60);
      setSuccessMsg(`OTP sent to ${email || phone}`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & create user in table
  const handleVerifyOtp = async () => {
    if (!otpCode) return setErrorMsg('Enter OTP');

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let user: any = null;

      if (otpTarget.email) {
        const { data, error } = await supabase.auth.verifyOtp({
          email: otpTarget.email,
          token: otpCode,
          type: 'signup',
        });
        if (error) throw error;
        user = data.user;
      } else if (otpTarget.phone) {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: otpTarget.phone,
          token: otpCode,
          type: 'sms',
        });
        if (error) throw error;
        user = data.user;
      }

      if (!user?.id) throw new Error('User not found');

      // Convert skills and social links
      const skillsArray = skills.split(',').map(s => s.trim());
      const socialLinksJson = socialLinks;

      // Insert user profile
      const { error: dbError } = await supabase.from('users').insert({
        id: user.id,
        name: fullName,
        email,
        role,
        avatar_url: avatarUrl || null,
        bio: bio || null,
        skills: skillsArray,
        location: location || null,
        phone: phone || null,
        social_links: socialLinksJson,
        created_at: new Date(),
      });
      if (dbError) throw dbError;

      setSuccessMsg('Signup successful! Redirecting...');
      setTimeout(() => router.push('/'), 1500);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${inter.className} w-full min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gray-100`}>
      {/* Left Side Form */}
      <motion.div
        className="flex items-center justify-center p-6 md:p-12 bg-white"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#14213d] mb-4">
            {step === 'signup' ? 'Join' : 'Verify OTP'} <span className="text-[#fca311]">Prospero</span>
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {step === 'signup' ? 'Create your account' : 'Enter the OTP sent to you'}
          </p>

          {step === 'signup' ? (
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border px-4 py-3 rounded-xl outline-none" />
              <select value={role} onChange={e => setRole(e.target.value as 'worker' | 'employer')} className="w-full border px-4 py-3 rounded-xl">
                <option value="worker">Worker</option>
                <option value="employer">Employer</option>
              </select>
              <input type="text" placeholder="Short Bio" value={bio} onChange={e => setBio(e.target.value)} className="w-full border px-4 py-3 rounded-xl outline-none" />
              <input type="text" placeholder="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} className="w-full border px-4 py-3 rounded-xl outline-none" />
              <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="w-full border px-4 py-3 rounded-xl outline-none" />
              <div className="flex items-center gap-3 border px-4 py-3 rounded-xl">
                <MdEmail className="text-gray-500 w-5 h-5" />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 outline-none" />
              </div>
              <div className="flex items-center gap-3 border px-4 py-3 rounded-xl">
                <MdPhone className="text-gray-500 w-5 h-5" />
                <input type="tel" placeholder="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} className="flex-1 outline-none" />
              </div>
              <div className="flex items-center gap-3 border px-4 py-3 rounded-xl">
                <MdLock className="text-gray-500 w-5 h-5" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="flex-1 outline-none" />
              </div>
              <button onClick={handleSendOtp} disabled={loading} className="w-full bg-[#fca311] text-white py-3 rounded-xl font-medium shadow-lg mt-2">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Enter OTP" value={otpCode} onChange={e => setOtpCode(e.target.value)} className="w-full border px-4 py-3 rounded-xl outline-none" />
              <p className="text-gray-500 text-sm">OTP expires in {otpCountdown}s</p>
              <button onClick={handleVerifyOtp} disabled={loading || otpCountdown <= 0} className="w-full bg-[#fca311] text-white py-3 rounded-xl font-medium shadow-lg">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <p onClick={() => setStep('signup')} className="text-sm text-center text-gray-600 mt-2 cursor-pointer hover:underline">← Back</p>
            </div>
          )}

          {successMsg && <p className="text-green-600 mt-2 text-sm">{successMsg}</p>}
          {errorMsg && <p className="text-red-500 mt-2 text-sm">{errorMsg}</p>}

          <p className="text-center text-gray-700 mt-6">
            Already have an account? <Link href="/Signin" className="text-[#fca311] font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>

      {/* Right Side Image */}
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
  );
}
