import type { Quest } from '@/types'
import {
  CONTRACT_EVALUATION_CRITERIA,
  CONTRACT_PROCESS_STEPS,
  type DungeonContract,
} from '@/lib/data/dungeon-contracts'

interface QueryEntry {
  floorTitle: string
  query: string
  result: string
}

const SQLNOIR_PROJECT_GOALS = [
  'Strengthen T-SQL fluency through joins, subqueries, CTEs, functions, aggregations, and query optimization.',
  'Use SQLNOIR mystery framing so each query uncovers evidence instead of just returning rows.',
  'Document reasoning, code, and results in notebook form for Azure Data Studio, SSMS, or VS Code.',
  'Push beyond basics with advanced patterns such as window functions, recursive CTEs, or deeper query design when the mystery allows it.',
]

const SQLNOIR_EVALUATION_CRITERIA = [
  'Correctness: the final query must solve the mystery accurately.',
  'Efficiency: the solution should avoid unnecessary work and show thoughtful query design.',
  'Documentation: the notebook should clearly explain the reasoning behind each section.',
  'Creativity: the notebook should show depth beyond a first-pass answer when possible.',
]

const PAIRED_SESSION_REQUIREMENTS = [
  'Alternate navigator and driver responsibilities across sessions.',
  'Use advanced T-SQL patterns to move from raw data to a real recommendation.',
  'Capture role notes, query evolution, results, and a final recommendation in one shared notebook.',
  'Treat the work like a real business-technical conversation, not just a code dump.',
]

function markdownCell(lines: string[]): object {
  return {
    cell_type: 'markdown',
    id: crypto.randomUUID().slice(0, 8),
    metadata: {},
    source: lines.join('\n'),
  }
}

function codeCell(query: string, output: string, idx: number): object {
  return {
    cell_type: 'code',
    id: crypto.randomUUID().slice(0, 8),
    metadata: {},
    execution_count: idx + 1,
    source: query,
    outputs: output
      ? [
          {
            output_type: 'stream',
            name: 'stdout',
            text: output,
          },
        ]
      : [],
  }
}

function schemaMarkdown(schema: Quest['schema']) {
  const lines = ['## Sample Database Schema', '']

  Object.entries(schema).forEach(([table, cols]) => {
    lines.push(`### \`${table}\``)
    lines.push('| Column | Type | PK |')
    lines.push('|--------|------|----|')
    cols.forEach(col => lines.push(`| ${col.col} | ${col.type} | ${col.pk ? 'Yes' : ''} |`))
    lines.push('')
  })

  return lines
}

function getQuestTrackLabel(quest: Quest) {
  switch (quest.questLine) {
    case 'Kazi Quests':
      return 'Kazi Individual SQLNOIR Mysteries'
    case 'Azm Quests':
      return 'Azm Individual SQLNOIR Mysteries'
    case 'Hidden Contracts':
      return 'Hidden Epic and Mythic Mysteries'
    default:
      return 'SQLNOIR Mystery Track'
  }
}

function getMysteryHeading(quest: Quest) {
  if (quest.questSequence) {
    return `Mystery #${quest.questSequence}`
  }

  return `Mystery - ${quest.id}`
}

function getSectionTitle(title: string, sectionNumber: number) {
  const match = title.match(/^(?:Part|Floor)\s+\d+\s*-\s*(.+)$/i)
  return match ? `Section ${sectionNumber} - ${match[1]}` : `Section ${sectionNumber} - ${title}`
}

