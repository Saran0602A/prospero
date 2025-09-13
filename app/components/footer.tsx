import Link from "next/link";
import React from "react";
import { MdEmail } from "react-icons/md";
import { Inter, Anton } from "next/font/google";

// Modern clean font for footer content
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Bold impactful font for tagline
const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Footer() {
  return (
    <footer className="flex flex-col sticky top-0 z-[999] h-screen bg-black">
      {/* Top Section */}
      <div
        className={`flex-1 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-6 md:px-12 lg:px-20 py-12 ${inter.className}`}
      >
        {/* Location */}
        <div>
          <h2 className="text-2xl font-bold text-[#fca311] mb-4">Come By</h2>
          <p className="text-gray-300 leading-relaxed">
            7-147, Bakkanapalem Rd, Gandhi Nagar,
            Madhurawada, Visakhapatnam, Andhra Pradesh
            530048
          </p>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-2xl font-bold text-[#fca311] mb-4">Say Hello</h2>
          <Link
            href="mailto:mutnurisubham@gmail.com"
            className="flex items-center gap-2 text-gray-300 hover:text-[#fca311] transition-all duration-300"
          >
            <MdEmail size={24} className="text-[#fca311]" />
            mutnurisubham@gmail.com
          </Link>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-2xl font-bold text-[#fca311] mb-4">Explore</h2>
          <ul className="space-y-2 text-gray-300 font-medium">
            <li>
              <Link href="/Find" className="hover:text-[#fca311] transition">Find</Link>
            </li>
            <li>
              <Link href="/Offer" className="hover:text-[#fca311] transition">Offer</Link>
            </li>
            <li>
              <Link href="/About" className="hover:text-[#fca311] transition">About</Link>
            </li>
            <li>
              <Link href="/Contact" className="hover:text-[#fca311] transition">Contact</Link>
            </li>
            <li>
              <Link href="/Login" className="hover:text-[#fca311] transition">Login</Link>
            </li>
            <li>
              <Link href="/Signup" className="hover:text-[#fca311] transition">Signup</Link>
            </li>
          </ul>
        </div>

        {/* Mission */}
        <div>
          <h2 className="text-2xl font-bold text-[#fca311] mb-4">
            Prospera — Let’s Build the Future Together
          </h2>
          <p className="text-gray-300">
            “Let’s rise by lifting others.” Join us in creating a world without
            poverty through AI-driven solutions and community empowerment.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-700"></div>

      {/* Bottom Tagline */}
      <div
        className={`flex flex-col items-center justify-center text-center py-8 bg-[#fca311] ${anton.className}`}
      >
        <h2 className="text-white text-4xl md:text-5xl tracking-wide">
         -LET’S RISE BY LIFTING OTHERS-
        </h2>
        <span className="text-white text-5xl md:text-7xl font-extrabold mt-2">
          PROSPERA
        </span>
      </div>
    </footer>
  );
}
