'use client'

import { MessageSquare, Sparkles, MessagesSquare } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Describe Your Goal',
    description: 'Tell us what you want to achieve. Whether it\'s learning a new skill, starting a business, or solving a problem - we\'ll listen.',
    icon: MessageSquare
  },
  {
    number: '02',
    title: 'Get AI Recommendations',
    description: 'Our AI analyzes your goal and recommends the perfect 4 expert agents from our library of specialists to form your council.',
    icon: Sparkles
  },
  {
    number: '03',
    title: 'Chat & Collaborate',
    description: 'Your council comes to life! Chat with all 4 agents working together, building on each other\'s insights to help you succeed.',
    icon: MessagesSquare
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting started with your AI council is simple and takes less than 2 minutes
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                {/* Connecting Line (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-brand-indigo to-brand-purple opacity-30" />
                )}

                <div className="text-center group">
                  {/* Number with Gradient */}
                  <div className="mb-6 relative inline-block">
                    <div className="text-7xl font-bold gradient-text opacity-20 absolute -top-4 -left-2">
                      {step.number}
                    </div>
                    <div className="relative z-10 w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-indigo via-brand-purple to-brand-pink flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

