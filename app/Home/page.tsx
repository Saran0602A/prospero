"use client";
import React from 'react'
import Header from '../components/header'
import Hero from '../components/hero'
import Footer from '../components/footer'
import Whatis from '../components/whatis'
import Features from '../components/features';
import Ready from '../components/ready'

export default function page() {
  return (
<div className="w-full min-h-screen overflow-x-hidden no-scrollbar">
   
  <Header />
  <Hero />
  <Whatis/>
  <Features />
  <Ready />
  <Footer />
</div>


  )
}