function buildQuestNotebookHeader(quest: Quest, mode: 'single' | 'master'): object[] {
  const headerCells: object[] = [
    markdownCell([
      mode === 'single' ? '# SQLNOIR PROJECT' : `# ${getMysteryHeading(quest)}`,
      '',
      mode === 'single' ? `## ${getMysteryHeading(quest)}` : `## ${quest.title}`,
      '',
      mode === 'single' ? `### ${quest.title}` : `**Track:** ${getQuestTrackLabel(quest)}  `,
      mode === 'single' ? `**Track:** ${getQuestTrackLabel(quest)}  ` : `**Quest ID:** ${quest.id}  `,
      mode === 'single' ? `**Quest ID:** ${quest.id}  ` : `**Rank:** ${quest.rank}  `,
      mode === 'single' ? `**Rank:** ${quest.rank}  ` : `**Focus Areas:** ${quest.tags.join(', ')}  `,
      `**Exported:** ${new Date().toLocaleString()}`,
      '',
      '*Narrative prompt*',
      '',
      quest.lore,
    ]),
  ]

  if (mode === 'single') {
    headerCells.push(
      markdownCell([
        '## Overview',
        '',
        'This notebook is structured to match the SQLNOIR assignment format for junior and senior CS majors studying T-SQL through interactive mystery solving.',
        '',
        '- Four sections build the investigation from partial clues to a final optimized solution.',
        '- Queries should be written in T-SQL style and documented with explanation, code, and results.',
        '- The notebook should be suitable for Azure Data Studio, SSMS, or VS Code notebook workflows.',
      ]),
      markdownCell([
        '## Project Goals',
        '',
        ...SQLNOIR_PROJECT_GOALS.map(goal => `- ${goal}`),
        '',
        '## Mystery Requirements',
        '',
        '- Sections 1-3 gather partial evidence through filtering, joining, aggregating, or other incremental analysis.',
        '- Section 4 should combine the evidence into one optimized final query using layered SQL reasoning.',
        '- Keep narrative explanations beside the code so the notebook reads like a submission, not just a script.',
      ]),
      markdownCell([
        '## Evaluation Criteria',
        '',
        ...SQLNOIR_EVALUATION_CRITERIA.map(criteria => `- ${criteria}`),
        '',
        `**Final answer format:** ${quest.answerHint}`,
      ])
    )
  } else {
    headerCells.push(
      markdownCell([
        `**Track:** ${getQuestTrackLabel(quest)}  `,
        `**Quest ID:** ${quest.id}  `,
        `**Rank:** ${quest.rank}  `,
        `**Expected answer format:** ${quest.answerHint}`,
      ])
    )
  }

  return headerCells
}

function buildQuestNotebookCells(
  quest: Quest,
  queries: QueryEntry[],
  mode: 'single' | 'master'
): object[] {
  const queriesByFloor = new Map(queries.map(entry => [entry.floorTitle, entry]))
  const cells: object[] = [...buildQuestNotebookHeader(quest, mode)]

  cells.push(markdownCell(schemaMarkdown(quest.schema)))

  quest.floors.forEach((floor, index) => {
    const sectionNumber = index + 1
    const sectionTitle = getSectionTitle(floor.title, sectionNumber)
    const savedEntry = queriesByFloor.get(floor.title)
    const isFinalSection = sectionNumber === 4

    cells.push(
      markdownCell([
        `## ${sectionTitle}`,
        '',
        `**Section Goal:** ${floor.intro}`,
        '',
        isFinalSection
          ? 'This section should combine the prior evidence into one final, optimized answer.'
          : 'This section should gather one important clue that feeds the final solution.',
        '',
        '### Narrative Explanation',
        '',
        '- What question are you answering in this section?',
        '- Why does this step matter for the final mystery?',
        '- What did you expect to learn before you ran the query?',
      ])
    )

    cells.push(
      codeCell(
        savedEntry?.query ??
          `-- ${sectionTitle}\n-- Section goal: ${floor.intro}\n-- Guidance: ${floor.hint}\n\n-- Write your T-SQL here`,
        savedEntry?.result ?? '',
        index
      )
    )

    cells.push(
      markdownCell([
        '### Results and Interpretation',
        '',
        '- Summarize the important rows, totals, rankings, or anomalies returned here.',
        '- Explain how this result changes the next step in the investigation.',
        '- Note any efficiency decisions, cleanup choices, or advanced SQL features used.',
        isFinalSection
          ? '- Explain why this optimized final query solves the mystery completely.'
          : '- Explain what clue or hypothesis this section confirms.',
      ])
    )
  })

  cells.push(
    markdownCell([
      '## Final Reflection',
      '',
      `**Final answer format:** ${quest.answerHint}`,
      '',
      '- State the final answer clearly.',
      '- Explain why the evidence across all four sections supports that answer.',
      '- Briefly note how correctness, efficiency, documentation, and creativity show up in the finished work.',
      '',
      '---',
      '*Generated by SQL:DUNGEON - CSCI 331 - Queens College CUNY*',
    ])
  )

  return cells
}

