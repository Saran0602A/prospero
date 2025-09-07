"use client";
import React from 'react'
import Header from '../components/header'
import Hero from '../components/hero'
import Footer from '../components/footer'
import About from '../components/about'
import Offer from '../components/offer'

export default function page() {
  return (
<div className="w-full min-h-screen overflow-x-hidden no-scrollbar">
   
  <Header />
  <Hero />
  <About />
  <Offer/>
  
  <Footer />
</div>


  )
}
