import React from 'react'
import SignupPage from '../components/SignupPage'

import { Metadata } from 'next';

export const metadata:Metadata = {
  title:{
    absolute:"Sign up"
  },
  description:"Sign up for Prospero – your all-in-one platform to find local jobs, access free AI-powered scholarship programs, share your community achievements, and contribute to meaningful causes. Connect with nearby opportunities, showcase your social impact, and make a difference with Prospero’s easy-to-use platform.",
  
}

export default function page() {
  return (
    <div>
      <SignupPage />
    </div>
  )
}


