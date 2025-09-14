"use client";

import React from "react";
import { Playfair_Display } from "@next/font/google";
import { motion, useScroll, useTransform } from "framer-motion";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Ready() {
  const { scrollYProgress } = useScroll();

  // Parallax for heading, subheading & button
  const yHeading = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const ySub = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const yButton = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  // Fade out smoothly as user scrolls past
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0]);

  // Background glow blob motion
  const blobY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const blobScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const blobRotate = useTransform(scrollYProgress, [0, 1], ["0deg", "25deg"]);

  return (
    <section className="relative z-[703] sticky top-0 w-full min-h-[90vh] flex flex-col items-center justify-center text-center bg-white px-6 overflow-hidden">
      {/* Background Glow Blob */}
      <motion.div
        style={{ y: blobY, scale: blobScale, rotate: blobRotate }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        w-[750px] h-[750px] bg-gradient-to-r from-[#fca311]/40 via-pink-300/30 to-blue-300/30 
        rounded-full blur-3xl opacity-50"
      />

      {/* Heading */}
      <motion.h1
        style={{ y: yHeading, opacity }}
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        viewport={{ once: true }}
        className={`${playfair.className} text-4xl md:text-6xl font-bold leading-tight mb-6 relative z-10`}
      >
        Together, we shape a{" "}
        <motion.span
          style={{
            y: useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]),
          }}
          className="text-[#fca311] italic relative inline-block"
        >
          brighter future
        </motion.span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        style={{ y: ySub, opacity }}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: true }}
        className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 relative z-10"
      >
        Prospero empowers communities with free schools, skill guidance, and
        local opportunities—creating hope and pathways for all.
      </motion.p>

      {/* Call to Action Button */}
      <motion.button
        style={{ y: yButton, opacity }}
        initial={{ opacity: 0, y: 80, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative px-7 py-3 rounded-full bg-black text-white font-medium cursor-pointer transition shadow-lg overflow-hidden group z-10"
      >
        <span className="relative z-10">Get Started →</span>
        {/* Shine Effect */}
        <motion.span
          initial={{ x: "-100%" }}
          whileHover={{ x: "200%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
        />
      </motion.button>
    </section>
  );
}
