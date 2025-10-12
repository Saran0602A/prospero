'use client'

import React, { useState, useEffect } from 'react'
import { Playfair_Display } from 'next/font/google'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'

const supabase = createClientComponentClient()

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
})

export default function Features() {
  const [session, setSession] = useState<Session | null>(null)
  // Use a sensible default ID until the session loads.
  const [userId, setUserId] = useState('placeholder-id') 
  const { scrollYProgress } = useScroll();

  // --- Session and User ID Fetching ---
  useEffect(() => {
    const fetchSession = async () => {
      // 1. Fetch the session
      const { data } = await supabase.auth.getSession()
      setSession(data.session)

      if (data.session?.user) {
        const currentUserId = data.session.user.id;
        setUserId(currentUserId); // Update the user ID state
        
        // 2. Fetch user data (optional: kept for avatar URL fetching logic)
        const { data: userData } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', currentUserId)
          .maybeSingle()
        // Here you would typically store the avatar URL if needed in this component
      }
    }

    // Set up a listener for real-time auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        if (session) {
            setUserId(session.user.id);
        } else {
            setUserId('guest'); // Set a generic ID if logged out
        }
    })

    fetchSession()
    
    // Cleanup function for the listener
    return () => {
        authListener.subscription.unsubscribe()
    }
  }, []) // Depend on the supabase client reference, which is stable here

  // Parallax effects
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const rotateImage = useTransform(scrollYProgress, [0, 1], ["0deg", "8deg"]);
  const scaleImage = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const yText = useTransform(scrollYProgress, [0.2, 1], ["50%", "-10%"]);
  const opacityText = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

  // Determine the base link path based on whether the user is logged in
  const dashboardPath = session ? `/Dasboard/${userId}` : '/Signup';
  const findPath = session ? `/Find/${userId}` : '/Signup';
  
  // Custom styling for links based on login status
  const linkStyle = session ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed";

  return (
    <section className="w-full flex flex-col sticky top-0 z-[702] items-center justify-center px-8 py-32 bg-white">
      {/* Title */}
      <h2
        className={`${playfair.className} text-4xl md:text-5xl font-semibold mb-12 text-center`}
      >
        How Prospero Empowers Communities
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-center w-full">
        {/* Left Side - Parallax Illustration */}
        <motion.div
          style={{
            y: yImage,
            rotate: rotateImage,
            scale: scaleImage,
          }}
          className="md:w-1/2 flex justify-center mb-10 md:mb-0"
        >
          <Image
            src="/featureimg.png"
            alt="Prospero illustration"
            width={500}
            height={500}
            className="rounded-xl shadow-2xl w-[90%] md:w-[80%]"
          />
        </motion.div>

        {/* Right Side - Steps with Vertical Parallax */}
        <motion.div
          style={{ y: yText, opacity: opacityText }}
          className="md:w-1/2 space-y-10"
        >
          {/* Step 1: Education */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex items-start space-x-4"
          >
            <span className="text-3xl font-bold text-green-600">1</span>
            <div>
              <h3 className="text-xl font-semibold">
                Free Schools & Skill Roadmaps Using Chatbot 
              </h3>
              <p className="text-gray-600 mb-3">
                We provide free education for children and skill guidance for
                adults, helping every learner unlock their true potential using our personalized chatbot.
              </p>
              <Link href="/About" className="px-4 py-2 text-sm rounded-lg bg-green-600 cursor-pointer text-white hover:bg-green-700 transition">
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Step 2: Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex items-start space-x-4"
          >
            <span className="text-3xl font-bold text-yellow-500">2</span>
            <div>
              <h3 className="text-xl font-semibold">Dashboard & Connection</h3>
              <p className="text-gray-600 mb-3">
               Access a personalized dashboard to track job applications, manage roles, and connect with the community.
              </p>
              {/* Using dynamic path based on login status */}
              <Link href={dashboardPath} className={`px-4 py-2 text-sm rounded-lg text-white transition ${linkStyle}`}>
                {session ? 'Go to Dashboard' : 'Sign Up to Access'}
              </Link>
            </div>
          </motion.div>

          {/* Step 3: Jobs */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex items-start space-x-4"
          >
            <span className="text-3xl font-bold text-blue-600">3</span>
            <div>
              <h3 className="text-xl font-semibold">
                Local Jobs & Opportunities
              </h3>
              <p className="text-gray-600 mb-3">
                Our platform connects people with local job opportunities,
                creating pathways to stable incomes and brighter futures.
              </p>
              {/* Using dynamic path based on login status */}
              <Link href="/Find"className={`px-4 py-2 text-sm rounded-lg bg-blue-600 cursor-pointer text-white hover:bg-blue-700 transition`}>
                Explore Jobs
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
