'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Welcome back, Adventurer.')
      router.push('/dungeon')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-abyss px-4">
      {/* Portal bg */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.06)_0%,transparent_65%)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="mb-10 text-center">
          <Link href="/" className="font-cinzel text-4xl font-black text-rune text-shadow-rune tracking-wider">
            SQL:DUNGEON
          </Link>
          <p className="mt-2 font-cinzel text-xs tracking-[0.3em] text-mist uppercase">
            ❖ &nbsp; Return to the Citadel &nbsp; ❖
          </p>
        </div>

        <div className="border border-rune/20 bg-deep p-8">
          <h1 className="mb-1 font-cinzel text-xl font-bold text-parchment">Sign In</h1>
          <p className="mb-8 font-crimson text-sm italic text-mist">Your spellbook awaits.</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block font-cinzel text-[0.6rem] tracking-[0.2em] uppercase text-mist">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full border border-rune/20 bg-stone px-4 py-3 font-mono text-sm text-parchment outline-none placeholder:text-mist/40 focus:border-rune-dim transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-cinzel text-[0.6rem] tracking-[0.2em] uppercase text-mist">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-rune/20 bg-stone px-4 py-3 font-mono text-sm text-parchment outline-none placeholder:text-mist/40 focus:border-rune-dim transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 border border-rune-dim bg-rune/10 py-3 font-cinzel text-sm font-bold tracking-[0.2em] uppercase text-rune transition-all hover:bg-rune/25 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? '⌘ Casting...' : '❖ Enter the Dungeon'}
            </button>
          </form>

          <p className="mt-6 text-center font-cinzel text-xs tracking-wide text-mist">
            No account?{' '}
            <Link href="/auth/signup" className="text-rune hover:text-parchment transition-colors">
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
