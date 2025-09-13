"use client";

import React, { useRef, useState } from "react";
import { Playfair_Display } from "@next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Whatis() {
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
    setTimeout(() => {
      if (!isHovered) {
        videoRef.current?.pause();
      }
    }, 200);
  };

  return (
    <div className="flex flex-col items-center bg-[#faf8f8] justify-center text-center min-h-screen px-6 sticky top-0 z-[900] ">
      {/* Heading */}
      <h2 className={`${playfair.className} text-6xl mb-6`}>
        What is <b className="text-[#fca311]">Prospero?</b>
      </h2>

      {/* Answer */}
      <p className="text-2xl max-w-3xl text-[#1f1f1f] mb-10">
        Prospero is a mission-driven platform that empowers people to break free
        from poverty through education, opportunity, and community support.
      </p>

      {/* Video */}
      <div
        className="w-full flex justify-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          className="rounded-2xl shadow-lg w-[70%] md:w-[65%] lg:w-[60%] h-auto"
          muted
          loop
          playsInline
        >
          <source src="/videos/povwerty_video1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
