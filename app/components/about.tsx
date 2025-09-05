import React from 'react';
import Image from 'next/image';
import { Playfair_Display } from "@next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
});
export default function About() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-white">

      {/* --- Image Column --- */}
      <div className="md:w-1/2 flex justify-center p-8">
        <Image
          src="/Herosection1.jpeg"
          alt="image"
          className="rounded-2xl shadow-lg object-cover"
          width={400} 
          height={400}
        />
      </div>

      {/* --- Text Column --- */}
      <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-gray-100 rounded-2xl shadow-lg mr-6">
        <h2 className={`text-4xl font-bold text-[#fca311] ${playfair.className} mb-4`}>About Us</h2>
        
        {/* ✅ Each paragraph is now a separate element */}
        <p className="text-black text-lg mb-4">
         At Prospero, we believe poverty is not permanent—it is a barrier that can be broken with the right opportunities, guidance, and care. Our mission is to create a future where every individual has the chance to learn, grow, and live with dignity.
        </p>

        <p className="text-black text-lg">
          Our core missions are:
        </p>
        
        {/* ✅ The list is a sibling, not a child of a <p> tag */}
        <ul className={`list-disc list-inside text-black font-medium text-lg ${playfair.className} my-4 space-y-2`}>
          <li>Education for Growth: Ensuring children and young adults have access to quality learning that unlocks brighter futures.</li>
          <li>Pathways to Employment: Empowering people with skills, opportunities, and connections to achieve financial independence.</li>
          <li>Dignity for Seniors: Supporting senior citizens with security, care, and access to essential resources.</li>
          <li>Community Progress: Building stronger, more inclusive communities where shared prosperity uplifts everyone.</li>
        </ul>

        <p className="text-black text-lg mb-4">
          Prospero is more than an initiative—it is a movement to turn challenges into opportunities and hope into reality. Together, we are working toward a society where poverty no longer defines lives, but resilience, opportunity, and progress do.
        </p>

        
          <h2 className="text-3xl md:text-4xl font-bold text-[#14213d] leading-tight">
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>alk
          Through the <br />
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>orld
          With Us — Together, <br />
          <span className="md:text-5xl text-4xl text-[#fca311]">W</span>e
          Prosper.
        </h2>
        

      </div>
    </div>
  );
}