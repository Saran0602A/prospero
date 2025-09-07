"use client";

import React, { useRef, useState } from "react";
import { Playfair_Display } from "@next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
});

export default function About() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

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
    // Only pause if not hovered
    setTimeout(() => {
      if (!isHovered) {
        videoRef.current?.pause();
      }
    }, 200); // tiny delay to avoid race condition
  };

  return (
    <div
      className="min-h-screen sticky top-0 z-[999] flex flex-col md:flex-row items-center justify-center bg-white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
        
      {/* --- Video Column --- */}
      <div className="md:w-1/2 flex justify-center p-8 md:p-12">
        <video
          ref={videoRef}
          className="rounded-2xl shadow-lg w-full h-auto"
          muted
          loop
          playsInline
        >
          <source src="\videos\povwerty_video1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
      </div>

      {/* --- Text Column --- */}
      <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-gray-100 rounded-2xl shadow-lg mr-6">
        <h2
          className={`text-4xl font-bold text-[#fca311] ${playfair.className} mb-4`}
        >
          About Us
        </h2>
        <p className="text-black text-lg mb-4">
          At Prospero, we break poverty barriers through{" "}
          <span className="font-semibold">education, employment, senior care,</span>{" "}
          and <span className="font-semibold">community progress</span>—creating a
          future of dignity, opportunity, and shared prosperity.
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#14213d] leading-tight mt-6">
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>alk
          Through the <br />
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>orld With
          Us — Together, <br />
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>e Prosper.
        </h2>
      </div>
    </div>
  );
}
