import React from 'react'
import Header from '../components/header'
import Hero from '../components/hero'

export default function page() {
  return (
<div className="w-full min-h-screen overflow-x-hidden no-scrollbar">
  <Header />
  <Hero />
  <section className="min-h-screen"></section>
  <section className="min-h-screen"></section>
</div>

  )
}
