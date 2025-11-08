'use client'

import { GraduationCap, Briefcase, Dumbbell, Palette, Code, TrendingUp } from 'lucide-react'
import { Card } from './ui/card'

const useCases = [
  {
    icon: GraduationCap,
    title: 'Learning',
    example: 'Learn Python, master guitar, study quantum physics',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Briefcase,
    title: 'Business',
    example: 'Start a company, develop marketing strategies, plan launches',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Dumbbell,
    title: 'Fitness',
    example: 'Get fit, plan meals, build workout routines',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Palette,
    title: 'Creative',
    example: 'Write a book, design logos, compose music',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Code,
    title: 'Coding',
    example: 'Debug code, build apps, learn frameworks',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: TrendingUp,
    title: 'Career',
    example: 'Interview prep, resume help, negotiate salary',
    gradient: 'from-pink-500 to-rose-500'
  }
]

export default function UseCases() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Endless Possibilities
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your AI council can help with virtually any goal or challenge
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon
            return (
              <Card
                key={index}
                className="p-6 bg-white border border-gray-200 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {useCase.example}
                </p>
              </Card>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            And hundreds more possibilities...
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center text-brand-indigo font-medium hover:text-brand-purple transition-colors"
          >
            Get started today
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

