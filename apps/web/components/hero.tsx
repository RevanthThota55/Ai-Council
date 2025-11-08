'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { ChevronDown } from 'lucide-react'

export default function Hero() {
  // Floating agent emojis
  const agents = ['🧠', '💡', '🎯', '🚀']

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-brand-br">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating Agent Avatars */}
      <div className="absolute inset-0 pointer-events-none">
        {agents.map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-20"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + (i % 2) * 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Your Personal Council of
            <br />
            <span className="text-white/90">AI Experts</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Get collaborative advice from 4 specialized AI agents working together to help you achieve any goal
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-brand-indigo hover:bg-gray-50 font-semibold text-lg px-8 py-6 h-auto shadow-2xl"
              >
                Start Free
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 h-auto"
              >
                See How It Works
              </Button>
            </a>
          </div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-12 text-white/80 text-sm"
          >
            ✨ Join thousands building with AI councils
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <a href="#features" className="flex flex-col items-center text-white/60 hover:text-white/80 transition-colors">
            <span className="text-sm mb-2">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

