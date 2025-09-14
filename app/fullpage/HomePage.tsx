'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inter } from '@next/font/google';
import Header from '../components/header';
import Hero from '../components/hero';
import Footer from '../components/footer';
import Whatis from '../components/whatis';
import Features from '../components/features';
import Ready from '../components/ready';


const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full min-h-screen overflow-x-hidden no-scrollbar relative">
      {/* Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#e5e5e5]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
          >
            <motion.div
              className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.25, ease: 'easeInOut' }}
            >
              {/* Circle Background */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
              />

              {/* Text */}
              <motion.h1
                className={`${inter.className} text-3xl md:text-5xl font-extrabold tracking-tight z-10`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2, ease: 'easeInOut', delay: 0.5 }}
              >
                <span className="text-[#000000] font-extrabold">Pros</span>
                <span className="text-[#14213d] font-medium">pero</span>
                <sup className="text-[#14213d] font-bold text-xl">.</sup>
              </motion.h1>

              {/* Circle expand reveal for main page */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[#fca311] z-0"
                initial={{ scale: 0 }}
                animate={{ scale: 25 }}
                transition={{ duration: 2, ease: 'easeInOut', delay: 2.5 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {!loading && (
        <div className="relative z-0">
          <Header />
          <Hero />
          <Whatis />
          <Features />
          <Ready />
          <Footer />
        </div>
      )}
    </div>
  );
}
