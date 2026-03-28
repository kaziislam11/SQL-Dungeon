import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildMasterNotebook, buildNotebook, buildSQLFile } from '@/lib/utils/notebook-export'
import { AZM_QUESTS, KAZI_QUESTS, QUESTS } from '@/lib/quests'
import { DUNGEON_CONTRACTS } from '@/lib/data/dungeon-contracts'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questId, format, queries = [] } = await req.json()

  if (format === 'master-ipynb') {
    const notebook = buildMasterNotebook(KAZI_QUESTS, AZM_QUESTS, DUNGEON_CONTRACTS)
    return new NextResponse(JSON.stringify(notebook, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="SQL_DUNGEON_master_notebook.ipynb"',
      },
    })
  }

  if (!questId) {
    return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  }

  const quest = QUESTS.find(q => q.id === questId)
  if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })

  if (format === 'ipynb') {
    const notebook = buildNotebook(quest, queries)
    return new NextResponse(JSON.stringify(notebook, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${quest.id}_${quest.title.replace(/\s+/g,'_')}.ipynb"`,
      },
    })
  }

  if (format === 'sql') {
    const sql = buildSQLFile(quest, queries)
    return new NextResponse(sql, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${quest.id}_${quest.title.replace(/\s+/g,'_')}.sql"`,
      },
    })
  }

  return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
}
