import Link from 'next/link'
import React from 'react'
import { IoArrowBackSharp } from 'react-icons/io5'

export default function ExtraHeader() {
  return (
    <header className='flex  min-w-full max-h-[120px]  justify-between p-2 items-center'  >
        <div >
            <Link href="/" className='flex justify-center items-center'><IoArrowBackSharp className='text-black text-xl'/><p>Back</p></Link>
            
        </div>
      <div>

        <h1 className="text-2xl font-extrabold text-[#000000] tracking-tight ">
          Pros
          <span className="text-[#14213d] font-medium">pero</span>
          <sup className="text-[#14213d] font-bold text-xl">.</sup>
        </h1>
      </div>
      
    </header>
  )
}
