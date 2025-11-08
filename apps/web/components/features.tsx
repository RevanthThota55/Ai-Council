'use client'

import { Users, Target, Zap } from 'lucide-react'
import { Card } from './ui/card'

const features = [
  {
    icon: Users,
    title: '4 AI Experts, One Conversation',
    description: 'Your personal council of specialized AI agents collaborate in real-time, each bringing unique expertise to help you succeed.'
  },
  {
    icon: Target,
    title: 'Any Goal, Any Topic',
    description: 'From learning new skills to starting a business, your AI council adapts to any challenge you want to tackle.'
  },
  {
    icon: Zap,
    title: 'Sequential Collaboration',
    description: 'Agents build on each other\'s insights, creating comprehensive solutions that single AI assistants can\'t match.'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose AI Council?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the power of collaborative AI intelligence working together for you
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="p-8 bg-white border-2 border-gray-200 hover:border-brand-indigo hover:shadow-card-hover transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

