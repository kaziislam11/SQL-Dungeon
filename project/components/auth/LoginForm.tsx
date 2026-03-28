'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
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
    <div className="border border-rune/20 bg-deep p-8">
      <h1 className="mb-1 font-cinzel text-xl font-bold text-parchment">Sign In</h1>
      <p className="mb-8 font-crimson text-sm italic text-mist">Your spellbook awaits.</p>

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <Input
          id="email"
          label="Email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@college.edu"
        />
        <Input
          id="password"
          label="Password"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Button type="submit" variant="rune" size="lg" disabled={loading} className="mt-2 w-full">
          {loading ? '⌘ Casting...' : '❖ Enter the Dungeon'}
        </Button>
      </form>

      <p className="mt-6 text-center font-cinzel text-xs tracking-wide text-mist">
        No account?{' '}
        <Link href="/auth/signup" className="text-rune hover:text-parchment transition-colors">
          Create one →
        </Link>
      </p>
    </div>
  )
}
