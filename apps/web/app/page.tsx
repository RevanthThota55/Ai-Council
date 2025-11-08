export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          AI Council Portal
        </h1>
        <p className="text-center text-lg mb-4">
          Multi-agent AI collaboration platform
        </p>
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm">
            ✅ <strong>Phase 0: Foundation Systems</strong> - In Progress
          </p>
          <p className="text-xs mt-2 text-gray-600 dark:text-gray-400">
            Building bulletproof foundation with Next.js 14, Express, and PostgreSQL
          </p>
        </div>
      </div>
    </main>
  )
}
