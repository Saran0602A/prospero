import React from 'react';
import { FaLaptopCode, FaDatabase, FaRobot, FaHandHoldingHeart } from 'react-icons/fa';
import { MdOutlinePublic } from 'react-icons/md';

const PRIMARY_HEX = '#fca311'; // Prospera Orange
const SECONDARY_BLUE = '#14213d'; // Dark Blue/LinkedIn style for text accents

const TeamMember = ({ name, role, focus, icon, color }) => (
    // Responsive: Swaps to single column stack on small screens, back to horizontal on medium
    <div className="flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4 space-y-3 sm:space-y-0 p-5 rounded-xl border border-gray-100 bg-gray-50 shadow-md">
        <div className="p-3 rounded-full text-white flex-shrink-0" style={{ backgroundColor: color }}>
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-extrabold text-gray-900">{name}</h3>
            <p className="text-sm font-semibold mb-1" style={{ color: color }}>{role}</p>
            <p className="text-sm text-gray-600">{focus}</p>
        </div>
    </div>
);

// Icon Card for features/values
const FeatureCard = ({ icon, title, description, color }) => (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-2xl hover:scale-[1.01] transform">
        <div className={`p-4 rounded-full inline-block mb-4 text-white`} style={{ backgroundColor: color }}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-base">{description}</p>
    </div>
);


export default function AboutProspero() {
  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-16 px-4 sm:px-6 lg:px-8 bg-stone-50">
      
      {/* Header & Mission Statement */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
        
        {/* Left: Mission Statement (High Impact) */}
        <div className="space-y-4 lg:space-y-6 lg:pt-10">
          {/* Responsive Heading Size */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-gray-900 leading-tight">
            Walk Through the World With Us —
            <br />
            <span style={{ color: PRIMARY_HEX }}>Together, We Prosper.</span>
          </h1>
          <blockquote className="text-lg sm:text-xl italic font-medium text-gray-600 border-l-4 pl-4" style={{ borderColor: PRIMARY_HEX }}>
            "At **Prospera**, we harness the power of AI and cutting-edge technology to break the cycle of poverty and create opportunities for all."
          </blockquote>
        </div>

        {/* Right: Static Info Box (Vision) */}
        <div className="p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4" style={{ backgroundColor: '#fffbe6' }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Vision</h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                Our mission is to build a world where every individual thrives — empowering communities, driving sustainable growth, and paving the way for a future without poverty.
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                We blend the professional utility of **LinkedIn** for job searching with a vital community hub. Our specialized **AI Chatbot** ensures every user has access to personalized guidance for job preparedness and community best practices.
            </p>
            
            <div className="flex items-center space-x-3 text-lg font-bold pt-2" style={{ color: SECONDARY_BLUE }}>
                <FaRobot className="text-3xl" />
                <span>AI-Powered Guidance & Opportunity.</span>
            </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-12 lg:mb-16">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6 sm:mb-8 border-b pb-4">
            The Founding Team
        </h2>
        {/* Responsive Grid: 1 column on small screens, 2 columns on medium screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          
          <TeamMember
            name="Subham Kumar"
            role="Frontend Architect & Database Lead"
            focus="Designed the user experience (UI/UX), implemented all client-side logic using React, and managed core database infrastructure (Supabase)."
            icon={<FaLaptopCode className="text-xl" />}
            color={PRIMARY_HEX}
          />
          
          <TeamMember
            name="Saran Kumar"
            role="Backend Specialist & AI Integration"
            focus="Developed the server-side architecture, integrated the Langchain LLM framework for the Chatbot functionality, and managed complex APIs."
            icon={<FaRobot className="text-xl" />}
            color={SECONDARY_BLUE}
          />
        </div>
      </section>

      {/* Product Features Summary */}
       <section className="mb-8 lg:mb-16">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6 sm:mb-8 border-b pb-4">
            Our Core Technology Pillars
        </h2>
        {/* Responsive Grid: 1 column on small, 3 columns on medium/large */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
                icon={<FaDatabase className="text-2xl" />}
                title="Supabase Implementation"
                description="Robust, real-time data layer handling user profiles, job listings, and application tracking with secure RLS policies."
                color={SECONDARY_BLUE}
            />
            <FeatureCard
                icon={<FaRobot className="text-2xl" />}
                title="Langchain & AI Chatbot"
                description="LLM integration provides instant, personalized guidance on education, job readiness, and community resources."
                color={PRIMARY_HEX}
            />
            <FeatureCard
                icon={<FaHandHoldingHeart className="text-2xl" />}
                title="Community-First Frontend"
                description="A highly accessible, empowering UI built with React and Framer Motion, designed for clarity and engagement across all devices."
                color="#059669"
            />
        </div>
      </section>

      {/* --- MIT License Section (Added for Compliance) --- */}
      <section className="mt-16 pt-8 border-t border-gray-300 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Software License (MIT)</h2>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {`Copyright 2025 Subham Kumar

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`}
        </pre>
      </section>
    </div>
  );
}