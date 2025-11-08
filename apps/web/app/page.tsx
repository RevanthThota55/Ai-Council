'use client'

import Navbar from '../components/navbar'
import Hero from '../components/hero'
import Features from '../components/features'
import HowItWorks from '../components/how-it-works'
import UseCases from '../components/use-cases'
import Pricing from '../components/pricing'
import CTASection from '../components/cta-section'
import Footer from '../components/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Pricing />
      <CTASection />
      <Footer />
    </main>
  )
}
