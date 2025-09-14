"use client";
import React, { useRef } from "react";
import { Playfair_Display } from "@next/font/google";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Hero() {
  const ref = useRef(null);

  // Scroll progress for parallax
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const img1Y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const img2Y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Variants for "fall down" animation
  const textFallVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.8, ease: "easeInOut" },
    }),
  };

  return (
  <section
  ref={ref}
  className={`bg-gradient-to-br from-[#fdfcfb] to-[#e5e5e5] flex flex-col md:flex-row items-center justify-center h-screen px-6 md:px-16 gap-12 ${playfair.className} relative overflow-hidden pt-[120px] md:pt-0`}
>

      {/* Left Side - Text */}
      <motion.div
        className="flex-1 text-center md:text-left"
        style={{ y: textY }}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-[#14213d] leading-tight"
          variants={textFallVariants}
          custom={0} // no delay
        >
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>alk
          Through the <br />
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>orld
          With Us — Together, <br />
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>e
          Prosper.
        </motion.h2>

        <motion.p
          className="mt-6 text-[#000000] font-light text-lg md:text-xl leading-relaxed max-w-xl mx-auto md:mx-0"
          variants={textFallVariants}
          custom={1} // delay 0.2s
        >
          At Prospera, we harness the power of AI and cutting-edge technology to
          break the cycle of poverty and create opportunities for all. Our
          mission is to build a world where every individual thrives —
          empowering communities, driving sustainable growth, and paving the way
          for a future without poverty.
        </motion.p>

        <motion.div variants={textFallVariants} custom={2}>
          <Link
            href="/AboutUs"
            className="text-xl font-extrabold text-[#fca311] pt-2 md:pt-2 inline-block hover:translate-x-1 transition-transform duration-200"
          >
            Learn About Us →
          </Link>
        </motion.div>
      </motion.div>

      {/* Right Side - Overlapping Images */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* First Image (foreground, moves faster) */}
        <motion.div className="relative -top-5 z-10" style={{ y: img1Y }}>
          <Image
            src="/magictree.gif"
            alt="Smiling community leader"
            width={500}
            height={500}
            className="rounded-full shadow-2xl object-cover w-[220px] h-[220px] md:w-[400px] md:h-[400px]"
          />
        </motion.div>

      {/* Second Image (background, moves slower) */}
      {/* 
      <motion.div
        className="absolute md:-bottom-7 md:right-10 z-0"
        style={{ y: img2Y }}
      >
        <Image
          src="/hero2.jpg"
          alt="Happy children together"
          width={300}
          height={300}
          className="rounded-full shadow-2xl object-cover w-[180px] h-[180px] md:w-[240px] md:h-[240px]"
        />
      </motion.div>
      */}
    </div>
    </section>
  );
}
