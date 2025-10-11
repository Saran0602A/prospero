import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div className='flex flex-col justify-center items-center min-h-screen gap-4'>
      <h1 className='text-4xl font-bold'>404 - Not Found</h1>
      <p className='text-lg'>The page you are looking for does not exist.</p>
      <Link href="/" className='text-blue-500 hover:underline'>Go back home</Link>

    </div>
  )
}
