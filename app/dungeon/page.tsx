import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DungeonClient from '@/components/dungeon/DungeonClient'

export default async function DungeonPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return <DungeonClient userId={user.id} />
}
