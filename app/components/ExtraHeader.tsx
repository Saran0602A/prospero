import Link from 'next/link'
import React from 'react'
import { IoArrowBackSharp } from 'react-icons/io5'

export default function ExtraHeader() {
  return (
    <section className='flex  min-w-full max-h-[120px]  justify-around p-2 items-center '  >
       <div>
        <Link href="/" className='text-3xl fixed text-[#14213d] font-bold '>
         <h1 className='flex'><IoArrowBackSharp /> <span className='text-2xl'>back</span></h1> 
        </Link>
       </div>
      <div>

        <h1 className="text-2xl fixed font-extrabold text-[#000000] tracking-tight ">
          Pros
          <span className="text-[#14213d] font-medium">pero</span>
          <sup className="text-[#14213d] font-bold text-xl">.</sup>
        </h1>
      </div>

    </section>
  )
}
