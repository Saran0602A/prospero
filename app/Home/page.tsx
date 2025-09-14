import React from 'react'
import HomePage from '../fullpage/HomePage'

import { Metadata } from 'next';

export const metadata:Metadata = {
  title:{
    absolute:"ProsPero"
  },
  description:"Join Prospero – your all-in-one platform to find local jobs, access free AI-powered scholarship programs, share your community achievements, and contribute to meaningful causes. Connect with nearby opportunities, showcase your social impact, and make a difference with Prospero’s easy-to-use platform.",
  
}

export default function page() {
  return (
    <div>
      <HomePage />
    </div>
  )
}
