import Link from 'next/link';
import React from 'react';
import { IoArrowBackSharp } from 'react-icons/io5';


export default function ExtraHeader() {

  
  const PRIMARY_BLUE = '#14213d';

  return (
    // Outer section acts as the fixed container, giving background and height
    <header 
        className=' top-0 left-0 right-0 h-[65px] bg-white/95 backdrop-blur-sm shadow-md transition-all duration-300'
    >
        {/* Inner container handles content layout (Back button and Logo) */}
        <section 
            className='max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8'
        >
            {/* Left: Back Button (Uses router.back() for flexibility) */}
            <div>
                <Link href='/'
                    
                    className='flex items-center gap-1 text-base sm:text-lg font-semibold text-gray-700 hover:text-orange-400  transition-colors p-2 rounded-lg'
                >
                    <IoArrowBackSharp className='w-5 h-5 sm:w-6 sm:h-6' /> 
                    <span>Back</span>
                </Link>
            </div>

            {/* Right: Prospero Logo/Title */}
            <div className="flex items-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#000000] tracking-tight">
                    Pros
                    <span className="text-[#14213d] font-medium">pero</span>
                    <sup className="text-[#14213d] font-bold text-xl">.</sup>
                </h1>
            </div>
        </section>
    </header>
  );
}