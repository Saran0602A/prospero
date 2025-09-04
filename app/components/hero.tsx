import React from 'react'
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});
export default function Hero() {
  return (
    <section className={`bg-[#E5E5E5] flex flex-col inset-0  relative  min-h-screen ${`playfair.className`}`} >
    <div className={` text-5xl md:text-6xl font-bold text-gray-900 leading-tight`}>
        <h2>Walk Through the <br/>World With Us — Together, <br/>We Prosper.</h2>
       
    </div>
    <div></div>
    </section>
  )
}
