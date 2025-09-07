"use client";

import React from "react";
import { Playfair_Display, Inter } from "next/font/google";

// Using a serif font for headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Using a clean sans-serif for body text
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Data for our action cards, now with emojis instead of lucide-react icons
const involvementOptions = [
  {
    icon: "🤝",
    title: "Volunteer",
    desc: "Share your time and skills to directly uplift children, youth, and seniors in our community.",
    iconBg: "bg-rose-100 text-rose-600",
  },
  {
    icon: "💰",
    title: "Donate",
    desc: "Your contribution directly funds education, employment, and senior care programs.",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: "📢",
    title: "Spread the Word",
    desc: "Amplify our mission and impact by sharing Prospero's story with your network.",
    iconBg: "bg-sky-100 text-sky-600",
  },
];

export default function GetInvolved() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center sticky z-[999] text-center py-20 px-6">
      {/* --- Hero / Intro --- */}
      <h1
        className={`text-4xl md:text-6xl font-bold text-[#14213d] ${playfair.className}`}
      >
        Join the Movement
      </h1>
      <p
        className={`mt-4 text-lg md:text-xl max-w-2xl mx-auto text-gray-600 ${inter.className}`}
      >
        Be a part of Prospero’s mission. Every action—big or small—creates a
        ripple of hope, dignity, and opportunity.
      </p>

      {/* --- Action Cards Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl w-full">
        {involvementOptions.map((item, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center cursor-pointer"
          >
            <div
              className={`w-16 h-16 flex items-center justify-center rounded-full text-3xl font-bold mb-5 transition-transform duration-300 hover:scale-110 ${item.iconBg}`}
            >
              {item.icon}
            </div>
            <h3
              className={`text-2xl font-bold text-[#14213d] mb-3 ${playfair.className}`}
            >
              {item.title}
            </h3>
            <p className={`text-gray-600 leading-relaxed ${inter.className}`}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* --- Call to Action --- */}
      <div className="mt-16">
        <button
          className={`bg-[#fca311] text-[#14213d] px-8 py-4 rounded-xl font-bold text-lg ${inter.className} flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/30 hover:bg-[#ffb733] transition-all duration-300`}
        >
          Start Making a Difference →
        </button>
      </div>
    </div>
  );
}
