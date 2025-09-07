import React from "react";
import { Playfair_Display } from "@next/font/google";
import Image from "next/image";
import Link from "next/link";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Hero() {
  return (
    <section
      className={`bg-[#E5E5E5] flex flex-col md:flex-row items-center justify-center h-screen px-6 md:px-16 gap-12 ${playfair.className} pt-19 md:pt-10 sticky z-[900] ` }
    >
      {/* Left Side - Text */}
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold text-[#14213d] leading-tight">
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>alk
          Through the <br />
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>orld
          With Us — Together, <br />
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>e
          Prosper.
        </h2>
        <p className="mt-6 text-[#000000] font-light text-lg md:text-xl leading-relaxed max-w-xl mx-auto md:mx-0">
          At Prospera, we harness the power of AI and cutting-edge technology to
          break the cycle of poverty and create opportunities for all. Our
          mission is to build a world where every individual thrives —
          empowering communities, driving sustainable growth, and paving the way
          for a future without poverty.
        </p>
        <Link href="/AboutUs" className="text-xl font-extrabold text-[#fca311] pt-2 md:pt-2">Learn About Us	&#8594;</Link>
      </div>

      {/* Right Side - Overlapping Images */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* First Image */}
        <div className="relative -top-5 z-10">
          <Image
            src="/hero1.jpg"
            alt="Hero Image 1"
            width={300}
            height={300}
            className="rounded-full shadow-2xl object-cover w-[220px] h-[220px] md:w-[280px] md:h-[280px] transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Second Image */}
        <div className="absolute md:-bottom-7 md:right-10 z-0 ">
          <Image
            src="/hero2.jpg"
            alt="Hero Image 2"
            width={300}
            height={300}
            className="rounded-full shadow-2xl object-cover w-[180px] h-[180px] md:w-[240px] md:h-[240px] transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>
    </section>
  );
}
