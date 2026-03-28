'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading,  setLoading]  = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters.'); return }
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data:        { username },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      // Update username on profile (trigger creates row, we patch username)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ username }).eq('id', user.id)
      }
      toast.success('Adventurer created! Check your email to verify.')
      router.push('/dungeon')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-abyss px-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.06)_0%,transparent_65%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="font-cinzel text-4xl font-black text-rune text-shadow-rune tracking-wider">
            SQL:DUNGEON
          </Link>
          <p className="mt-2 font-cinzel text-xs tracking-[0.3em] text-mist uppercase">
            ❖ &nbsp; Forge Your Identity &nbsp; ❖
          </p>
        </div>

        <div className="border border-rune/20 bg-deep p-8">
          <h1 className="mb-1 font-cinzel text-xl font-bold text-parchment">Create Account</h1>
          <p className="mb-8 font-crimson text-sm italic text-mist">Every dungeon run starts with a name.</p>

          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block font-cinzel text-[0.6rem] tracking-[0.2em] uppercase text-mist">
                Adventurer Name
              </label>
              <input
                type="text"
                required
                maxLength={24}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="YourName"
                className="w-full border border-rune/20 bg-stone px-4 py-3 font-mono text-sm text-parchment outline-none placeholder:text-mist/40 focus:border-rune-dim transition-colors"
              />
            </div>

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
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full border border-rune/20 bg-stone px-4 py-3 font-mono text-sm text-parchment outline-none placeholder:text-mist/40 focus:border-rune-dim transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 border border-gold/25 bg-gold/10 py-3 font-cinzel text-sm font-bold tracking-[0.2em] uppercase text-gold transition-all hover:bg-gold/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? '⌘ Forging...' : '⚔ Begin Your Quest'}
            </button>
          </form>

          <p className="mt-6 text-center font-cinzel text-xs tracking-wide text-mist">
            Already an adventurer?{' '}
            <Link href="/auth/login" className="text-rune hover:text-parchment transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
