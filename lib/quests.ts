import type { Quest, UserProgress } from '@/types'
import { QUESTS as DATA_QUESTS } from '@/lib/data/quests'

export const TELEPORT_SCROLL_COST = 120

function normalizeQuestId(id: string) {
  return id.toUpperCase()
}

function makeHintsFree(quest: Quest): Quest {
  return {
    ...quest,
    id: normalizeQuestId(quest.id),
    floors: quest.floors.map(floor => ({
      ...floor,
      hints: floor.hints.map(hint => ({
        ...hint,
        cost: 0,
      })),
    })),
  }
}

export const CORE_SQLNOIR_QUESTS: Quest[] = DATA_QUESTS.map(makeHintsFree)

export const SECRET_QUESTS: Quest[] = [
  {
    id: 'SQ001',
    title: "The Null King's Labyrinth",
    hiddenTitle: '???',
    secret: true,
    rank: 'Epic',
    rankClass: 'border-violet-500/50 bg-violet-500/10 text-violet-300',
    diff: 5,
    tags: ['Recursive CTE', 'Window Functions', 'Graph Search', 'Anti-Join', 'CASE WHEN'],
    lore: `Beyond the mapped floors of the dungeon lies a folded hallway that only appears when reality tears sideways. Guild runners entered with full packs and came back with blank eyes, repeating one title: the Null King. Spend a teleport scroll to reveal the path, then trace the impossible route through unstable portals to name the sovereign waiting in the void.`,
    answer: 'null_king',
    answerHint: 'Enter the void sovereign in lowercase with underscore.',
    xp: 450,
    schema: {
      chambers: [
        { col: 'chamber_id', type: 'INT', pk: true },
        { col: 'chamber_name', type: 'VARCHAR' },
        { col: 'depth', type: 'INT' },
        { col: 'void_touched', type: 'INT' },
      ],
      portals: [
        { col: 'portal_id', type: 'INT', pk: true },
        { col: 'from_chamber_id', type: 'INT' },
        { col: 'to_chamber_id', type: 'INT' },
        { col: 'rune_cost', type: 'INT' },
        { col: 'unstable', type: 'INT' },
      ],
      runners: [
        { col: 'runner_id', type: 'INT', pk: true },
        { col: 'alias', type: 'VARCHAR' },
        { col: 'start_chamber_id', type: 'INT' },
        { col: 'sworn_to', type: 'VARCHAR' },
      ],
      traces: [
        { col: 'trace_id', type: 'INT', pk: true },
        { col: 'runner_id', type: 'INT' },
        { col: 'chamber_id', type: 'INT' },
        { col: 'entered_at', type: 'TEXT' },
      ],
      sigils: [
        { col: 'sigil_id', type: 'INT', pk: true },
        { col: 'chamber_id', type: 'INT' },
        { col: 'sigil_name', type: 'VARCHAR' },
        { col: 'authentic', type: 'INT' },
      ],
    },
    seed: `
      CREATE TABLE chambers(chamber_id INT PRIMARY KEY, chamber_name VARCHAR(40), depth INT, void_touched INT);
      CREATE TABLE portals(portal_id INT PRIMARY KEY, from_chamber_id INT, to_chamber_id INT, rune_cost INT, unstable INT);
      CREATE TABLE runners(runner_id INT PRIMARY KEY, alias VARCHAR(30), start_chamber_id INT, sworn_to VARCHAR(30));
      CREATE TABLE traces(trace_id INT PRIMARY KEY, runner_id INT, chamber_id INT, entered_at TEXT);
      CREATE TABLE sigils(sigil_id INT PRIMARY KEY, chamber_id INT, sigil_name VARCHAR(30), authentic INT);

      INSERT INTO chambers VALUES
        (1,'torch_gate',0,0),(2,'solder_bridge',1,0),(3,'glass_rotunda',2,0),
        (4,'mirror_pit',3,0),(5,'echo_well',4,0),(6,'ash_stair',5,0),
        (7,'null_vault',6,1),(8,'silent_loop',6,1),(9,'throne_of_null',7,1);

      INSERT INTO portals VALUES
        (1,1,2,3,0),(2,2,3,5,0),(3,3,4,8,0),(4,4,5,13,0),(5,5,6,21,0),
        (6,6,7,34,1),(7,7,8,55,1),(8,8,7,55,1),(9,8,9,89,1),
        (10,3,6,14,1),(11,2,5,12,1),(12,4,7,20,1);

      INSERT INTO runners VALUES
        (1,'ashen_scout',1,'null_king'),
        (2,'guild_cartographer',1,'guild'),
        (3,'mirror_broker',2,'void_market');

      INSERT INTO traces VALUES
        (1,1,1,'1247-04-01 20:00'),(2,1,2,'1247-04-01 20:03'),(3,1,3,'1247-04-01 20:07'),
        (4,1,6,'1247-04-01 20:12'),(5,1,7,'1247-04-01 20:19'),(6,1,8,'1247-04-01 20:29'),
        (7,1,9,'1247-04-01 20:41'),
        (8,2,1,'1247-04-01 19:55'),(9,2,2,'1247-04-01 20:01'),(10,2,3,'1247-04-01 20:05'),
        (11,2,4,'1247-04-01 20:12'),
        (12,3,2,'1247-04-01 20:02'),(13,3,5,'1247-04-01 20:08'),(14,3,6,'1247-04-01 20:15'),
        (15,3,7,'1247-04-01 20:24');

      INSERT INTO sigils VALUES
        (1,7,'mirror_duke',0),(2,8,'echo_queen',0),(3,9,'null_king',1);
    `,
    floors: [
      {
        title: 'Floor I - Faulted Gates',
        intro: 'Start with the portal network itself. Count which chambers receive the most unstable arrivals and you will narrow the void-side half of the labyrinth.',
        hint: 'Filter portals WHERE unstable = 1, join to chambers by to_chamber_id, then count arrivals per chamber.',
        hints: [
          { id: 25, cost: 0, text: 'The receiving chamber is portals.to_chamber_id. Group by that after filtering unstable portals.' },
          { id: 26, cost: 0, text: 'JOIN chambers on to_chamber_id so you can read the chamber_name instead of numeric ids.' },
        ],
        clue: {
          label: 'Reveal the fracture map',
          query: `SELECT c.chamber_name, COUNT(*) AS unstable_arrivals
FROM portals p
JOIN chambers c ON c.chamber_id = p.to_chamber_id
WHERE p.unstable = 1
GROUP BY c.chamber_id, c.chamber_name
ORDER BY unstable_arrivals DESC, c.chamber_name;`,
          desc: 'The unstable side of the graph clusters around the void-touched chambers. Count the arrivals first, then worry about the route.',
        },
      },
      {
        title: 'Floor II - The Runner With No Fear',
        intro: 'One runner reached void-touched chambers in sequence. Use a window function to compare each trace with the previous chamber and isolate the scout who kept moving deeper.',
        hint: 'Use LAG(chamber_id) OVER (PARTITION BY runner_id ORDER BY entered_at) to compare each trace to the previous one.',
        hints: [
          { id: 27, cost: 0, text: 'Build a CTE over traces joined to runners and chambers, then add LAG(chamber_id) partitioned by runner_id.' },
          { id: 28, cost: 0, text: 'Filter for void_touched = 1 after the window function. Only one alias reaches chamber 9.' },
        ],
        clue: {
          label: 'Reveal the trace ledger',
          query: `WITH ordered_traces AS (
  SELECT
    r.alias,
    t.chamber_id,
    c.chamber_name,
    c.void_touched,
    t.entered_at,
    LAG(t.chamber_id) OVER (PARTITION BY r.runner_id ORDER BY t.entered_at) AS previous_chamber
  FROM traces t
  JOIN runners r  ON r.runner_id = t.runner_id
  JOIN chambers c ON c.chamber_id = t.chamber_id
)
SELECT alias, previous_chamber, chamber_id, chamber_name, entered_at
FROM ordered_traces
WHERE void_touched = 1
ORDER BY alias, entered_at;`,
          desc: 'The void-touched entries show who crossed from mapped territory into the hidden half of the dungeon and kept going.',
        },
      },
      {
        title: 'Floor III - Fold the Labyrinth',
        intro: 'Now compute the paths. A recursive CTE can walk the portal graph from Torch Gate and calculate how expensive it is to reach each void chamber without looping forever.',
        hint: 'Anchor the recursive CTE at from_chamber_id = 1 and stop revisiting chambers by checking whether the path already contains the next id.',
        hints: [
          { id: 29, cost: 0, text: "Track both cumulative rune_cost and a string path. instr(path, '->' || next_id) is enough to block revisits." },
          { id: 30, cost: 0, text: 'After the recursion, join to chambers and filter WHERE void_touched = 1. throne_of_null is the deepest destination.' },
        ],
        clue: {
          label: 'Reveal the folding path',
          query: `WITH RECURSIVE labyrinth AS (
  SELECT
    p.to_chamber_id,
    p.rune_cost,
    CAST('1->' || p.to_chamber_id AS TEXT) AS path,
    1 AS hops
  FROM portals p
  WHERE p.from_chamber_id = 1

  UNION ALL

  SELECT
    p.to_chamber_id,
    l.rune_cost + p.rune_cost,
    l.path || '->' || p.to_chamber_id,
    l.hops + 1
  FROM labyrinth l
  JOIN portals p ON p.from_chamber_id = l.to_chamber_id
  WHERE l.hops < 6
    AND instr(l.path, '->' || p.to_chamber_id) = 0
)
SELECT c.chamber_name, MIN(l.rune_cost) AS cheapest_cost
FROM labyrinth l
JOIN chambers c ON c.chamber_id = l.to_chamber_id
WHERE c.void_touched = 1
GROUP BY c.chamber_id, c.chamber_name
ORDER BY cheapest_cost;`,
          desc: 'Once you can reach the void chambers recursively, the throne chamber stops being a rumor and becomes a destination.',
        },
      },
      {
        title: 'Floor IV - Name the Sovereign',
        intro: 'Combine the recursive path, the runner proof, and the authentic sigils. The only authentic sigil found on a reachable void chamber visited by the scout is your verdict.',
        hint: "Use one CTE for reachable void chambers, one for the scout's visited chambers, then join sigils WHERE authentic = 1.",
        hints: [
          { id: 31, cost: 0, text: 'The runner you care about is ashen_scout. A simple DISTINCT chamber_id filter is enough for the proof CTE.' },
          { id: 32, cost: 0, text: 'Join sigils to both CTEs and keep only authentic = 1. The answer is a title, not a chamber name.' },
        ],
        clue: {
          label: 'Reveal the kingmaker query',
          query: `WITH RECURSIVE labyrinth AS (
  SELECT
    p.to_chamber_id,
    CAST('1->' || p.to_chamber_id AS TEXT) AS path,
    1 AS hops
  FROM portals p
  WHERE p.from_chamber_id = 1

  UNION ALL

  SELECT
    p.to_chamber_id,
    l.path || '->' || p.to_chamber_id,
    l.hops + 1
  FROM labyrinth l
  JOIN portals p ON p.from_chamber_id = l.to_chamber_id
  WHERE l.hops < 6
    AND instr(l.path, '->' || p.to_chamber_id) = 0
),
reachable_void AS (
  SELECT DISTINCT l.to_chamber_id AS chamber_id
  FROM labyrinth l
  JOIN chambers c ON c.chamber_id = l.to_chamber_id
  WHERE c.void_touched = 1
),
runner_proof AS (
  SELECT DISTINCT t.chamber_id
  FROM traces t
  JOIN runners r ON r.runner_id = t.runner_id
  WHERE r.alias = 'ashen_scout'
)
SELECT s.sigil_name
FROM sigils s
JOIN reachable_void rv ON rv.chamber_id = s.chamber_id
JOIN runner_proof  rp ON rp.chamber_id = s.chamber_id
WHERE s.authentic = 1;`,
          desc: 'Only one authentic sigil survives all filters. That sigil names the sovereign at the center of the labyrinth.',
        },
      },
    ],
  },
  {
    id: 'SQ002',
    title: 'The Black Archive of Root Zero',
    hiddenTitle: '???',
    secret: true,
    rank: 'Mythic',
    rankClass: 'border-red-500/50 bg-red-500/10 text-red-300',
    diff: 5,
    tags: ['Recursive CTE', 'Window Functions', 'DENSE_RANK', 'Incident Analysis', 'Multi-CTE'],
    lore: `The dungeon's oldest ward does not hold treasure. It holds code fragments that should never execute again. Every failed containment ritual points back to one author sigil repeated through an entire lineage of quarantined fragments. Buy another teleport scroll, crack the Black Archive, and identify the architect whose work keeps breaching the seals.`,
    answer: 'root_zero',
    answerHint: 'Enter the author sigil in lowercase with underscore.',
    xp: 700,
    schema: {
      archives: [
        { col: 'archive_id', type: 'INT', pk: true },
        { col: 'archive_name', type: 'VARCHAR' },
        { col: 'tier', type: 'VARCHAR' },
        { col: 'quarantined', type: 'INT' },
      ],
      fragments: [
        { col: 'fragment_id', type: 'INT', pk: true },
        { col: 'archive_id', type: 'INT' },
        { col: 'fragment_hash', type: 'VARCHAR' },
        { col: 'parent_fragment_id', type: 'INT' },
        { col: 'author_sigil', type: 'VARCHAR' },
        { col: 'severity', type: 'INT' },
      ],
      executions: [
        { col: 'exec_id', type: 'INT', pk: true },
        { col: 'fragment_id', type: 'INT' },
        { col: 'caster_id', type: 'INT' },
        { col: 'executed_at', type: 'TEXT' },
        { col: 'failures', type: 'INT' },
        { col: 'breaches', type: 'INT' },
      ],
      casters: [
        { col: 'caster_id', type: 'INT', pk: true },
        { col: 'caster_name', type: 'VARCHAR' },
        { col: 'cleared', type: 'INT' },
      ],
      seals: [
        { col: 'seal_id', type: 'INT', pk: true },
        { col: 'fragment_id', type: 'INT' },
        { col: 'seal_state', type: 'VARCHAR' },
        { col: 'applied_at', type: 'TEXT' },
      ],
    },
    seed: `
      CREATE TABLE archives(archive_id INT PRIMARY KEY, archive_name VARCHAR(40), tier VARCHAR(20), quarantined INT);
      CREATE TABLE fragments(fragment_id INT PRIMARY KEY, archive_id INT, fragment_hash VARCHAR(30), parent_fragment_id INT, author_sigil VARCHAR(30), severity INT);
      CREATE TABLE executions(exec_id INT PRIMARY KEY, fragment_id INT, caster_id INT, executed_at TEXT, failures INT, breaches INT);
      CREATE TABLE casters(caster_id INT PRIMARY KEY, caster_name VARCHAR(30), cleared INT);
      CREATE TABLE seals(seal_id INT PRIMARY KEY, fragment_id INT, seal_state VARCHAR(20), applied_at TEXT);

      INSERT INTO archives VALUES
        (1,'ember_vault','legendary',0),
        (2,'black_archive','mythic',1),
        (3,'silver_index','rare',0);

      INSERT INTO fragments VALUES
        (1,1,'ember-root',NULL,'aster',4),
        (2,3,'silver-root',NULL,'quill',3),
        (3,2,'qx-13',1,'root_zero',8),
        (4,2,'qx-21',3,'root_zero',9),
        (5,2,'qx-34',4,'root_zero',10),
        (6,3,'silver-leaf',2,'quill',4),
        (7,2,'qx-55',5,'root_zero',10),
        (8,1,'ember-branch',1,'aster',5);

      INSERT INTO casters VALUES
        (1,'orla',1),(2,'vexis',0),(3,'teneb',0),(4,'guild_scribe',1);

      INSERT INTO executions VALUES
        (1,3,2,'1247-05-01 03:00',4,1),
        (2,4,2,'1247-05-03 03:00',6,2),
        (3,5,3,'1247-05-06 03:00',8,3),
        (4,7,3,'1247-05-08 03:00',9,5),
        (5,6,4,'1247-05-08 10:00',1,0),
        (6,8,1,'1247-05-09 12:00',0,0),
        (7,5,2,'1247-05-10 03:00',7,4),
        (8,7,2,'1247-05-11 03:00',10,6);

      INSERT INTO seals VALUES
        (1,3,'fractured','1247-05-01'),
        (2,4,'shattered','1247-05-03'),
        (3,5,'broken','1247-05-06'),
        (4,6,'intact','1247-05-08'),
        (5,7,'void','1247-05-11'),
        (6,8,'intact','1247-05-09');
    `,
    floors: [
      {
        title: 'Floor I - Broken Seals',
        intro: 'Begin with the quarantine records. The Black Archive fragments whose seals are anything but intact are the ones still trying to execute.',
        hint: 'Join fragments to archives and seals, then filter for archive_name = black_archive and seal_state <> intact.',
        hints: [
          { id: 33, cost: 0, text: 'archives tells you which fragments belong to black_archive; seals tells you which ones are broken.' },
          { id: 34, cost: 0, text: 'Every dangerous fragment in black_archive shares the same author sigil, but you will prove that later.' },
        ],
        clue: {
          label: 'Reveal the seal breach list',
          query: `SELECT f.fragment_hash, f.author_sigil, s.seal_state, f.severity
FROM fragments f
JOIN archives a ON a.archive_id = f.archive_id
JOIN seals s    ON s.fragment_id = f.fragment_id
WHERE a.archive_name = 'black_archive'
  AND s.seal_state <> 'intact'
ORDER BY f.severity DESC, f.fragment_hash;`,
          desc: 'This isolates the quarantined fragments that are still dangerous enough to matter.',
        },
      },
      {
        title: 'Floor II - Breach Ranking',
        intro: 'Execution logs show which fragments broke containment the hardest. Aggregate the breaches per fragment and rank them with a window function.',
        hint: 'SUM breaches per fragment, then use DENSE_RANK() OVER (ORDER BY SUM(breaches) DESC).',
        hints: [
          { id: 35, cost: 0, text: 'Group by fragment_id and fragment_hash first. Apply DENSE_RANK in the same grouped SELECT.' },
          { id: 36, cost: 0, text: 'qx-55 ends up rank 1 for total breaches. The same author owns every top fragment in the archive chain.' },
        ],
        clue: {
          label: 'Reveal the breach ranking',
          query: `WITH breach_totals AS (
  SELECT
    f.fragment_hash,
    f.author_sigil,
    SUM(e.breaches) AS total_breaches,
    DENSE_RANK() OVER (ORDER BY SUM(e.breaches) DESC) AS breach_rank
  FROM fragments f
  JOIN executions e ON e.fragment_id = f.fragment_id
  GROUP BY f.fragment_id, f.fragment_hash, f.author_sigil
)
SELECT fragment_hash, author_sigil, total_breaches, breach_rank
FROM breach_totals
ORDER BY breach_rank, fragment_hash;`,
          desc: 'The ranking turns noisy execution logs into a clean leaderboard of the worst fragments.',
        },
      },
      {
        title: 'Floor III - Follow the Lineage',
        intro: 'The archive is not random. The dangerous fragments descend from a single root. Walk the parent-child chain recursively and map the lineage depth.',
        hint: 'Anchor at fragment_hash = ember-root, then recurse from parent_fragment_id to child fragment_id.',
        hints: [
          { id: 37, cost: 0, text: 'The recursive join is child.parent_fragment_id = lineage.fragment_id.' },
          { id: 38, cost: 0, text: 'The black archive branch starts at qx-13 and keeps descending through qx-21, qx-34, and qx-55.' },
        ],
        clue: {
          label: 'Reveal the ancestry walk',
          query: `WITH RECURSIVE lineage AS (
  SELECT f.fragment_id, f.fragment_hash, f.parent_fragment_id, f.author_sigil, 0 AS depth
  FROM fragments f
  WHERE f.fragment_hash = 'ember-root'

  UNION ALL

  SELECT child.fragment_id, child.fragment_hash, child.parent_fragment_id, child.author_sigil, l.depth + 1
  FROM fragments child
  JOIN lineage l ON child.parent_fragment_id = l.fragment_id
)
SELECT l.fragment_hash, l.author_sigil, l.depth, a.archive_name
FROM lineage l
JOIN fragments f ON f.fragment_id = l.fragment_id
JOIN archives a  ON a.archive_id = f.archive_id
ORDER BY l.depth, l.fragment_hash;`,
          desc: 'This proves the quarantined branch is a lineage, not a pile of unrelated incidents.',
        },
      },
      {
        title: 'Floor IV - Name the Architect',
        intro: 'Merge the recursive lineage, seal failures, and breach totals. The author sigil attached to the most dangerous unsealed fragment lineage is your verdict.',
        hint: 'Use a recursive lineage CTE, aggregate breaches per fragment, join seals where state <> intact, then order by total breaches DESC.',
        hints: [
          { id: 39, cost: 0, text: 'You only need fragments from the lineage rooted at ember-root. That drops the unrelated silver branch.' },
          { id: 40, cost: 0, text: 'When you order by total_breaches DESC and take LIMIT 1, the author_sigil is root_zero.' },
        ],
        clue: {
          label: 'Reveal the archive verdict',
          query: `WITH RECURSIVE lineage AS (
  SELECT f.fragment_id
  FROM fragments f
  WHERE f.fragment_hash = 'ember-root'

  UNION ALL

  SELECT child.fragment_id
  FROM fragments child
  JOIN lineage l ON child.parent_fragment_id = l.fragment_id
),
breach_totals AS (
  SELECT f.fragment_id, f.fragment_hash, f.author_sigil, COALESCE(SUM(e.breaches), 0) AS total_breaches
  FROM fragments f
  LEFT JOIN executions e ON e.fragment_id = f.fragment_id
  GROUP BY f.fragment_id, f.fragment_hash, f.author_sigil
),
unsealed AS (
  SELECT bt.fragment_hash, bt.author_sigil, bt.total_breaches, s.seal_state
  FROM breach_totals bt
  JOIN lineage l ON l.fragment_id = bt.fragment_id
  JOIN seals s   ON s.fragment_id = bt.fragment_id
  WHERE s.seal_state <> 'intact'
)
SELECT author_sigil
FROM unsealed
ORDER BY total_breaches DESC, fragment_hash DESC
LIMIT 1;`,
          desc: 'The same sigil authored every catastrophic step in the lineage. Order the failures correctly and the architect names themself.',
        },
      },
    ],
  },
]

export const QUESTS: Quest[] = [...CORE_SQLNOIR_QUESTS, ...SECRET_QUESTS]

export const QUESTS_MAP: Record<string, Quest> = Object.fromEntries(
  QUESTS.map(quest => [quest.id, quest])
)

export function isQuestRevealed(
  quest: Quest,
  progress?: Pick<UserProgress, 'revealedSecretQuestIds'> | null
) {
  return !quest.secret || (progress?.revealedSecretQuestIds ?? []).includes(quest.id)
}

export function getQuestDisplayTitle(
  quest: Quest,
  progress?: Pick<UserProgress, 'revealedSecretQuestIds'> | null
) {
  return isQuestRevealed(quest, progress) ? quest.title : quest.hiddenTitle ?? '???'
}

export function getNextSecretQuestToReveal(
  progress?: Pick<UserProgress, 'revealedSecretQuestIds'> | null
) {
  return QUESTS.find(quest => quest.secret && !isQuestRevealed(quest, progress)) ?? null
}
