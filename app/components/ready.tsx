"use client";

import React from "react";
import { Playfair_Display } from "@next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Ready() {
  return (
    <section className="z-[999] sticky top-0 w-full min-h-[70vh] flex flex-col items-center justify-center text-center bg-white px-6">
      
    
      <h1
        className={`${playfair.className} text-4xl md:text-6xl font-bold leading-tight mb-6`}
      >
        Together, we shape a{" "}
        <span className="text-[#fca311] italic">brighter future</span>
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
        Prospero empowers communities with free schools, skill guidance, and local opportunities— 
        creating hope and pathways for all.
      </p>

      {/* Call to Action Button */}
      <button className="px-6 py-3 rounded-full bg-green-400 text-black font-medium hover:bg-[#fca311] cursor-pointer hover:text-white transition shadow-md">
        Get Started →
      </button>
    </section>
  );
}
