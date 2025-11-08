'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

const pricingTiers = [
  {
    name: 'FREE',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out AI councils',
    features: [
      '5 councils',
      '50 messages per month',
      'GPT-3.5 powered agents',
      'Basic support',
      'Community access'
    ],
    cta: 'Start Free',
    popular: false,
    href: '/signup'
  },
  {
    name: 'PRO',
    price: '$9.99',
    period: 'per month',
    description: 'For serious learners and professionals',
    features: [
      'Unlimited councils',
      'Unlimited messages',
      'GPT-4 powered agents',
      'Priority support',
      'Advanced analytics',
      'Export conversations',
      'Custom agent personas'
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    href: '/signup'
  },
  {
    name: 'BUSINESS',
    price: '$29.99',
    period: 'per month',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Shared councils',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'SSO & advanced security'
    ],
    cta: 'Contact Sales',
    popular: false,
    href: '/signup'
  }
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for you. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card
              key={index}
              className={`p-8 relative ${
                tier.popular
                  ? 'border-2 border-brand-indigo shadow-card-hover scale-105 md:scale-110'
                  : 'border border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="gradient-brand text-white px-4 py-1 text-xs font-semibold">
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              {/* Tier Name */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-gray-600">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{tier.period}</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link href={tier.href as any}>
                <Button
                  className={`w-full font-semibold ${
                    tier.popular
                      ? 'gradient-brand text-white shadow-button hover:opacity-90'
                      : 'bg-white border-2 border-gray-300 text-gray-900 hover:border-brand-indigo hover:text-brand-indigo'
                  }`}
                >
                  {tier.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            💰 30-day money-back guarantee • 🔒 Cancel anytime • 💳 No credit card required for free tier
          </p>
        </div>
      </div>
    </section>
  )
}

