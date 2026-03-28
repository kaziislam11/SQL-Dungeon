'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function SignupForm() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading,  setLoading]  = useState(false)
  const router   = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters.'); return }
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data:            { username },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
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
    <div className="border border-rune/20 bg-deep p-8">
      <h1 className="mb-1 font-cinzel text-xl font-bold text-parchment">Create Account</h1>
      <p className="mb-8 font-crimson text-sm italic text-mist">Every dungeon run starts with a name.</p>

      <form onSubmit={handleSignup} className="flex flex-col gap-5">
        <Input
          id="username"
          label="Adventurer Name"
          type="text"
          required
          maxLength={24}
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="YourName"
        />
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
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
        />
        <Button type="submit" variant="gold" size="lg" disabled={loading} className="mt-2 w-full">
          {loading ? '⌘ Forging...' : '⚔ Begin Your Quest'}
        </Button>
      </form>

      <p className="mt-6 text-center font-cinzel text-xs tracking-wide text-mist">
        Already an adventurer?{' '}
        <Link href="/auth/login" className="text-rune hover:text-parchment transition-colors">
          Sign in →
        </Link>
      </p>
    </div>
  )
}
