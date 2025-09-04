'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { Inter } from 'next/font/google'
import { FiMenu, FiX } from 'react-icons/fi'

// Import Inter font
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header
      className={`${inter.className} fixed top-0 left-0 right-0 z-[999] h-[75px] flex items-center justify-between px-6 sm:px-8 backdrop-blur-lg bg-white/20 border-b border-white/30 shadow-lg transition-all duration-300`}
    >
      {/* Logo */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#000000] tracking-tight drop-shadow-lg">
          Pros
          <span className="text-[#14213d] font-semibold">pero</span>
          <sup className="text-[#14213d] font-bold text-xl">.</sup>
        </h1>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-8 text-lg font-medium text-[#1f1f1f]">
        <Link href="/Find" className="hover:text-[#14213d] transition-colors">
          Find
        </Link>
        <Link href="/Offer" className="hover:text-[#14213d] transition-colors">
          Offer
        </Link>
        <Link href="/About" className="hover:text-[#14213d] transition-colors">
          About
        </Link>
        <Link href="/Contact" className="hover:text-[#14213d] transition-colors">
          Contact
        </Link>
      </nav>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex space-x-5 text-lg font-medium">
        <Link
          href="/Login"
          className="px-4 py-2 rounded-lg border border-[#14213d] text-[#14213d] hover:bg-[#14213d] hover:text-white transition-all shadow-sm"
        >
          Login
        </Link>
        <Link
          href="/Signup"
          className="px-4 py-2 rounded-lg bg-[#14213d] text-white hover:bg-[#0d1b2a] transition-all shadow-sm"
        >
          Signup
        </Link>
      </div>

      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-3xl text-[#14213d] z-[1000]"
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile Menu */}
    <div
  className={`fixed top-[75px] left-0 right-0 backdrop-blur-xl shadow-lg border-b border-white/30 transition-all duration-300 ease-in-out ${
    isOpen
      ? 'bg-white/90 opacity-100 visible translate-y-0'
      : 'bg-white/30 opacity-0 invisible -translate-y-5'
  }`}
>
        <nav className="flex flex-col items-center space-y-5 py-6 text-xl font-semibold">
          <Link href="/Find" onClick={() => setIsOpen(false)}>
            Find
          </Link>
          <Link href="/Offer" onClick={() => setIsOpen(false)}>
            Offer
          </Link>
          <Link href="/About" onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link href="/Contact" onClick={() => setIsOpen(false)}>
            Contact
          </Link>
          <div className="flex space-x-4">
            <Link
              href="/Login"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2 rounded-lg border border-[#14213d] text-[#14213d] hover:bg-[#14213d] hover:text-white transition-all"
            >
              Login
            </Link>
            <Link
              href="/Signup"
              onClick={() => setIsOpen(false)}
              className="px-5 py-2 rounded-lg bg-[#14213d] text-white hover:bg-[#0d1b2a] transition-all"
            >
              Signup
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
