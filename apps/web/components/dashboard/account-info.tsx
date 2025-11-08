'use client'

import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { User, Mail, Calendar, CreditCard, TrendingUp } from 'lucide-react'

interface AccountInfoProps {
  user: {
    name?: string | null
    email: string
    subscriptionTier: string
    createdAt: string | Date
  }
}

export default function AccountInfo({ user }: AccountInfoProps) {
  const accountCreated = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return 'bg-gray-100 text-gray-800'
      case 'PRO':
        return 'gradient-brand text-white'
      case 'BUSINESS':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSubscriptionFeatures = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return {
          councils: '5 councils',
          messages: '50 messages/month',
          model: 'GPT-3.5',
        }
      case 'PRO':
        return {
          councils: 'Unlimited',
          messages: 'Unlimited',
          model: 'GPT-4',
        }
      case 'BUSINESS':
        return {
          councils: 'Unlimited',
          messages: 'Unlimited',
          model: 'GPT-4 + Team features',
        }
      default:
        return {
          councils: '5 councils',
          messages: '50 messages/month',
          model: 'GPT-3.5',
        }
    }
  }

  const features = getSubscriptionFeatures(user.subscriptionTier)

  return (
    <Card className="p-6 md:p-8 bg-white border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Account Information</h3>
        {user.subscriptionTier === 'FREE' && (
          <a href="/#pricing">
            <Button size="sm" className="gradient-brand text-white">
              Upgrade Plan
            </Button>
          </a>
        )}
      </div>

      <div className="space-y-6">
        {/* User Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Name</div>
              <div className="text-base font-semibold text-gray-900">
                {user.name || 'Not provided'}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
              <div className="text-base font-semibold text-gray-900">{user.email}</div>
            </div>
          </div>

          {/* Subscription */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Subscription</div>
              <Badge className={getSubscriptionBadgeColor(user.subscriptionTier)}>
                {user.subscriptionTier}
              </Badge>
            </div>
          </div>

          {/* Account Created */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-pink to-brand-indigo flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Account Created</div>
              <div className="text-base font-semibold text-gray-900">{accountCreated}</div>
            </div>
          </div>
        </div>

        {/* Subscription Features */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Current Plan Features
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-500 mb-1">Councils</div>
              <div className="text-sm font-semibold text-gray-900">{features.councils}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-500 mb-1">Messages</div>
              <div className="text-sm font-semibold text-gray-900">{features.messages}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-500 mb-1">AI Model</div>
              <div className="text-sm font-semibold text-gray-900">{features.model}</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {user.subscriptionTier !== 'FREE' && (
          <div className="pt-4">
            <Button variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

