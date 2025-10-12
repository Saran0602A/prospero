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
    // Responsive container: height is set to auto on desktop/mobile now that sticky is removed
    <footer className="flex flex-col w-full bg-black">
      
      {/* Top Section: Links, Contact, Location, Mission */}
      <div
        className={`flex-1 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 
                    px-4 sm:px-6 lg:px-8 py-10 lg:py-16 ${inter.className}`}
      >
        {/* 1. Location */}
        <div className="order-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#fca311] mb-3">Come By</h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            7-147, Bakkanapalem Rd, Gandhi Nagar,
            Madhurawada, Visakhapatnam, Andhra Pradesh
            530048
          </p>
        </div>

        {/* 2. Contact */}
        <div className="order-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#fca311] mb-3">Say Hello</h2>
          <Link
            href="mailto:aksraboys@gmail.com"
            className="flex items-center gap-2 text-gray-300 text-sm sm:text-base hover:text-[#fca311] transition-all duration-300"
          >
            <MdEmail size={24} className="text-[#fca311]" />
            Mail Us
          </Link>
        </div>

        {/* 3. Quick Links */}
        <div className="order-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#fca311] mb-3">Explore</h2>
          <ul className="space-y-2 text-gray-300 font-medium text-sm sm:text-base">
           
            <li>
              <Link href="/About" className="hover:text-[#fca311] transition">About</Link>
            </li>
          
            <li>
              <Link href="/Login" className="hover:text-[#fca311] transition">Login</Link>
            </li>
            <li>
              <Link href="/Signup" className="hover:text-[#fca311] transition">Signup</Link>
            </li>
          </ul>
        </div>

        {/* 4. Mission (Stacked last on mobile, moved to its position on LG) */}
        <div className="order-4 lg:order-4 col-span-1 sm:col-span-2 lg:col-span-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#fca311] mb-3">
            Prospera — Let’s Build the Future Together
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            “Let’s rise by lifting others.” Join us in creating a world without
            poverty through AI-driven solutions and community empowerment.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-700"></div>

      {/* Bottom Tagline (High Impact Bar) */}
      <div
        className={`flex flex-col items-center justify-center text-center py-6 sm:py-8 bg-[#fca311] ${anton.className}`}
      >
        <h2 className="text-black text-2xl sm:text-4xl md:text-5xl tracking-wide leading-none">
         -LET’S RISE BY LIFTING OTHERS-
        </h2>
        <span className="text-black text-4xl sm:text-6xl md:text-7xl font-extrabold mt-1 sm:mt-2">
          PROSPERA
        </span>
        <p className="text-black text-sm font-medium mt-1">
            &copy; {new Date().getFullYear()} Prospera. All rights reserved.
        </p>
      </div>
    </footer>
  );
}