'use client';

import React from 'react';

export default function FindBody() {
  return (
    <section className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-[#E5E5E5] px-4">
      <div className="w-full max-w-3xl text-center">
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#14213d] mb-4">
          Discover Your Next Opportunity
        </h1>
        <p className="text-gray-700 mb-8">
          Search for opportunities by <span className="font-medium">Title</span> or <span className="font-medium">City</span>.
        </p>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <input
            type="search"
            placeholder="e.g. Software Engineer, Hyderabad…"
            className="w-full sm:flex-1 px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#fca311] text-gray-800 shadow-sm transition"
          />
          <button
            className="w-full sm:w-auto px-6 py-3 bg-[#fca311] text-white font-semibold rounded-xl hover:bg-[#e69500] shadow-md transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}
