import React from 'react'
import Header from '../components/header'
import Hero from '../components/hero'
import About from '../components/about'

export default function page() {
  return (
<div className="w-full min-h-screen overflow-x-hidden no-scrollbar">
  <Header />
  <Hero />
  <About />
  <section className="min-h-screen"></section>
  <section className="min-h-screen"></section>
</div>


  )
}
