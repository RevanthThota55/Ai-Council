'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/auth-store'
import { Button } from '../ui/button'
import { LogOut, Home } from 'lucide-react'

interface DashboardHeaderProps {
  userName?: string | null
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Left: Welcome Message */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back{userName ? `, ${userName}` : ''}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to collaborate with your AI councils?
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