function buildContractNotebookCells(contract: DungeonContract, contractIndex: number): object[] {
  const starterQueryBlock = contract.starterQueries
    .map(
      starterQuery =>
        `-- ${starterQuery.label}\n-- ${starterQuery.desc}\n${starterQuery.query}`
    )
    .join('\n\n')

  return [
    markdownCell([
      '# Paired Real-World Problem-Solving',
      '',
      `## Session ${contract.proposition}: ${contract.title}`,
      '',
      `**Contract ID:** ${contract.id}  `,
      `**Lead Role This Session:** ${contract.leadRole}  `,
      '**Recommended Session Length:** 1-2 hours  ',
      '**Notebook Format:** Shared SQL notebook for navigator and driver collaboration',
      '',
      '## Business Scenario',
      '',
      contract.scenario,
    ]),
    markdownCell([
      '## Role Structure',
      '',
      '- Navigator acts as the business stakeholder and refines the requirement verbally.',
      '- Driver acts as the programmer or analyst and writes the evolving T-SQL.',
      '- Partners should switch emphasis midway if that improves balance or clarity.',
      '',
      `- Navigator note: ${contract.navigatorRole}`,
      `- Driver note: ${contract.driverRole}`,
      '',
      '## Session Process',
      '',
      ...CONTRACT_PROCESS_STEPS.map(step => `- ${step}`),
    ]),
    markdownCell([
      '## Session Requirements',
      '',
      ...PAIRED_SESSION_REQUIREMENTS.map(requirement => `- ${requirement}`),
      '',
      '## Contract-Specific Goals',
      '',
      ...contract.requirements.map(requirement => `- ${requirement}`),
      '',
      '## Expected Deliverables',
      '',
      ...contract.deliverables.map(deliverable => `- ${deliverable}`),
      '',
      '## Evaluation Criteria',
      '',
      ...CONTRACT_EVALUATION_CRITERIA.map(criteria => `- ${criteria}`),
    ]),
    markdownCell(schemaMarkdown(contract.schema)),
    codeCell(
      `-- Session ${contract.proposition}: ${contract.title}\n-- Shared T-SQL workspace\n-- Record the team's query evolution, tests, and refinements below.\n\n${starterQueryBlock}\n\n-- Add the pair's evolving T-SQL here`,
      '',
      contractIndex
    ),
    markdownCell([
      '## Pair Notes and Recommendation',
      '',
      '### Navigator Notes',
      '- What business need or requirement was clarified during the session?',
      '- Which edge cases or decision points mattered most?',
      '',
      '### Driver Notes',
      '- How did the query evolve from first attempt to final answer?',
      '- Which advanced T-SQL features helped most here?',
      '',
      '### Final Recommendation',
      '- Summarize the insight, action item, or business recommendation.',
      '- Note any performance tuning, validation checks, or optional visualization follow-up.',
    ]),
  ]
}

export function buildNotebook(quest: Quest, queries: QueryEntry[]): object {
  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        display_name: 'SQL',
        language: 'sql',
        name: 'sql',
      },
      language_info: { name: 'sql' },
      sqldungeon: {
        quest_id: quest.id,
        quest_title: quest.title,
        exported_at: new Date().toISOString(),
      },
    },
    cells: buildQuestNotebookCells(quest, queries, 'single'),
  }
}

