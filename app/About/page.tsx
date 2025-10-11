import React from 'react'
import Header from '../components/header'

import AboutProspero from '../components/AboutProspero'
import Footer from '../components/footer'
import ExtraHeader from '../components/ExtraHeader'
export default function page() {
  return (
    <div>
      <ExtraHeader/>
      <AboutProspero />
      <Footer />
    </div>
  )
}
