"use client";

import React, { useRef, useState } from "react";
import { Playfair_Display } from "@next/font/google";
import { motion, useScroll, useTransform } from "framer-motion";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Whatis() {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Scroll progress for parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"], // Animate while scrolling through section
  });

  // Left-to-right parallax for text
  const headingX = useTransform(scrollYProgress, [0, 1], ["-100px", "0px"]);
  const paraX = useTransform(scrollYProgress, [0, 1], ["-150px", "0px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  const handleMouseEnter = async () => {
    setIsHovered(true);
    try {
      await videoRef.current?.play();
    } catch (err) {
      console.warn("Autoplay blocked:", err);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTimeout(() => {
      if (!isHovered) {
        videoRef.current?.pause();
      }
    }, 200);
  };

  return (
    <div
      ref={ref}
      className="flex flex-col items-center bg-[#faf8f8] justify-center text-center min-h-screen px-6 sticky top-10 z-[701]"
    >
      {/* Heading */}
      <motion.h2
        style={{ x: headingX, opacity }}
        className={`${playfair.className} text-6xl mb-6`}
      >
        What is <b className="text-[#fca311]">Prospero?</b>
      </motion.h2>

      {/* Answer */}
      <motion.p
        style={{ x: paraX, opacity }}
        className="text-2xl max-w-3xl text-[#1f1f1f] mb-10"
      >
        Prospero is a mission-driven platform that empowers people to break free
        from poverty through education, opportunity, and community support.
      </motion.p>

      {/* Video */}
      <motion.div
        className="w-full flex justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.video
          ref={videoRef}
          className="rounded-2xl shadow-lg w-[70%] md:w-[65%] lg:w-[60%] h-auto"
          muted
          loop
          playsInline
          controls
          whileHover={{ scale: 1.03 }} // subtle zoom on hover
          transition={{ duration: 0.3 }}
        >
          <source src="/videos/povwerty_video1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </motion.video>
      </motion.div>
    </div>
  );
}