export function buildMasterNotebook(
  kaziQuests: Quest[],
  azmQuests: Quest[],
  contracts: DungeonContract[]
): object {
  const cells: object[] = [
    markdownCell([
      '# SQL:DUNGEON Master Submission Notebook',
      '',
      `**Exported:** ${new Date().toLocaleString()}`,
      '',
      'This combined notebook is organized to reflect the project brief: individual SQLNOIR mysteries plus paired real-world problem-solving work.',
      '',
      `- Kazi individual mysteries: ${kaziQuests.length}`,
      `- Azm individual mysteries: ${azmQuests.length}`,
      `- Dungeon contract sessions: ${contracts.length}`,
      '',
      'Kazi and Azm are presented as the two individual student tracks, while Dungeon Contracts capture the shared navigator/driver sessions.',
    ]),
    markdownCell([
      '## Project Overview',
      '',
      'The project gamifies T-SQL learning through detective-style mysteries and paired business problem solving.',
      '',
      ...SQLNOIR_PROJECT_GOALS.map(goal => `- ${goal}`),
      '',
      '## Individual Mystery Structure',
      '',
      '- Each mystery uses four sections.',
      '- Sections 1-3 gather evidence through incremental analysis.',
      '- Section 4 should deliver the optimized final solution.',
      '- Each notebook section should include narrative explanation, query work, and interpretation.',
      '',
      '## Paired Session Structure',
      '',
      '- Navigator defines and refines the business need.',
      '- Driver writes and tests the T-SQL.',
      '- The notebook should preserve query evolution, results, and final recommendations.',
    ]),
    markdownCell([
      '## Evaluation Reminders',
      '',
      ...SQLNOIR_EVALUATION_CRITERIA.map(criteria => `- ${criteria}`),
      ...CONTRACT_EVALUATION_CRITERIA.map(criteria => `- ${criteria}`),
    ]),
    markdownCell([
      '## Kazi Individual SQLNOIR Mysteries',
      '',
      'These 10 mysteries represent one full individual track of detective-style T-SQL work.',
    ]),
  ]

  kaziQuests.forEach(quest => {
    cells.push(...buildQuestNotebookCells(quest, [], 'master'))
  })

  cells.push(
    markdownCell([
      '## Azm Individual SQLNOIR Mysteries',
      '',
      'These 10 mysteries represent the second individual track, still following the same four-section SQLNOIR format.',
    ])
  )

  azmQuests.forEach(quest => {
    cells.push(...buildQuestNotebookCells(quest, [], 'master'))
  })

  cells.push(
    markdownCell([
      '## Dungeon Contracts - Paired Real-World Problem-Solving',
      '',
      'These 10 sessions capture the navigator/driver collaboration work required for the paired portion of the project.',
    ])
  )

  contracts.forEach((contract, index) => {
    cells.push(...buildContractNotebookCells(contract, 20 + index))
  })

  return {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        display_name: 'SQL',
        language: 'sql',
        name: 'sql',
      },
      language_info: { name: 'sql' },
      sqldungeon: {
        export_kind: 'master_notebook',
        kazi_quest_count: kaziQuests.length,
        azm_quest_count: azmQuests.length,
        contract_count: contracts.length,
        exported_at: new Date().toISOString(),
      },
    },
    cells,
  }
}

export function buildSQLFile(quest: Quest, queries: QueryEntry[]): string {
  const lines: string[] = [
    '-- =======================================================',
    `-- SQL:DUNGEON - ${quest.title}`,
    `-- Quest: ${quest.id} - Rank: ${quest.rank}`,
    `-- Exported: ${new Date().toLocaleString()}`,
    '-- CSCI 331 - Queens College CUNY',
    '-- =======================================================',
    '',
  ]

  queries.forEach(entry => {
    lines.push(`-- ${entry.floorTitle} -------------------------------------`)
    lines.push(entry.query)
    if (entry.result) {
      lines.push('')
      lines.push('/* Results:')
      lines.push(entry.result)
      lines.push('*/')
    }
    lines.push('')
  })

  return lines.join('\n')
}
