import type { Quest } from '@/types'

// ─────────────────────────────────────────────────────────────
// All quest definitions. Seed SQL targets SQLite (sql.js).
// Hint IDs are unique within each quest's hintsUsed array.
// ─────────────────────────────────────────────────────────────

export const QUESTS: Quest[] = [
  // ── Q001 — The Merchant Who Never Ran Out ─────────────────
  {
    id:        'q001',
    title:     'The Merchant Who Never Ran Out',
    rank:      'Legendary',
    rankClass: 'text-gold border-gold/40 bg-gold/10',
    diff:      4,
    lore:      'The guild auditors have flagged a merchant in the Market Quarter whose stockrooms never seem to empty — no matter how much he sells, the shelves are always full. Someone is cooking the ledgers. Find the name of the merchant who defies the laws of supply.',
    answer:    'aldric',
    answerHint:'The merchant\'s name, lowercase.',
    xp:        150,
    tags:      ['SELECT', 'JOIN', 'SUM', 'CTE', 'Window Functions'],
    schema: {
      merchants: [
        { col: 'id',       type: 'INTEGER', pk: true },
        { col: 'name',     type: 'TEXT' },
        { col: 'district', type: 'TEXT' },
      ],
      inventory: [
        { col: 'id',           type: 'INTEGER', pk: true },
        { col: 'merchant_id',  type: 'INTEGER' },
        { col: 'item',         type: 'TEXT' },
        { col: 'stock',        type: 'INTEGER' },
        { col: 'last_updated', type: 'TEXT' },
      ],
      orders: [
        { col: 'id',          type: 'INTEGER', pk: true },
        { col: 'merchant_id', type: 'INTEGER' },
        { col: 'item',        type: 'TEXT' },
        { col: 'quantity',    type: 'INTEGER' },
        { col: 'order_date',  type: 'TEXT' },
        { col: 'supplier',    type: 'TEXT' },
      ],
      sales: [
        { col: 'id',          type: 'INTEGER', pk: true },
        { col: 'merchant_id', type: 'INTEGER' },
        { col: 'item',        type: 'TEXT' },
        { col: 'quantity',    type: 'INTEGER' },
        { col: 'sale_date',   type: 'TEXT' },
      ],
    },
    seed: `
CREATE TABLE merchants (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL
);
INSERT INTO merchants VALUES
  (1, 'aldric',  'market_quarter'),
  (2, 'brom',    'harbor_district'),
  (3, 'cessa',   'upper_city'),
  (4, 'draven',  'market_quarter');

CREATE TABLE inventory (
  id INTEGER PRIMARY KEY,
  merchant_id INTEGER,
  item TEXT NOT NULL,
  stock INTEGER NOT NULL,
  last_updated TEXT NOT NULL
);
INSERT INTO inventory VALUES
  (1, 1, 'iron_ore', 500, '1247-03-15'),
  (2, 1, 'coal',     300, '1247-03-15'),
  (3, 1, 'timber',   200, '1247-03-15'),
  (4, 2, 'fish',     150, '1247-03-15'),
  (5, 2, 'salt',      80, '1247-03-15'),
  (6, 3, 'silk',      40, '1247-03-15'),
  (7, 3, 'spice',     25, '1247-03-15'),
  (8, 4, 'iron_ore', 120, '1247-03-15');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  merchant_id INTEGER,
  item TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  supplier TEXT NOT NULL
);
INSERT INTO orders VALUES
  (1, 1, 'iron_ore', 50,  '1247-01-10', 'northern_mines'),
  (2, 1, 'coal',     30,  '1247-01-10', 'coal_guild'),
  (3, 2, 'fish',    200,  '1247-01-05', 'fishing_co'),
  (4, 2, 'salt',    100,  '1247-01-08', 'salt_traders'),
  (5, 3, 'silk',     60,  '1247-01-15', 'silk_road'),
  (6, 4, 'iron_ore',150,  '1247-01-12', 'northern_mines'),
  (7, 2, 'fish',    180,  '1247-02-05', 'fishing_co'),
  (8, 3, 'spice',    40,  '1247-02-10', 'spice_guild');

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  merchant_id INTEGER,
  item TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  sale_date TEXT NOT NULL
);
INSERT INTO sales VALUES
  (1,  1, 'iron_ore', 120, '1247-01-15'),
  (2,  1, 'iron_ore', 150, '1247-02-01'),
  (3,  1, 'iron_ore', 180, '1247-02-20'),
  (4,  1, 'coal',      90, '1247-01-20'),
  (5,  1, 'coal',     110, '1247-02-15'),
  (6,  1, 'timber',    80, '1247-01-25'),
  (7,  1, 'timber',   120, '1247-02-28'),
  (8,  2, 'fish',     175, '1247-01-20'),
  (9,  2, 'salt',      65, '1247-01-25'),
  (10, 3, 'silk',      45, '1247-02-01'),
  (11, 4, 'iron_ore', 130, '1247-02-05'),
  (12, 2, 'fish',     160, '1247-02-20'),
  (13, 3, 'spice',     30, '1247-02-25');
`,
    floors: [
      {
        title: 'Floor I — The Stockroom Anomaly',
        intro: 'The auditors found something strange: certain stockrooms hold impossibly large inventories. Your task is to identify which merchants are sitting on suspiciously high stock levels for their district.',
        clue: {
          label: 'Scan High-Stock Inventories',
          query: `SELECT m.name, i.item, i.stock\nFROM merchants m\nJOIN inventory i ON m.id = i.merchant_id\nWHERE i.stock > 100\nORDER BY i.stock DESC;`,
          desc:  'Lists all items where stock exceeds 100 units, ranked by quantity.',
        },
        hint:  'Try filtering inventory WHERE stock > 100 and JOIN with merchants.',
        hints: [
          { id: 1, cost: 25, text: 'Use a JOIN between merchants and inventory on merchant_id.' },
          { id: 2, cost: 35, text: "Filter WHERE i.stock > 100 — that's your anomaly threshold." },
          { id: 3, cost: 50, text: "aldric has over 1,000 total units on hand. Run the clue query to see exactly which items." },
        ],
      },
      {
        title: 'Floor II — Supply vs. Demand',
        intro: 'Now compare what each merchant ordered from suppliers versus what they actually sold. The gap will reveal who is operating beyond their supply chain.',
        clue: {
          label: 'Compare Orders to Sales',
          query: `SELECT\n  m.name,\n  (SELECT COALESCE(SUM(o.quantity),0) FROM orders o WHERE o.merchant_id = m.id) AS total_ordered,\n  (SELECT COALESCE(SUM(s.quantity),0) FROM sales s  WHERE s.merchant_id = m.id) AS total_sold\nFROM merchants m\nORDER BY total_sold DESC;`,
          desc:  'Shows total units ordered from suppliers vs. total units sold per merchant.',
        },
        hint:  'Use correlated subqueries or CTEs to SUM orders and sales separately per merchant.',
        hints: [
          { id: 4, cost: 25, text: 'Use two correlated subqueries — one summing orders, one summing sales — joined on merchant_id.' },
          { id: 5, cost: 35, text: 'COALESCE(SUM(...), 0) handles merchants with no orders or no sales.' },
          { id: 6, cost: 50, text: "aldric sold 750 units but only ordered 80. That's a variance of 670 — impossible without a hidden source." },
        ],
      },
      {
        title: 'Floor III — Phantom Stock Variance',
        intro: 'Calculate the phantom stock: the difference between what was sold and what was ordered. A positive number means the merchant sold goods they never officially received.',
        clue: {
          label: 'Calculate Phantom Variance',
          query: `SELECT\n  m.name,\n  (SELECT COALESCE(SUM(s.quantity),0) FROM sales s WHERE s.merchant_id = m.id) -\n  (SELECT COALESCE(SUM(o.quantity),0) FROM orders o WHERE o.merchant_id = m.id) AS phantom_stock\nFROM merchants m\nORDER BY phantom_stock DESC;`,
          desc:  'Reveals merchants who sold more than they ever ordered — the phantom stock variance.',
        },
        hint:  'Subtract total_ordered from total_sold. Any positive result is suspicious.',
        hints: [
          { id: 7, cost: 25, text: 'phantom_stock = total_sold - total_ordered. Positive means sold without restocking.' },
          { id: 8, cost: 35, text: "Order by phantom_stock DESC — the top result is your culprit." },
          { id: 9, cost: 50, text: "aldric's phantom_stock is 670. brom is -100 (legitimate surplus orders). The others are negative too." },
        ],
      },
      {
        title: 'Floor IV — The Verdict',
        intro: 'Compile all the evidence into one CTE. Name the merchant whose phantom stock variance is highest — the one who sold goods that never existed in the official ledger.',
        clue: {
          label: 'Full CTE Evidence Report',
          query: `WITH order_totals AS (\n  SELECT merchant_id, SUM(quantity) AS total_ordered\n  FROM orders GROUP BY merchant_id\n),\nsale_totals AS (\n  SELECT merchant_id, SUM(quantity) AS total_sold\n  FROM sales GROUP BY merchant_id\n),\nvariance AS (\n  SELECT\n    m.name,\n    COALESCE(st.total_sold, 0) - COALESCE(ot.total_ordered, 0) AS phantom_stock\n  FROM merchants m\n  LEFT JOIN order_totals ot ON m.id = ot.merchant_id\n  LEFT JOIN sale_totals  st ON m.id = st.merchant_id\n)\nSELECT name, phantom_stock\nFROM variance\nWHERE phantom_stock > 0\nORDER BY phantom_stock DESC;`,
          desc:  'Full CTE combining all evidence — outputs the merchant with phantom stock.',
        },
        hint:  'Build three CTEs: order_totals, sale_totals, then variance = sold - ordered.',
        hints: [
          { id: 10, cost: 25, text: 'Chain three CTEs: one for order sums, one for sale sums, one for the difference.' },
          { id: 11, cost: 35, text: 'Use LEFT JOINs in the final CTE so merchants with no orders still appear.' },
          { id: 12, cost: 50, text: "The answer is the only merchant with phantom_stock > 0. Filter WHERE phantom_stock > 0 and read the name." },
        ],
      },
    ],
  },

  // ── Q002 — The Curse of the Phantom Order ─────────────────
  {
    id:        'q002',
    title:     'The Curse of the Phantom Order',
    rank:      'Rare',
    rankClass: 'text-rune border-rune/40 bg-rune/10',
    diff:      3,
    lore:      'Shipments are arriving at addresses that have no corresponding paid orders. Someone is receiving guild cargo without paying — but the trail is buried in a chain of sub-orders that loops back on itself. Trace the curse to its origin.',
    answer:    'ghost_client',
    answerHint:'The customer\'s name, lowercase with underscore.',
    xp:        200,
    tags:      ['JOIN', 'LEFT JOIN', 'Recursive CTE', 'NULL checks'],
    schema: {
      customers: [
        { col: 'id',         type: 'INTEGER', pk: true },
        { col: 'name',       type: 'TEXT' },
        { col: 'guild',      type: 'TEXT' },
        { col: 'registered', type: 'INTEGER' },
      ],
      orders: [
        { col: 'id',              type: 'INTEGER', pk: true },
        { col: 'customer_id',     type: 'INTEGER' },
        { col: 'parent_order_id', type: 'INTEGER' },
        { col: 'item',            type: 'TEXT' },
        { col: 'amount',          type: 'INTEGER' },
        { col: 'paid',            type: 'INTEGER' },
        { col: 'order_date',      type: 'TEXT' },
      ],
      shipments: [
        { col: 'id',             type: 'INTEGER', pk: true },
        { col: 'order_id',       type: 'INTEGER' },
        { col: 'delivered_to',   type: 'TEXT' },
        { col: 'delivered_date', type: 'TEXT' },
        { col: 'quantity',       type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  guild TEXT,
  registered INTEGER NOT NULL DEFAULT 1
);
INSERT INTO customers VALUES
  (1, 'mira',         'merchants_guild', 1),
  (2, 'torven',       'traders_union',   1),
  (3, 'ghost_client', NULL,              0),
  (4, 'selene',       'merchants_guild', 1),
  (5, 'harwick',      'traders_union',   1);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  parent_order_id INTEGER,
  item TEXT NOT NULL,
  amount INTEGER NOT NULL,
  paid INTEGER NOT NULL DEFAULT 0,
  order_date TEXT NOT NULL
);
INSERT INTO orders VALUES
  (1,  1, NULL, 'grain',    200, 1, '1247-01-05'),
  (2,  2, NULL, 'timber',   350, 1, '1247-01-06'),
  (3,  1, 1,    'grain',     50, 1, '1247-01-10'),
  (4,  3, NULL, 'iron',     400, 0, '1247-01-12'),
  (5,  3, 4,    'iron',     200, 0, '1247-01-15'),
  (6,  3, 5,    'iron',     100, 0, '1247-01-18'),
  (7,  4, NULL, 'silk',     500, 1, '1247-01-20'),
  (8,  5, NULL, 'spice',    150, 1, '1247-01-22'),
  (9,  3, 6,    'iron',      50, 0, '1247-01-25'),
  (10, 2, 2,    'timber',    80, 1, '1247-01-28');

CREATE TABLE shipments (
  id INTEGER PRIMARY KEY,
  order_id INTEGER,
  delivered_to TEXT NOT NULL,
  delivered_date TEXT NOT NULL,
  quantity INTEGER NOT NULL
);
INSERT INTO shipments VALUES
  (1, 1,  'mira_warehouse',    '1247-01-08', 200),
  (2, 2,  'torven_depot',      '1247-01-09', 350),
  (3, 4,  'shadow_gate_7',     '1247-01-14', 400),
  (4, 5,  'shadow_gate_7',     '1247-01-17', 200),
  (5, 6,  'shadow_gate_7',     '1247-01-20', 100),
  (6, 7,  'selene_manor',      '1247-01-23', 500),
  (7, 8,  'harwick_shop',      '1247-01-25', 150),
  (8, 9,  'shadow_gate_7',     '1247-01-27',  50),
  (9, 10, 'torven_overflow',   '1247-01-30',  80);
`,
    floors: [
      {
        title: 'Floor I — The Missing Bill',
        intro: 'The shipping manifest shows deliveries that were never invoiced. Find all shipments whose linked order was never paid.',
        clue: {
          label: 'Find Unbilled Shipments',
          query: `SELECT s.id AS shipment_id, s.delivered_to, s.quantity, s.delivered_date\nFROM shipments s\nJOIN orders o ON s.order_id = o.id\nWHERE o.paid = 0\nORDER BY s.delivered_date;`,
          desc:  'Finds shipments linked to unpaid orders — goods delivered with no payment.',
        },
        hint:  'JOIN shipments to orders on order_id, then filter WHERE paid = 0.',
        hints: [
          { id: 1, cost: 25, text: 'JOIN shipments s ON s.order_id = o.id, then filter WHERE o.paid = 0.' },
          { id: 2, cost: 35, text: "Four shipments went to 'shadow_gate_7' — all linked to unpaid orders." },
          { id: 3, cost: 50, text: "750 units of iron were delivered to shadow_gate_7 across 4 shipments, none paid for." },
        ],
      },
      {
        title: 'Floor II — The Recipient',
        intro: 'Now trace those unpaid shipments back to the customer who placed the orders. Who registered to receive these ghost deliveries?',
        clue: {
          label: 'Trace Unpaid Shipments to Customer',
          query: `SELECT c.name, s.delivered_to, s.quantity, s.delivered_date\nFROM shipments s\nJOIN orders o   ON s.order_id = o.id\nJOIN customers c ON o.customer_id = c.id\nWHERE o.paid = 0\nORDER BY s.delivered_date;`,
          desc:  'Links each unpaid shipment back to the customer who placed the order.',
        },
        hint:  'Chain JOIN: shipments → orders → customers. Filter WHERE paid = 0.',
        hints: [
          { id: 4, cost: 25, text: 'Chain three tables: shipments JOIN orders JOIN customers, all on their FK columns.' },
          { id: 5, cost: 35, text: "c.name will reveal the customer behind every unpaid delivery." },
          { id: 6, cost: 50, text: "All four unpaid shipments belong to the same customer. Their name has an underscore in it." },
        ],
      },
      {
        title: 'Floor III — The Order Chain',
        intro: 'The orders are nested — sub-orders reference parent orders that themselves reference parents. Use a recursive CTE to unravel the full chain.',
        clue: {
          label: 'Recursive Order Chain',
          query: `WITH RECURSIVE order_chain AS (\n  SELECT id, customer_id, parent_order_id, item, paid, 0 AS depth\n  FROM orders WHERE parent_order_id IS NULL\n  UNION ALL\n  SELECT o.id, o.customer_id, o.parent_order_id, o.item, o.paid, oc.depth + 1\n  FROM orders o\n  JOIN order_chain oc ON o.parent_order_id = oc.id\n)\nSELECT c.name, oc.id AS order_id, oc.depth, oc.paid\nFROM order_chain oc\nJOIN customers c ON oc.customer_id = c.id\nORDER BY oc.depth, oc.id;`,
          desc:  'Recursive CTE that walks the order parent chain from root to leaf.',
        },
        hint:  'Anchor on parent_order_id IS NULL, recurse by joining orders ON o.parent_order_id = oc.id.',
        hints: [
          { id: 7, cost: 25, text: 'Start the recursive CTE anchor with WHERE parent_order_id IS NULL (root orders).' },
          { id: 8, cost: 35, text: 'The recursive step joins orders o ON o.parent_order_id = oc.id, incrementing depth.' },
          { id: 9, cost: 50, text: "ghost_client's chain goes 4 levels deep (depth 0→3), all unpaid, all ending at shadow_gate_7." },
        ],
      },
      {
        title: 'Floor IV — The Verdict',
        intro: 'Combine the recursive order chain with shipment data to conclusively name the client who received guild cargo without a single paid invoice.',
        clue: {
          label: 'Full Recursive + Shipment CTE',
          query: `WITH RECURSIVE order_chain AS (\n  SELECT id, customer_id, parent_order_id, paid, 0 AS depth\n  FROM orders WHERE parent_order_id IS NULL\n  UNION ALL\n  SELECT o.id, o.customer_id, o.parent_order_id, o.paid, oc.depth + 1\n  FROM orders o JOIN order_chain oc ON o.parent_order_id = oc.id\n),\nghost_orders AS (\n  SELECT oc.id AS order_id, oc.customer_id\n  FROM order_chain oc\n  WHERE oc.paid = 0\n)\nSELECT DISTINCT c.name AS suspect\nFROM ghost_orders go\nJOIN customers c  ON go.customer_id = c.id\nJOIN shipments s  ON s.order_id = go.order_id\nORDER BY suspect;`,
          desc:  'Final query: recursive chain → filter unpaid → join shipments → name the suspect.',
        },
        hint:  'Three CTEs: recursive chain, then ghost_orders (paid=0), then join to shipments and customers.',
        hints: [
          { id: 10, cost: 25, text: 'Wrap the recursive CTE in a second CTE called ghost_orders that filters WHERE paid = 0.' },
          { id: 11, cost: 35, text: 'JOIN ghost_orders to shipments (s.order_id = go.order_id) to confirm delivery happened.' },
          { id: 12, cost: 50, text: "SELECT DISTINCT c.name — only one customer appears. That's your answer." },
        ],
      },
    ],
  },

  // ── Q003 — The Shapeshifter's Ledger ──────────────────────
  {
    id:        'q003',
    title:     "The Shapeshifter's Ledger",
    rank:      'Uncommon',
    rankClass: 'text-parchment border-parchment/40 bg-parchment/10',
    diff:      5,
    lore:      "The guild's payroll office has discovered they're paying for more workers than they hired. Someone has registered multiple identities — each drawing a full wage — but only one person is logging the hours. Find the shapeshifter who fractured their identity across the ledger.",
    answer:    'vex',
    answerHint:"The employee's base name, lowercase.",
    xp:        250,
    tags:      ['GROUP BY', 'HAVING', 'JOIN', 'CASE WHEN', 'CTE', 'PIVOT'],
    schema: {
      employees: [
        { col: 'id',         type: 'INTEGER', pk: true },
        { col: 'alias',      type: 'TEXT' },
        { col: 'base_name',  type: 'TEXT' },
        { col: 'department', type: 'TEXT' },
        { col: 'hire_date',  type: 'TEXT' },
      ],
      payroll: [
        { col: 'id',          type: 'INTEGER', pk: true },
        { col: 'employee_id', type: 'INTEGER' },
        { col: 'month',       type: 'TEXT' },
        { col: 'wage',        type: 'INTEGER' },
      ],
      work_logs: [
        { col: 'id',          type: 'INTEGER', pk: true },
        { col: 'employee_id', type: 'INTEGER' },
        { col: 'work_date',   type: 'TEXT' },
        { col: 'hours',       type: 'INTEGER' },
        { col: 'task',        type: 'TEXT' },
      ],
    },
    seed: `
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  alias TEXT NOT NULL UNIQUE,
  base_name TEXT NOT NULL,
  department TEXT NOT NULL,
  hire_date TEXT NOT NULL
);
INSERT INTO employees VALUES
  (1, 'vex_1',   'vex',    'logistics', '1246-05-01'),
  (2, 'vex_2',   'vex',    'logistics', '1246-05-02'),
  (3, 'vex_3',   'vex',    'logistics', '1246-05-03'),
  (4, 'aldara',  'aldara', 'records',   '1246-03-10'),
  (5, 'fenn',    'fenn',   'logistics', '1246-04-15'),
  (6, 'sorcha',  'sorcha', 'records',   '1246-06-01'),
  (7, 'griml',   'griml',  'courier',   '1246-02-20'),
  (8, 'theron',  'theron', 'courier',   '1246-07-05');

CREATE TABLE payroll (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER,
  month TEXT NOT NULL,
  wage INTEGER NOT NULL
);
INSERT INTO payroll VALUES
  (1,  1, '1247-01', 300),
  (2,  2, '1247-01', 300),
  (3,  3, '1247-01', 300),
  (4,  4, '1247-01', 280),
  (5,  5, '1247-01', 290),
  (6,  6, '1247-01', 275),
  (7,  7, '1247-01', 310),
  (8,  8, '1247-01', 295),
  (9,  1, '1247-02', 300),
  (10, 2, '1247-02', 300),
  (11, 3, '1247-02', 300),
  (12, 4, '1247-02', 280),
  (13, 5, '1247-02', 290),
  (14, 6, '1247-02', 275),
  (15, 7, '1247-02', 310),
  (16, 8, '1247-02', 295),
  (17, 1, '1247-03', 300),
  (18, 2, '1247-03', 300),
  (19, 3, '1247-03', 300),
  (20, 4, '1247-03', 280),
  (21, 5, '1247-03', 290),
  (22, 6, '1247-03', 275),
  (23, 7, '1247-03', 310),
  (24, 8, '1247-03', 295);

CREATE TABLE work_logs (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER,
  work_date TEXT NOT NULL,
  hours INTEGER NOT NULL,
  task TEXT NOT NULL
);
-- Only vex_1 logs hours; vex_2 and vex_3 log nothing (same person)
INSERT INTO work_logs VALUES
  (1,  1, '1247-01-03', 8, 'cargo_sorting'),
  (2,  1, '1247-01-04', 8, 'manifest_check'),
  (3,  1, '1247-01-07', 8, 'cargo_sorting'),
  (4,  1, '1247-01-08', 8, 'delivery_run'),
  (5,  4, '1247-01-03', 8, 'filing'),
  (6,  4, '1247-01-04', 7, 'archiving'),
  (7,  4, '1247-01-07', 8, 'filing'),
  (8,  5, '1247-01-03', 8, 'cargo_sorting'),
  (9,  5, '1247-01-04', 8, 'delivery_run'),
  (10, 6, '1247-01-03', 7, 'archiving'),
  (11, 6, '1247-01-04', 8, 'filing'),
  (12, 7, '1247-01-05', 8, 'courier_run'),
  (13, 7, '1247-01-06', 8, 'courier_run'),
  (14, 8, '1247-01-05', 8, 'courier_run'),
  (15, 8, '1247-01-06', 7, 'dispatch'),
  (16, 1, '1247-02-03', 8, 'cargo_sorting'),
  (17, 1, '1247-02-04', 8, 'manifest_check'),
  (18, 4, '1247-02-03', 8, 'filing'),
  (19, 5, '1247-02-03', 8, 'delivery_run'),
  (20, 7, '1247-02-05', 8, 'courier_run'),
  (21, 8, '1247-02-05', 8, 'courier_run');
`,
    floors: [
      {
        title: 'Floor I — The Duplicate Register',
        intro: 'The employee register contains aliases — short names with numeric suffixes. Group by the base name to find which identity appears more than once on the payroll.',
        clue: {
          label: 'Find Duplicate Base Names',
          query: `SELECT base_name, COUNT(*) AS alias_count, GROUP_CONCAT(alias) AS aliases\nFROM employees\nGROUP BY base_name\nHAVING COUNT(*) > 1\nORDER BY alias_count DESC;`,
          desc:  'Groups employees by base_name and flags any name with multiple registered aliases.',
        },
        hint:  'GROUP BY base_name, then HAVING COUNT(*) > 1 to find duplicates.',
        hints: [
          { id: 1, cost: 25, text: 'GROUP BY base_name and use HAVING COUNT(*) > 1 to filter multi-alias identities.' },
          { id: 2, cost: 35, text: 'GROUP_CONCAT(alias) will show all aliases registered under the same base name.' },
          { id: 3, cost: 50, text: "Only one base_name has more than one alias. That name appears three times in the register." },
        ],
      },
      {
        title: 'Floor II — Triple Wages',
        intro: 'Each alias receives a full wage independently. Join payroll to employees and see what each identity is collecting — then look at the base_name totals.',
        clue: {
          label: 'Wages Per Identity',
          query: `SELECT e.base_name, e.alias, SUM(p.wage) AS total_paid\nFROM employees e\nJOIN payroll p ON e.id = p.employee_id\nGROUP BY e.id, e.base_name, e.alias\nORDER BY e.base_name, total_paid DESC;`,
          desc:  'Shows total wages paid to each individual alias, grouped under their base name.',
        },
        hint:  'JOIN payroll on employee_id, GROUP BY e.id and base_name, then SUM wage.',
        hints: [
          { id: 4, cost: 25, text: 'JOIN employees e and payroll p on e.id = p.employee_id, then GROUP BY e.id, e.base_name, e.alias.' },
          { id: 5, cost: 35, text: 'SUM(p.wage) gives total wages per alias. Compare the sums — one base_name is drawing triple.' },
          { id: 6, cost: 50, text: "Three aliases share the same base_name, each collecting 900 gold — 2,700 total from one person." },
        ],
      },
      {
        title: 'Floor III — The Absent Witnesses',
        intro: 'Someone collecting triple wages should be logging triple hours. Pivot the wage payments by month using CASE WHEN. Then check work_logs — most of these aliases have no hours at all.',
        clue: {
          label: 'Pivot Wages by Month',
          query: `SELECT\n  e.base_name,\n  SUM(CASE WHEN p.month = '1247-01' THEN p.wage ELSE 0 END) AS jan,\n  SUM(CASE WHEN p.month = '1247-02' THEN p.wage ELSE 0 END) AS feb,\n  SUM(CASE WHEN p.month = '1247-03' THEN p.wage ELSE 0 END) AS mar,\n  SUM(p.wage) AS total\nFROM employees e\nJOIN payroll p ON e.id = p.employee_id\nGROUP BY e.base_name\nORDER BY total DESC;`,
          desc:  'PIVOT: breaks wages into monthly columns per base_name using CASE WHEN.',
        },
        hint:  'Use SUM(CASE WHEN month = \'1247-01\' THEN wage ELSE 0 END) AS jan for each month column.',
        hints: [
          { id: 7, cost: 25, text: "Use CASE WHEN p.month = '1247-01' THEN p.wage ELSE 0 END inside SUM() for each month column." },
          { id: 8, cost: 35, text: 'GROUP BY base_name so all aliases collapse into one row per person.' },
          { id: 9, cost: 50, text: "The top earner's total is three times higher than anyone else, but check work_logs — their hours tell a different story." },
        ],
      },
      {
        title: 'Floor IV — The Verdict',
        intro: "Combine the identity map with payroll totals in a CTE. The shapeshifter is the base_name with multiple aliases, outsized wages, and only one alias that ever showed up to work.",
        clue: {
          label: 'Full CTE — Identity Map + Wage Fraud',
          query: `WITH identity_map AS (\n  SELECT base_name,\n    COUNT(*)            AS aliases,\n    GROUP_CONCAT(alias) AS all_aliases\n  FROM employees\n  GROUP BY base_name\n),\nwage_totals AS (\n  SELECT e.base_name, SUM(p.wage) AS total_wage\n  FROM employees e\n  JOIN payroll p ON e.id = p.employee_id\n  GROUP BY e.base_name\n),\nlog_totals AS (\n  SELECT e.base_name, COALESCE(SUM(wl.hours), 0) AS total_hours\n  FROM employees e\n  LEFT JOIN work_logs wl ON e.id = wl.employee_id\n  GROUP BY e.base_name\n)\nSELECT im.base_name, im.aliases, im.all_aliases, wt.total_wage, lt.total_hours\nFROM identity_map im\nJOIN wage_totals  wt ON im.base_name = wt.base_name\nJOIN log_totals   lt ON im.base_name = lt.base_name\nWHERE im.aliases > 1\nORDER BY wt.total_wage DESC;`,
          desc:  'Three-CTE final query: identity map, wage totals, hour totals — exposes the fraud.',
        },
        hint:  'Three CTEs: identity_map (alias count), wage_totals (SUM wage), log_totals (SUM hours). Filter WHERE aliases > 1.',
        hints: [
          { id: 10, cost: 25, text: 'Build three CTEs: identity_map (GROUP BY base_name), wage_totals (JOIN payroll), log_totals (LEFT JOIN work_logs).' },
          { id: 11, cost: 35, text: 'LEFT JOIN work_logs so aliases with zero hours still appear — the absence of hours is the evidence.' },
          { id: 12, cost: 50, text: "The answer is the base_name in the result — only one row appears when filtering WHERE aliases > 1." },
        ],
      },
    ],
  },

  // ── Q004 — The Clockwork Alibi ────────────────────────────
  {
    id:        'q004',
    title:     'The Clockwork Alibi',
    rank:      'Rare',
    rankClass: 'text-rune border-rune/40 bg-rune/10',
    diff:      3,
    lore:      "A theft struck the vault at '1247-02-14 02:30'. Every guard filed patrol logs. But window functions tell a different story — someone was absent exactly when it mattered. Sequence the patrols, measure the gaps, and find the guard who vanished.",
    answer:    'harkon',
    answerHint:"The guard's name, lowercase.",
    xp:        175,
    tags:      ['ROW_NUMBER', 'LAG', 'RANK', 'Window Functions', 'CTE'],
    schema: {
      guards: [
        { col: 'id',   type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
        { col: 'post', type: 'TEXT' },
      ],
      patrol_log: [
        { col: 'id',         type: 'INTEGER', pk: true },
        { col: 'guard_id',   type: 'INTEGER' },
        { col: 'post',       type: 'TEXT' },
        { col: 'logged_at',  type: 'TEXT' },
      ],
      incidents: [
        { col: 'id',          type: 'INTEGER', pk: true },
        { col: 'post',        type: 'TEXT' },
        { col: 'occurred_at', type: 'TEXT' },
        { col: 'severity',    type: 'TEXT' },
      ],
    },
    seed: `
CREATE TABLE guards (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  post TEXT NOT NULL
);
INSERT INTO guards VALUES
  (1, 'harkon', 'vault_corridor'),
  (2, 'bryen',  'east_gate'),
  (3, 'calla',  'vault_corridor'),
  (4, 'ondred', 'west_tower'),
  (5, 'tess',   'east_gate');

CREATE TABLE patrol_log (
  id INTEGER PRIMARY KEY,
  guard_id INTEGER NOT NULL,
  post TEXT NOT NULL,
  logged_at TEXT NOT NULL
);
INSERT INTO patrol_log VALUES
  -- harkon: 8-hour gap spanning the incident at 02:30
  (1,  1, 'vault_corridor', '1247-02-13 20:00'),
  (2,  1, 'vault_corridor', '1247-02-13 22:00'),
  (3,  1, 'vault_corridor', '1247-02-14 06:00'),
  (4,  1, 'vault_corridor', '1247-02-14 08:00'),
  -- bryen: normal 2-hour gaps
  (5,  2, 'east_gate', '1247-02-13 20:00'),
  (6,  2, 'east_gate', '1247-02-13 22:00'),
  (7,  2, 'east_gate', '1247-02-14 00:00'),
  (8,  2, 'east_gate', '1247-02-14 02:00'),
  (9,  2, 'east_gate', '1247-02-14 04:00'),
  (10, 2, 'east_gate', '1247-02-14 06:00'),
  -- calla: normal 2-hour gaps on vault_corridor
  (11, 3, 'vault_corridor', '1247-02-13 20:00'),
  (12, 3, 'vault_corridor', '1247-02-13 22:00'),
  (13, 3, 'vault_corridor', '1247-02-14 00:00'),
  (14, 3, 'vault_corridor', '1247-02-14 02:00'),
  (15, 3, 'vault_corridor', '1247-02-14 04:00'),
  (16, 3, 'vault_corridor', '1247-02-14 06:00'),
  -- ondred: normal 2-hour gaps
  (17, 4, 'west_tower', '1247-02-13 21:00'),
  (18, 4, 'west_tower', '1247-02-13 23:00'),
  (19, 4, 'west_tower', '1247-02-14 01:00'),
  (20, 4, 'west_tower', '1247-02-14 03:00'),
  (21, 4, 'west_tower', '1247-02-14 05:00'),
  -- tess: normal 2-hour gaps
  (22, 5, 'east_gate', '1247-02-13 21:00'),
  (23, 5, 'east_gate', '1247-02-13 23:00'),
  (24, 5, 'east_gate', '1247-02-14 01:00'),
  (25, 5, 'east_gate', '1247-02-14 03:00'),
  (26, 5, 'east_gate', '1247-02-14 05:00');

CREATE TABLE incidents (
  id INTEGER PRIMARY KEY,
  post TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  severity TEXT NOT NULL
);
INSERT INTO incidents VALUES
  (1, 'vault_corridor', '1247-02-14 02:30', 'critical'),
  (2, 'east_gate',      '1247-02-13 23:45', 'minor'),
  (3, 'west_tower',     '1247-02-14 00:15', 'minor');
`,
    floors: [
      {
        title: 'Floor I — The Patrol Sequence',
        intro: "Every guard's log entries must be numbered in order to detect gaps. Use ROW_NUMBER() to assign a sequence to each guard's patrol entries.",
        clue: {
          label: 'Sequence Patrol Entries',
          query: `SELECT\n  g.name,\n  pl.post,\n  pl.logged_at,\n  ROW_NUMBER() OVER (PARTITION BY pl.guard_id ORDER BY pl.logged_at) AS seq\nFROM patrol_log pl\nJOIN guards g ON g.id = pl.guard_id\nORDER BY g.name, pl.logged_at;`,
          desc:  'ROW_NUMBER() partitioned by guard_id assigns a sequential number to each patrol entry.',
        },
        hint:  'Use ROW_NUMBER() OVER (PARTITION BY guard_id ORDER BY logged_at) to sequence each guard\'s entries.',
        hints: [
          { id: 1, cost: 25, text: 'ROW_NUMBER() OVER (PARTITION BY guard_id ORDER BY logged_at) assigns a per-guard sequence number.' },
          { id: 2, cost: 35, text: 'JOIN guards to get the name column. ORDER BY g.name, pl.logged_at to see each guard\'s timeline.' },
          { id: 3, cost: 50, text: "harkon has only 4 entries — far fewer than the others. Scan for the largest gap between seq 2 and seq 3." },
        ],
      },
      {
        title: 'Floor II — Measuring the Gap',
        intro: 'Use LAG() to fetch the previous check-in time and compute the gap in hours using julianday arithmetic.',
        clue: {
          label: 'Compute Gap Hours with LAG',
          query: `SELECT\n  g.name,\n  pl.post,\n  pl.logged_at,\n  LAG(pl.logged_at) OVER (PARTITION BY pl.guard_id ORDER BY pl.logged_at) AS prev_logged,\n  ROUND(\n    (julianday(pl.logged_at) - julianday(\n      LAG(pl.logged_at) OVER (PARTITION BY pl.guard_id ORDER BY pl.logged_at)\n    )) * 24, 2\n  ) AS gap_hours\nFROM patrol_log pl\nJOIN guards g ON g.id = pl.guard_id\nORDER BY gap_hours DESC NULLS LAST;`,
          desc:  'LAG() retrieves the prior check-in; julianday difference * 24 gives the gap in hours.',
        },
        hint:  'LAG(logged_at) OVER (PARTITION BY guard_id ORDER BY logged_at) gives the previous timestamp. Multiply julianday difference by 24 for hours.',
        hints: [
          { id: 4, cost: 25, text: 'LAG(pl.logged_at) OVER (PARTITION BY pl.guard_id ORDER BY pl.logged_at) retrieves the prior timestamp for the same guard.' },
          { id: 5, cost: 35, text: '(julianday(logged_at) - julianday(prev_logged)) * 24 gives gap in hours. Wrap in ROUND(..., 2).' },
          { id: 6, cost: 50, text: "harkon's gap between '1247-02-13 22:00' and '1247-02-14 06:00' is 8.0 hours — the largest by far." },
        ],
      },
      {
        title: 'Floor III — Ranking the Suspects',
        intro: 'Aggregate the worst gap per guard and use RANK() to surface who had the most suspicious absence.',
        clue: {
          label: 'Rank Guards by Maximum Gap',
          query: `WITH gaps AS (\n  SELECT\n    g.name,\n    pl.post,\n    pl.logged_at,\n    LAG(pl.logged_at) OVER (PARTITION BY pl.guard_id ORDER BY pl.logged_at) AS prev_logged,\n    (julianday(pl.logged_at) - julianday(\n      LAG(pl.logged_at) OVER (PARTITION BY pl.guard_id ORDER BY pl.logged_at)\n    )) * 24 AS gap_hours\n  FROM patrol_log pl\n  JOIN guards g ON g.id = pl.guard_id\n)\nSELECT\n  name,\n  ROUND(MAX(gap_hours), 2) AS worst_gap,\n  RANK() OVER (ORDER BY MAX(gap_hours) DESC) AS suspicion_rank\nFROM gaps\nWHERE gap_hours IS NOT NULL\nGROUP BY name\nORDER BY suspicion_rank;`,
          desc:  'CTE computes gap per entry; outer query ranks guards by their worst (maximum) gap.',
        },
        hint:  'Wrap the LAG query in a CTE called gaps, then GROUP BY name and use RANK() OVER (ORDER BY MAX(gap_hours) DESC).',
        hints: [
          { id: 7, cost: 25, text: 'Put the LAG calculation inside a CTE named gaps, then SELECT from it with GROUP BY name.' },
          { id: 8, cost: 35, text: 'RANK() OVER (ORDER BY MAX(gap_hours) DESC) ranks the outer GROUP BY result — no extra partitioning needed here.' },
          { id: 9, cost: 50, text: "harkon ranks #1 with an 8-hour gap. Every other guard's worst gap is 2 hours." },
        ],
      },
      {
        title: 'Floor IV — The Verdict',
        intro: "Confirm the culprit: find the guard whose patrol gap spans the exact time of the critical incident at vault_corridor.",
        clue: {
          label: 'Gap Spans the Incident',
          query: `WITH patrol_gaps AS (\n  SELECT\n    g.id AS guard_id,\n    g.name,\n    pl.post,\n    LAG(pl.logged_at) OVER (PARTITION BY pl.guard_id ORDER BY pl.logged_at) AS prev_logged,\n    pl.logged_at,\n    (julianday(pl.logged_at) - julianday(\n      LAG(pl.logged_at) OVER (PARTITION BY pl.guard_id ORDER BY pl.logged_at)\n    )) * 24 AS gap_hours\n  FROM patrol_log pl\n  JOIN guards g ON g.id = pl.guard_id\n),\nincident_cover AS (\n  SELECT pg.name, pg.post, pg.prev_logged, pg.logged_at, pg.gap_hours, i.occurred_at, i.severity\n  FROM patrol_gaps pg\n  JOIN incidents i ON i.post = pg.post\n  WHERE pg.prev_logged < i.occurred_at\n    AND pg.logged_at  > i.occurred_at\n    AND i.severity = 'critical'\n)\nSELECT name, post, prev_logged, logged_at, gap_hours, occurred_at\nFROM incident_cover\nORDER BY gap_hours DESC;`,
          desc:  'patrol_gaps CTE + incident_cover CTE: finds guards whose gap window contains the critical incident timestamp.',
        },
        hint:  'Two CTEs: patrol_gaps (LAG), then incident_cover joining on post WHERE prev_logged < occurred_at AND logged_at > occurred_at.',
        hints: [
          { id: 10, cost: 25, text: 'In the incident_cover CTE, join patrol_gaps to incidents ON i.post = pg.post.' },
          { id: 11, cost: 35, text: "Filter WHERE pg.prev_logged < i.occurred_at AND pg.logged_at > i.occurred_at — the gap window must contain the incident time." },
          { id: 12, cost: 50, text: "Only harkon's gap ('22:00' → '06:00') spans the critical incident at '02:30'. That's your answer." },
        ],
      },
    ],
  },

  // ── Q005 — The Alchemist's Debt ───────────────────────────
  {
    id:        'q005',
    title:     "The Alchemist's Debt",
    rank:      'Common',
    rankClass: 'text-mist border-mist/40 bg-mist/10',
    diff:      2,
    lore:      "The Collector's Guild keeps meticulous debt records. Someone has been dodging payment for so long the debt has compounded beyond reason. Use date arithmetic to surface the oldest unpaid obligation and name the debtor who owes the most.",
    answer:    'mordecai',
    answerHint:"The debtor's name, lowercase.",
    xp:        125,
    tags:      ['julianday', 'Date Arithmetic', 'CASE WHEN', 'CTE', 'GROUP BY'],
    schema: {
      debtors: [
        { col: 'id',       type: 'INTEGER', pk: true },
        { col: 'name',     type: 'TEXT' },
        { col: 'guild',    type: 'TEXT' },
        { col: 'district', type: 'TEXT' },
      ],
      loans: [
        { col: 'id',          type: 'INTEGER', pk: true },
        { col: 'debtor_id',   type: 'INTEGER' },
        { col: 'principal',   type: 'INTEGER' },
        { col: 'issued_date', type: 'TEXT' },
        { col: 'due_date',    type: 'TEXT' },
      ],
      payments: [
        { col: 'id',           type: 'INTEGER', pk: true },
        { col: 'loan_id',      type: 'INTEGER' },
        { col: 'amount_paid',  type: 'INTEGER' },
        { col: 'payment_date', type: 'TEXT' },
      ],
    },
    seed: `
CREATE TABLE debtors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  guild TEXT,
  district TEXT NOT NULL
);
INSERT INTO debtors VALUES
  (1, 'mordecai', 'alchemists_circle', 'lower_ward'),
  (2, 'fenwick',  'merchants_guild',   'market_quarter'),
  (3, 'aldren',   'traders_union',     'harbor_district'),
  (4, 'sable',    NULL,                'lower_ward'),
  (5, 'corvin',   'alchemists_circle', 'upper_city');

CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  debtor_id INTEGER NOT NULL,
  principal INTEGER NOT NULL,
  issued_date TEXT NOT NULL,
  due_date TEXT NOT NULL
);
INSERT INTO loans VALUES
  (1, 1, 4000, '1246-03-01', '1246-09-01'),
  (2, 1, 3000, '1246-06-15', '1247-01-01'),
  (3, 2, 1500, '1247-02-01', '1247-08-01'),
  (4, 3, 2000, '1246-11-01', '1247-05-01'),
  (5, 4,  800, '1247-01-10', '1247-07-10'),
  (6, 5, 1200, '1246-12-01', '1247-06-01');

CREATE TABLE payments (
  id INTEGER PRIMARY KEY,
  loan_id INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL,
  payment_date TEXT NOT NULL
);
INSERT INTO payments VALUES
  -- aldren paid loan 4 in full
  (1, 4, 2000, '1247-02-15'),
  -- sable made a partial payment
  (2, 5, 300, '1247-02-01'),
  -- mordecai made no payments (loans 1 and 2 have no payments)
  -- fenwick loan not yet due, no payments needed
  -- corvin partial payment
  (3, 6, 500, '1247-01-20');
`,
    floors: [
      {
        title: 'Floor I — Past Due',
        intro: "The registry lists every loan's due date. Filter down to the loans already past due as of '1247-03-15'.",
        clue: {
          label: 'Find Overdue Loans',
          query: `SELECT d.name, l.id AS loan_id, l.principal, l.due_date\nFROM loans l\nJOIN debtors d ON d.id = l.debtor_id\nWHERE l.due_date < '1247-03-15'\nORDER BY l.due_date ASC;`,
          desc:  "Simple WHERE filter: due_date before '1247-03-15' — shows all loans already past due.",
        },
        hint:  "Filter WHERE due_date < '1247-03-15' and JOIN debtors for names.",
        hints: [
          { id: 1, cost: 25, text: "JOIN loans l and debtors d on d.id = l.debtor_id, then WHERE l.due_date < '1247-03-15'." },
          { id: 2, cost: 35, text: 'ORDER BY l.due_date ASC to see the oldest overdue loan first.' },
          { id: 3, cost: 50, text: "mordecai's first loan was due '1246-09-01' — over 196 days overdue. His second was due '1247-01-01'." },
        ],
      },
      {
        title: 'Floor II — Days Overdue',
        intro: "Calculate exactly how many days overdue each loan is using julianday arithmetic.",
        clue: {
          label: 'Calculate Days Overdue',
          query: `SELECT\n  d.name,\n  l.id AS loan_id,\n  l.due_date,\n  CAST(julianday('1247-03-15') - julianday(l.due_date) AS INTEGER) AS days_overdue\nFROM loans l\nJOIN debtors d ON d.id = l.debtor_id\nWHERE l.due_date < '1247-03-15'\nORDER BY days_overdue DESC;`,
          desc:  "julianday('1247-03-15') - julianday(due_date) gives exact days overdue.",
        },
        hint:  "CAST(julianday('1247-03-15') - julianday(due_date) AS INTEGER) gives days overdue.",
        hints: [
          { id: 4, cost: 25, text: "julianday() converts a date string to a real number. Subtract and CAST AS INTEGER for whole days." },
          { id: 5, cost: 35, text: "Filter WHERE due_date < '1247-03-15' first, then compute the difference for overdue rows only." },
          { id: 6, cost: 50, text: "mordecai's loan 1 is 196 days overdue; loan 2 is 73 days overdue. Combined that's the worst in the register." },
        ],
      },
      {
        title: 'Floor III — Aging Buckets',
        intro: 'Classify each overdue loan into an aging bucket: 0-30 days, 31-60 days, 61-90 days, or 90+ days.',
        clue: {
          label: 'Aging Bucket Classification',
          query: `SELECT\n  d.name,\n  l.id AS loan_id,\n  CAST(julianday('1247-03-15') - julianday(l.due_date) AS INTEGER) AS days_overdue,\n  CASE\n    WHEN julianday('1247-03-15') - julianday(l.due_date) <= 30  THEN '0-30'\n    WHEN julianday('1247-03-15') - julianday(l.due_date) <= 60  THEN '31-60'\n    WHEN julianday('1247-03-15') - julianday(l.due_date) <= 90  THEN '61-90'\n    ELSE '90+'\n  END AS aging_bucket\nFROM loans l\nJOIN debtors d ON d.id = l.debtor_id\nWHERE l.due_date < '1247-03-15'\nORDER BY days_overdue DESC;`,
          desc:  'CASE WHEN on the julianday difference assigns each loan to an aging bucket.',
        },
        hint:  "Use CASE WHEN julianday('1247-03-15') - julianday(due_date) <= 30 THEN '0-30' ... ELSE '90+' END.",
        hints: [
          { id: 7, cost: 25, text: "CASE WHEN ... <= 30 THEN '0-30' WHEN ... <= 60 THEN '31-60' WHEN ... <= 90 THEN '61-90' ELSE '90+' END." },
          { id: 8, cost: 35, text: "Compute the julianday difference inline in the CASE WHEN — no need for a subquery." },
          { id: 9, cost: 50, text: "mordecai has two loans in the 90+ bucket. No other debtor has more than one overdue loan." },
        ],
      },
      {
        title: 'Floor IV — The Verdict',
        intro: 'Build a CTE that calculates outstanding balance per debtor (principal minus total payments) and rank by who owes the most.',
        clue: {
          label: 'Outstanding Balance CTE',
          query: `WITH paid AS (\n  SELECT loan_id, COALESCE(SUM(amount_paid), 0) AS total_paid\n  FROM payments\n  GROUP BY loan_id\),\nbalances AS (\n  SELECT\n    d.name,\n    l.id AS loan_id,\n    l.principal,\n    COALESCE(p.total_paid, 0) AS total_paid,\n    l.principal - COALESCE(p.total_paid, 0) AS outstanding\n  FROM loans l\n  JOIN debtors d ON d.id = l.debtor_id\n  LEFT JOIN paid p ON p.loan_id = l.id\n)\nSELECT name, SUM(outstanding) AS total_outstanding\nFROM balances\nGROUP BY name\nHAVING SUM(outstanding) > 0\nORDER BY total_outstanding DESC;`,
          desc:  'paid CTE sums payments per loan; balances CTE subtracts; outer query groups by debtor.',
        },
        hint:  'Two CTEs: paid (SUM payments per loan_id), then balances (principal - paid). GROUP BY name and ORDER BY total_outstanding DESC.',
        hints: [
          { id: 10, cost: 25, text: 'CTE paid: SELECT loan_id, SUM(amount_paid) FROM payments GROUP BY loan_id.' },
          { id: 11, cost: 35, text: 'LEFT JOIN paid onto loans so loans with no payments still appear (COALESCE to 0).' },
          { id: 12, cost: 50, text: "mordecai owes 7,000 outstanding (no payments at all). The top row of your result is the answer." },
        ],
      },
    ],
  },

  // ── Q006 — The Bloodline Curse ────────────────────────────
  {
    id:        'q006',
    title:     'The Bloodline Curse',
    rank:      'Legendary',
    rankClass: 'text-gold border-gold/40 bg-gold/10',
    diff:      4,
    lore:      'The Verenthis bloodline carries a curse — every generation incurs more debt than it inherits assets. Use a recursive CTE to traverse the family tree, accumulate lineage debt, and name the dynasty drowning in obligation.',
    answer:    'verenthis',
    answerHint:"The dynasty root name, lowercase.",
    xp:        225,
    tags:      ['Recursive CTE', 'Self-Join', 'GROUP BY', 'CTE', 'Hierarchy'],
    schema: {
      nobles: [
        { col: 'id',           type: 'INTEGER', pk: true },
        { col: 'name',         type: 'TEXT' },
        { col: 'parent_id',    type: 'INTEGER' },
        { col: 'estate_value', type: 'INTEGER' },
        { col: 'debt',         type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE nobles (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER,
  estate_value INTEGER NOT NULL DEFAULT 0,
  debt INTEGER NOT NULL DEFAULT 0
);
INSERT INTO nobles VALUES
  -- Verenthis dynasty (root = id 1)
  (1,  'verenthis',  NULL, 50000, 8000),
  (2,  'aldric_v',   1,    12000, 3500),
  (3,  'brennan_v',  1,    10000, 4200),
  (4,  'mira_v',     2,     5000, 2100),
  (5,  'toven_v',    2,     4500, 1800),
  (6,  'cessa_v',    3,     3000, 1500),
  (7,  'dorwin_v',   3,     3500, 2200),
  (8,  'elsin_v',    7,     1500, 1100),
  (9,  'pren_v',     4,     1000,  900),
  (10, 'lorn_v',     5,     1200,  750),
  -- Praxis dynasty (root = id 11)
  (11, 'praxis_king', NULL, 40000, 2000),
  (12, 'oswin_p',     11,   15000,  800),
  (13, 'faye_p',      11,   12000,  600);
`,
    floors: [
      {
        title: 'Floor I — The Family Tree',
        intro: 'Begin with a simple self-join to display each noble alongside their parent, revealing one generation of the bloodline.',
        clue: {
          label: 'Self-Join: Child and Parent',
          query: `SELECT\n  child.name  AS noble,\n  parent.name AS parent,\n  child.debt,\n  child.estate_value\nFROM nobles child\nLEFT JOIN nobles parent ON parent.id = child.parent_id\nORDER BY parent.name NULLS FIRST, child.name;`,
          desc:  'Self-join on parent_id reveals the parent-child relationship for each noble.',
        },
        hint:  'Self-join nobles AS child LEFT JOIN nobles AS parent ON parent.id = child.parent_id.',
        hints: [
          { id: 1, cost: 25, text: 'Alias nobles twice: child and parent. LEFT JOIN parent ON parent.id = child.parent_id.' },
          { id: 2, cost: 35, text: 'Rows where parent is NULL are dynasty roots. The two roots are verenthis and praxis_king.' },
          { id: 3, cost: 50, text: "The verenthis dynasty has 10 members; praxis_king has only 3. Count the rows per root to compare scale." },
        ],
      },
      {
        title: 'Floor II — The Recursive Walk',
        intro: 'Use a recursive CTE to walk the entire tree from root to leaf, tracking generation depth and the lineage path.',
        clue: {
          label: 'Recursive Dynasty Traversal',
          query: `WITH RECURSIVE lineage AS (\n  SELECT id, name, parent_id, 0 AS generation,\n         name AS path\n  FROM nobles WHERE parent_id IS NULL\n  UNION ALL\n  SELECT n.id, n.name, n.parent_id, l.generation + 1,\n         l.path || ' > ' || n.name\n  FROM nobles n\n  JOIN lineage l ON n.parent_id = l.id\n)\nSELECT name, generation, path\nFROM lineage\nORDER BY path;`,
          desc:  'Anchor on root nodes (parent_id IS NULL), recurse by joining on parent_id = lineage.id.',
        },
        hint:  'Anchor WHERE parent_id IS NULL. Recurse: JOIN nobles ON n.parent_id = l.id. Increment generation, concatenate path.',
        hints: [
          { id: 4, cost: 25, text: 'Anchor: SELECT from nobles WHERE parent_id IS NULL with generation = 0.' },
          { id: 5, cost: 35, text: "Recursive step: JOIN nobles n ON n.parent_id = l.id, increment generation, concat path with ' > ' || n.name." },
          { id: 6, cost: 50, text: "The deepest node is elsin_v or pren_v at generation 3. The praxis dynasty reaches only generation 1." },
        ],
      },
      {
        title: 'Floor III — Subtree Debt',
        intro: 'For each noble, calculate the total debt of their entire subtree — all descendants plus themselves.',
        clue: {
          label: 'Accumulate Subtree Debt',
          query: `WITH RECURSIVE subtree(root_id, member_id, debt, estate_value) AS (\n  SELECT id, id, debt, estate_value FROM nobles\n  UNION ALL\n  SELECT st.root_id, n.id, n.debt, n.estate_value\n  FROM nobles n\n  JOIN subtree st ON n.parent_id = st.member_id\n)\nSELECT\n  r.name AS dynasty_root,\n  SUM(st.debt)         AS total_debt,\n  SUM(st.estate_value) AS total_estates\nFROM subtree st\nJOIN nobles r ON r.id = st.root_id\nWHERE r.parent_id IS NULL\nGROUP BY st.root_id, r.name\nORDER BY total_debt DESC;`,
          desc:  'Each noble seeds its own subtree; the recursive step descends to children, accumulating debt.',
        },
        hint:  'Seed the recursive CTE with every noble as its own root_id. The recursive step descends via parent_id = member_id.',
        hints: [
          { id: 7, cost: 25, text: 'Anchor: SELECT id AS root_id, id AS member_id, debt, estate_value FROM nobles (no WHERE — every noble seeds its own subtree).' },
          { id: 8, cost: 35, text: 'Recursive: JOIN nobles n ON n.parent_id = st.member_id, carry root_id forward unchanged.' },
          { id: 9, cost: 50, text: "Filter WHERE r.parent_id IS NULL to show only dynasty-level totals. verenthis total_debt vastly exceeds praxis_king." },
        ],
      },
      {
        title: 'Floor IV — The Verdict',
        intro: 'Summarize each dynasty: member count, total debt, total estates, and debt-to-estate ratio. Name the cursed bloodline.',
        clue: {
          label: 'Dynasty Summary with Debt Ratio',
          query: `WITH RECURSIVE subtree(root_id, member_id, debt, estate_value) AS (\n  SELECT id, id, debt, estate_value FROM nobles\n  UNION ALL\n  SELECT st.root_id, n.id, n.debt, n.estate_value\n  FROM nobles n\n  JOIN subtree st ON n.parent_id = st.member_id\n)\nSELECT\n  r.name AS dynasty,\n  COUNT(DISTINCT st.member_id)                               AS members,\n  SUM(st.debt)                                              AS total_debt,\n  SUM(st.estate_value)                                      AS total_estates,\n  ROUND(CAST(SUM(st.debt) AS REAL) / SUM(st.estate_value) * 100, 1) AS debt_ratio_pct\nFROM subtree st\nJOIN nobles r ON r.id = st.root_id\nWHERE r.parent_id IS NULL\nGROUP BY st.root_id, r.name\nORDER BY debt_ratio_pct DESC;`,
          desc:  'Final summary: member count, totals, and debt_ratio_pct = total_debt / total_estates * 100.',
        },
        hint:  'Add COUNT(DISTINCT member_id) and ROUND(CAST(total_debt AS REAL)/total_estates*100,1) AS debt_ratio_pct to the subtree CTE query.',
        hints: [
          { id: 10, cost: 25, text: 'Reuse the subtree CTE from Floor III. Add COUNT(DISTINCT st.member_id) AS members.' },
          { id: 11, cost: 35, text: 'debt_ratio_pct = ROUND(CAST(SUM(st.debt) AS REAL) / SUM(st.estate_value) * 100, 1).' },
          { id: 12, cost: 50, text: "verenthis has 10 members, 25,050 total debt, 91,700 total estates — debt_ratio ~27%. praxis_king is ~8%. The answer is the top row." },
        ],
      },
    ],
  },

  // ── Q007 — The Hollow Witness ─────────────────────────────
  {
    id:        'q007',
    title:     'The Hollow Witness',
    rank:      'Uncommon',
    rankClass: 'text-parchment border-parchment/40 bg-parchment/10',
    diff:      3,
    lore:      "Four crimes. Multiple registered witnesses. Yet one 'witness' listed at the scene of every crime has never produced a single statement. Find the phantom who was everywhere and said nothing.",
    answer:    'null_witness',
    answerHint:"The witness name, lowercase with underscore.",
    xp:        175,
    tags:      ['EXISTS', 'NOT EXISTS', 'Correlated Subquery', 'GROUP_CONCAT', 'CTE'],
    schema: {
      crimes: [
        { col: 'id',         type: 'INTEGER', pk: true },
        { col: 'title',      type: 'TEXT' },
        { col: 'location',   type: 'TEXT' },
        { col: 'crime_date', type: 'TEXT' },
      ],
      witnesses: [
        { col: 'id',         type: 'INTEGER', pk: true },
        { col: 'name',       type: 'TEXT' },
        { col: 'district',   type: 'TEXT' },
        { col: 'registered', type: 'INTEGER' },
      ],
      testimonies: [
        { col: 'id',            type: 'INTEGER', pk: true },
        { col: 'witness_id',    type: 'INTEGER' },
        { col: 'crime_id',      type: 'INTEGER' },
        { col: 'statement',     type: 'TEXT' },
        { col: 'recorded_date', type: 'TEXT' },
      ],
      crime_witnesses: [
        { col: 'id',         type: 'INTEGER', pk: true },
        { col: 'crime_id',   type: 'INTEGER' },
        { col: 'witness_id', type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE crimes (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  crime_date TEXT NOT NULL
);
INSERT INTO crimes VALUES
  (1, 'vault_break_in',    'vault_corridor',  '1247-01-10'),
  (2, 'market_fire',       'market_quarter',  '1247-01-18'),
  (3, 'missing_shipment',  'harbor_district', '1247-02-03'),
  (4, 'poisoned_well',     'lower_ward',      '1247-02-20');

CREATE TABLE witnesses (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  registered INTEGER NOT NULL DEFAULT 1
);
INSERT INTO witnesses VALUES
  (1, 'brecken',      'market_quarter',  1),
  (2, 'null_witness', 'unknown',         1),
  (3, 'sorla',        'harbor_district', 1),
  (4, 'fenwick',      'lower_ward',      1),
  (5, 'ondra',        'vault_corridor',  1);

CREATE TABLE testimonies (
  id INTEGER PRIMARY KEY,
  witness_id INTEGER NOT NULL,
  crime_id INTEGER NOT NULL,
  statement TEXT NOT NULL,
  recorded_date TEXT NOT NULL
);
INSERT INTO testimonies VALUES
  (1, 1, 1, 'Heard a crash near the east vault door.', '1247-01-11'),
  (2, 1, 2, 'Saw smoke rising before the alarm sounded.', '1247-01-19'),
  (3, 3, 3, 'Two crates were missing from bay 7.', '1247-02-04'),
  (4, 4, 4, 'Water tasted bitter two days before the report.', '1247-02-21'),
  (5, 5, 1, 'Guard rotation changed the night before.', '1247-01-12');
-- null_witness has NO entries in testimonies

CREATE TABLE crime_witnesses (
  id INTEGER PRIMARY KEY,
  crime_id INTEGER NOT NULL,
  witness_id INTEGER NOT NULL
);
INSERT INTO crime_witnesses VALUES
  -- null_witness listed at ALL 4 crimes
  (1,  1, 2),
  (2,  2, 2),
  (3,  3, 2),
  (4,  4, 2),
  -- other witnesses at some crimes
  (5,  1, 1),
  (6,  2, 1),
  (7,  3, 3),
  (8,  4, 4),
  (9,  1, 5);
`,
    floors: [
      {
        title: 'Floor I — The Witness Registry',
        intro: 'Find all witnesses who appear in the crime_witnesses table — those officially linked to at least one crime.',
        clue: {
          label: 'Witnesses Linked to Crimes',
          query: `SELECT DISTINCT w.name, w.district\nFROM witnesses w\nWHERE w.id IN (\n  SELECT witness_id FROM crime_witnesses\n)\nORDER BY w.name;`,
          desc:  'IN subquery finds witnesses who appear in the crime_witnesses linking table.',
        },
        hint:  'Use WHERE w.id IN (SELECT witness_id FROM crime_witnesses) to filter witnesses linked to crimes.',
        hints: [
          { id: 1, cost: 25, text: 'Use an IN subquery: WHERE w.id IN (SELECT witness_id FROM crime_witnesses).' },
          { id: 2, cost: 35, text: 'SELECT DISTINCT prevents duplicate rows if a witness appears at multiple crimes.' },
          { id: 3, cost: 50, text: "All 5 witnesses appear in crime_witnesses, but one appears at all 4 crimes. That's the one to watch." },
        ],
      },
      {
        title: 'Floor II — The Testified',
        intro: 'Now filter to witnesses who have produced at least one testimony using EXISTS.',
        clue: {
          label: 'Witnesses WITH Testimonies',
          query: `SELECT w.name, w.district\nFROM witnesses w\nWHERE EXISTS (\n  SELECT 1 FROM testimonies t\n  WHERE t.witness_id = w.id\n)\nORDER BY w.name;`,
          desc:  'EXISTS correlated subquery — only returns witnesses who have at least one row in testimonies.',
        },
        hint:  'WHERE EXISTS (SELECT 1 FROM testimonies t WHERE t.witness_id = w.id)',
        hints: [
          { id: 4, cost: 25, text: 'EXISTS (SELECT 1 FROM testimonies t WHERE t.witness_id = w.id) is a correlated subquery — evaluated per row.' },
          { id: 5, cost: 35, text: 'EXISTS returns TRUE as soon as one matching row is found — it stops searching early (efficient).' },
          { id: 6, cost: 50, text: "4 of the 5 witnesses have at least one testimony. One is notably absent from this list." },
        ],
      },
      {
        title: 'Floor III — The Silent Ones',
        intro: 'Invert the EXISTS: find witnesses linked to crimes but with NO testimony on record.',
        clue: {
          label: 'Witnesses Without Testimonies',
          query: `SELECT w.name, w.district\nFROM witnesses w\nWHERE w.id IN (SELECT witness_id FROM crime_witnesses)\n  AND NOT EXISTS (\n    SELECT 1 FROM testimonies t\n    WHERE t.witness_id = w.id\n  )\nORDER BY w.name;`,
          desc:  'Combined IN + NOT EXISTS: linked to crimes, but has zero testimony entries.',
        },
        hint:  'Combine: IN (crime_witnesses) AND NOT EXISTS (testimonies). The AND filters to crime-linked witnesses only.',
        hints: [
          { id: 7, cost: 25, text: "Add AND NOT EXISTS (SELECT 1 FROM testimonies t WHERE t.witness_id = w.id) after the IN filter." },
          { id: 8, cost: 35, text: 'NOT EXISTS returns TRUE when no matching row is found — inverts the EXISTS logic.' },
          { id: 9, cost: 50, text: "Exactly one witness appears: they're in crime_witnesses but have zero testimony rows. Read their name." },
        ],
      },
      {
        title: 'Floor IV — The Verdict',
        intro: "Confirm the phantom: build two CTEs — ghost_witnesses (no testimony) and their crime list — to produce a full report.",
        clue: {
          label: 'Ghost Witness Full Report',
          query: `WITH ghost_witnesses AS (\n  SELECT w.id, w.name, w.district\n  FROM witnesses w\n  WHERE w.id IN (SELECT witness_id FROM crime_witnesses)\n    AND NOT EXISTS (\n      SELECT 1 FROM testimonies t WHERE t.witness_id = w.id\n    )\n),\nghost_crimes AS (\n  SELECT\n    gw.name,\n    COUNT(cw.crime_id)          AS crimes_linked,\n    GROUP_CONCAT(c.title, ', ') AS crime_list\n  FROM ghost_witnesses gw\n  JOIN crime_witnesses cw ON cw.witness_id = gw.id\n  JOIN crimes c           ON c.id = cw.crime_id\n  GROUP BY gw.id, gw.name\n)\nSELECT name, crimes_linked, crime_list\nFROM ghost_crimes\nORDER BY crimes_linked DESC;`,
          desc:  'ghost_witnesses CTE finds the silent witness; ghost_crimes counts and lists their linked crimes.',
        },
        hint:  'Two CTEs: ghost_witnesses (NOT EXISTS filter), then ghost_crimes (JOIN crime_witnesses + crimes, GROUP_CONCAT).',
        hints: [
          { id: 10, cost: 25, text: 'CTE ghost_witnesses: reuse the NOT EXISTS filter from Floor III.' },
          { id: 11, cost: 35, text: 'CTE ghost_crimes: JOIN ghost_witnesses → crime_witnesses → crimes. GROUP BY name, use GROUP_CONCAT(c.title).' },
          { id: 12, cost: 50, text: "null_witness appears linked to all 4 crimes with zero testimony. The name column is your answer." },
        ],
      },
    ],
  },

  // ── Q008 — The Counterfeit Ledger ─────────────────────────
  {
    id:        'q008',
    title:     'The Counterfeit Ledger',
    rank:      'Rare',
    rankClass: 'text-rune border-rune/40 bg-rune/10',
    diff:      3,
    lore:      "The Royal Mint Inspectorate has found a discrepancy between coins struck and coins reported. Someone is skimming from production. Pivot the monthly ledger to expose the pattern — and name the mint hiding the shortfall.",
    answer:    'thornwall',
    answerHint:"The mint name, lowercase.",
    xp:        200,
    tags:      ['CASE WHEN', 'PIVOT', 'GROUP BY', 'CTE', 'Discrepancy Analysis'],
    schema: {
      mints: [
        { col: 'id',       type: 'INTEGER', pk: true },
        { col: 'name',     type: 'TEXT' },
        { col: 'district', type: 'TEXT' },
        { col: 'licensed', type: 'INTEGER' },
      ],
      production: [
        { col: 'id',              type: 'INTEGER', pk: true },
        { col: 'mint_id',         type: 'INTEGER' },
        { col: 'month',           type: 'TEXT' },
        { col: 'coins_struck',    type: 'INTEGER' },
        { col: 'coins_reported',  type: 'INTEGER' },
      ],
      inspections: [
        { col: 'id',              type: 'INTEGER', pk: true },
        { col: 'mint_id',         type: 'INTEGER' },
        { col: 'inspection_date', type: 'TEXT' },
        { col: 'coins_counted',   type: 'INTEGER' },
        { col: 'passed',          type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE mints (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  licensed INTEGER NOT NULL DEFAULT 1
);
INSERT INTO mints VALUES
  (1, 'thornwall', 'lower_ward',      1),
  (2, 'ironpress', 'harbor_district', 1),
  (3, 'goldmark',  'upper_city',      1),
  (4, 'ashforge',  'market_quarter',  1);

CREATE TABLE production (
  id INTEGER PRIMARY KEY,
  mint_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  coins_struck INTEGER NOT NULL,
  coins_reported INTEGER NOT NULL
);
INSERT INTO production VALUES
  -- thornwall: consistently under-reports by ~300/month
  (1,  1, '1247-01', 1200,  900),
  (2,  1, '1247-02', 1350, 1000),
  (3,  1, '1247-03', 1100,  800),
  -- ironpress: honest reporting
  (4,  2, '1247-01',  800,  800),
  (5,  2, '1247-02',  950,  950),
  (6,  2, '1247-03',  700,  700),
  -- goldmark: honest reporting
  (7,  3, '1247-01', 1100, 1100),
  (8,  3, '1247-02', 1200, 1200),
  (9,  3, '1247-03',  900,  900),
  -- ashforge: honest reporting
  (10, 4, '1247-01',  600,  600),
  (11, 4, '1247-02',  700,  700),
  (12, 4, '1247-03',  550,  550);

CREATE TABLE inspections (
  id INTEGER PRIMARY KEY,
  mint_id INTEGER NOT NULL,
  inspection_date TEXT NOT NULL,
  coins_counted INTEGER NOT NULL,
  passed INTEGER NOT NULL DEFAULT 1
);
INSERT INTO inspections VALUES
  (1, 1, '1247-03-20', 3650, 0),
  (2, 2, '1247-03-20', 2450, 1),
  (3, 3, '1247-03-20', 3200, 1),
  (4, 4, '1247-03-20', 1850, 1);
`,
    floors: [
      {
        title: 'Floor I — The Totals',
        intro: 'Start with a basic GROUP BY to compare total coins struck versus total coins reported per mint.',
        clue: {
          label: 'Struck vs Reported Totals',
          query: `SELECT\n  m.name,\n  SUM(p.coins_struck)   AS total_struck,\n  SUM(p.coins_reported) AS total_reported,\n  SUM(p.coins_struck) - SUM(p.coins_reported) AS total_gap\nFROM production p\nJOIN mints m ON m.id = p.mint_id\nGROUP BY p.mint_id, m.name\nORDER BY total_gap DESC;`,
          desc:  'Simple GROUP BY aggregates struck and reported totals; difference reveals the gap.',
        },
        hint:  'GROUP BY mint_id, SELECT SUM(coins_struck) and SUM(coins_reported). Subtract to get the gap.',
        hints: [
          { id: 1, cost: 25, text: 'JOIN production and mints on mint_id. GROUP BY p.mint_id, m.name.' },
          { id: 2, cost: 35, text: 'SUM(coins_struck) - SUM(coins_reported) AS total_gap reveals who is hiding coins.' },
          { id: 3, cost: 50, text: "thornwall's total_gap is 950 — the only mint with a non-zero gap." },
        ],
      },
      {
        title: 'Floor II — The Monthly Pivot',
        intro: "Pivot the production table to show struck and reported columns for each month side by side.",
        clue: {
          label: 'Monthly PIVOT: Struck vs Reported',
          query: `SELECT\n  m.name,\n  SUM(CASE WHEN p.month = '1247-01' THEN p.coins_struck   ELSE 0 END) AS jan_struck,\n  SUM(CASE WHEN p.month = '1247-01' THEN p.coins_reported ELSE 0 END) AS jan_reported,\n  SUM(CASE WHEN p.month = '1247-02' THEN p.coins_struck   ELSE 0 END) AS feb_struck,\n  SUM(CASE WHEN p.month = '1247-02' THEN p.coins_reported ELSE 0 END) AS feb_reported,\n  SUM(CASE WHEN p.month = '1247-03' THEN p.coins_struck   ELSE 0 END) AS mar_struck,\n  SUM(CASE WHEN p.month = '1247-03' THEN p.coins_reported ELSE 0 END) AS mar_reported\nFROM production p\nJOIN mints m ON m.id = p.mint_id\nGROUP BY p.mint_id, m.name\nORDER BY m.name;`,
          desc:  'PIVOT: six CASE WHEN columns give struck and reported counts per month per mint.',
        },
        hint:  "Use SUM(CASE WHEN month = '1247-01' THEN coins_struck ELSE 0 END) AS jan_struck for each month/column combination.",
        hints: [
          { id: 4, cost: 25, text: "Six CASE WHEN expressions: for each month ('1247-01', '1247-02', '1247-03') × (coins_struck, coins_reported)." },
          { id: 5, cost: 35, text: 'GROUP BY mint_id, m.name — each row represents one mint across all three months.' },
          { id: 6, cost: 50, text: "thornwall: jan_struck=1200 vs jan_reported=900, feb_struck=1350 vs feb_reported=1000. The pattern is obvious." },
        ],
      },
      {
        title: 'Floor III — The Discrepancy Pivot',
        intro: 'Now pivot the discrepancy itself — (coins_struck - coins_reported) per month — to show the skimming pattern month by month.',
        clue: {
          label: 'Discrepancy PIVOT by Month',
          query: `SELECT\n  m.name,\n  SUM(CASE WHEN p.month = '1247-01' THEN p.coins_struck - p.coins_reported ELSE 0 END) AS jan_gap,\n  SUM(CASE WHEN p.month = '1247-02' THEN p.coins_struck - p.coins_reported ELSE 0 END) AS feb_gap,\n  SUM(CASE WHEN p.month = '1247-03' THEN p.coins_struck - p.coins_reported ELSE 0 END) AS mar_gap,\n  SUM(p.coins_struck - p.coins_reported) AS total_gap\nFROM production p\nJOIN mints m ON m.id = p.mint_id\nGROUP BY p.mint_id, m.name\nORDER BY total_gap DESC;`,
          desc:  'Discrepancy PIVOT: each CASE WHEN computes (coins_struck - coins_reported) for its month.',
        },
        hint:  'Inside each CASE WHEN, compute coins_struck - coins_reported. One mint shows consistent positive gaps every month.',
        hints: [
          { id: 7, cost: 25, text: 'CASE WHEN month = \'1247-01\' THEN coins_struck - coins_reported ELSE 0 END AS jan_gap.' },
          { id: 8, cost: 35, text: 'ORDER BY total_gap DESC — the mint at the top is the culprit.' },
          { id: 9, cost: 50, text: "thornwall: jan_gap=300, feb_gap=350, mar_gap=300. Every month. Total 950 coins hidden." },
        ],
      },
      {
        title: 'Floor IV — The Verdict',
        intro: "Compare total reported against physical inspection counts to confirm the skimming. Name the mint whose reported total doesn't match what the inspectors found.",
        clue: {
          label: 'Reported vs Inspected CTE',
          query: `WITH monthly_pivot AS (\n  SELECT\n    mint_id,\n    SUM(coins_reported) AS total_reported\n  FROM production\n  GROUP BY mint_id\n),\ninspection_check AS (\n  SELECT\n    m.name,\n    mp.total_reported,\n    i.coins_counted,\n    i.coins_counted - mp.total_reported AS inspection_gap,\n    i.passed\n  FROM monthly_pivot mp\n  JOIN mints m        ON m.id = mp.mint_id\n  JOIN inspections i  ON i.mint_id = mp.mint_id\n)\nSELECT name, total_reported, coins_counted, inspection_gap\nFROM inspection_check\nWHERE inspection_gap > 0\nORDER BY inspection_gap DESC;`,
          desc:  'monthly_pivot sums reported; inspection_check joins to inspections and computes the gap between physical count and reported total.',
        },
        hint:  'CTE monthly_pivot: SUM(coins_reported) per mint. Join to inspections. inspection_gap = coins_counted - total_reported.',
        hints: [
          { id: 10, cost: 25, text: 'CTE monthly_pivot: SELECT mint_id, SUM(coins_reported) AS total_reported FROM production GROUP BY mint_id.' },
          { id: 11, cost: 35, text: 'JOIN inspections on mint_id. inspection_gap = i.coins_counted - mp.total_reported.' },
          { id: 12, cost: 50, text: "thornwall reported 2,700 but inspectors counted 3,650 — a gap of 950. Filter WHERE inspection_gap > 0 for the answer." },
        ],
      },
    ],
  },

  // ── Q009 — The Smuggler's Cipher ──────────────────────────
  {
    id:        'q009',
    title:     "The Smuggler's Cipher",
    rank:      'Uncommon',
    rankClass: 'text-parchment border-parchment/40 bg-parchment/10',
    diff:      2,
    lore:      "Contraband is moving through an unregistered port that loops between the same two docks to avoid guild checkpoints. A self-join reveals the hub of this circular network. Find the port at the center of the web.",
    answer:    'port_dusk',
    answerHint:"The port name, lowercase with underscore.",
    xp:        150,
    tags:      ['Self-Join', 'Circular Route', 'CTE', 'UNION', 'GROUP BY'],
    schema: {
      ports: [
        { col: 'id',              type: 'INTEGER', pk: true },
        { col: 'name',            type: 'TEXT' },
        { col: 'region',          type: 'TEXT' },
        { col: 'guild_controlled', type: 'INTEGER' },
      ],
      routes: [
        { col: 'id',            type: 'INTEGER', pk: true },
        { col: 'from_port_id',  type: 'INTEGER' },
        { col: 'to_port_id',    type: 'INTEGER' },
        { col: 'distance_leagues', type: 'INTEGER' },
        { col: 'tariff_rate',   type: 'REAL' },
        { col: 'registered',    type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE ports (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  guild_controlled INTEGER NOT NULL DEFAULT 1
);
INSERT INTO ports VALUES
  (1, 'port_dusk',  'southern_coast', 0),
  (2, 'port_ash',   'southern_coast', 0),
  (3, 'port_mire',  'western_inlet',  1),
  (4, 'port_haven', 'northern_bay',   1),
  (5, 'port_crest', 'northern_bay',   1),
  (6, 'port_vale',  'western_inlet',  1);

CREATE TABLE routes (
  id INTEGER PRIMARY KEY,
  from_port_id INTEGER NOT NULL,
  to_port_id INTEGER NOT NULL,
  distance_leagues INTEGER NOT NULL,
  tariff_rate REAL NOT NULL DEFAULT 0.0,
  registered INTEGER NOT NULL DEFAULT 1
);
INSERT INTO routes VALUES
  -- unregistered circular routes through port_dusk
  (1,  1, 3, 20, 0.0, 0),
  (2,  3, 1, 20, 0.0, 0),
  (3,  1, 2, 15, 0.0, 0),
  (4,  2, 1, 15, 0.0, 0),
  -- registered legitimate routes
  (5,  4, 5, 30, 0.05, 1),
  (6,  5, 4, 30, 0.05, 1),
  (7,  3, 6, 25, 0.04, 1),
  (8,  6, 3, 25, 0.04, 1),
  (9,  4, 6, 40, 0.06, 1),
  -- port_ash appears in only 2 unregistered routes
  (10, 2, 3, 18, 0.0, 0);
`,
    floors: [
      {
        title: 'Floor I — The Route Map',
        intro: 'Self-join the routes table to ports to display full route names — from port to port — with registration status.',
        clue: {
          label: 'Full Route Names via Self-Join',
          query: `SELECT\n  r.id AS route_id,\n  p1.name AS from_port,\n  p2.name AS to_port,\n  r.distance_leagues,\n  r.registered\nFROM routes r\nJOIN ports p1 ON p1.id = r.from_port_id\nJOIN ports p2 ON p2.id = r.to_port_id\nORDER BY r.registered, r.id;`,
          desc:  'Two JOINs to ports — one for the origin, one for the destination — display the full route.',
        },
        hint:  'JOIN routes to ports twice: once for from_port_id (alias p1) and once for to_port_id (alias p2).',
        hints: [
          { id: 1, cost: 25, text: 'JOIN ports p1 ON p1.id = r.from_port_id — JOIN ports p2 ON p2.id = r.to_port_id.' },
          { id: 2, cost: 35, text: 'SELECT p1.name AS from_port, p2.name AS to_port to get human-readable route names.' },
          { id: 3, cost: 50, text: "Filter WHERE r.registered = 0 to isolate the smuggling routes. port_dusk appears frequently." },
        ],
      },
      {
        title: 'Floor II — Suspicious Ports',
        intro: "Filter to unregistered routes and flag any non-guild-controlled ports as 'suspicious'.",
        clue: {
          label: 'Unregistered Routes with Suspicious Flags',
          query: `SELECT\n  r.id AS route_id,\n  p1.name AS from_port,\n  p2.name AS to_port,\n  CASE WHEN p1.guild_controlled = 0 THEN 'suspicious' ELSE 'clear' END AS from_status,\n  CASE WHEN p2.guild_controlled = 0 THEN 'suspicious' ELSE 'clear' END AS to_status\nFROM routes r\nJOIN ports p1 ON p1.id = r.from_port_id\nJOIN ports p2 ON p2.id = r.to_port_id\nWHERE r.registered = 0\nORDER BY r.id;`,
          desc:  "WHERE registered = 0 narrows to smuggling routes; CASE WHEN flags guild_controlled = 0 ports as 'suspicious'.",
        },
        hint:  "Add WHERE r.registered = 0 and CASE WHEN guild_controlled = 0 THEN 'suspicious' ELSE 'clear' END for each port.",
        hints: [
          { id: 4, cost: 25, text: "Add WHERE r.registered = 0 to filter unregistered routes." },
          { id: 5, cost: 35, text: "CASE WHEN p1.guild_controlled = 0 THEN 'suspicious' ELSE 'clear' END AS from_status." },
          { id: 6, cost: 50, text: "port_dusk and port_ash are both 'suspicious' (guild_controlled=0). port_dusk appears in every unregistered route." },
        ],
      },
      {
        title: 'Floor III — The Circular Loop',
        intro: 'Find route pairs where A→B and B→A both exist as unregistered routes — the hallmark of a smuggling circuit.',
        clue: {
          label: 'Circular Unregistered Pairs',
          query: `SELECT\n  p1.name AS port_a,\n  p2.name AS port_b,\n  r1.distance_leagues\nFROM routes r1\nJOIN routes r2\n  ON r2.from_port_id = r1.to_port_id\n AND r2.to_port_id   = r1.from_port_id\nJOIN ports p1 ON p1.id = r1.from_port_id\nJOIN ports p2 ON p2.id = r1.to_port_id\nWHERE r1.registered = 0\n  AND r2.registered = 0\n  AND r1.from_port_id < r1.to_port_id\nORDER BY port_a;`,
          desc:  'Self-join routes r1 JOIN r2 where r2 reverses r1 — both unregistered. The AND < eliminates duplicates.',
        },
        hint:  'JOIN routes r1 and r2 where r2.from = r1.to AND r2.to = r1.from, both WHERE registered = 0.',
        hints: [
          { id: 7, cost: 25, text: 'JOIN routes r2 ON r2.from_port_id = r1.to_port_id AND r2.to_port_id = r1.from_port_id.' },
          { id: 8, cost: 35, text: "Both WHERE r1.registered = 0 AND r2.registered = 0 — both directions must be unregistered." },
          { id: 9, cost: 50, text: "Two circular pairs: dusk↔mire and dusk↔ash. port_dusk appears in both — it's the hub." },
        ],
      },
      {
        title: 'Floor IV — The Verdict',
        intro: 'Count how many unregistered routes each port appears in (as either origin or destination). The port with the most is the smuggling hub.',
        clue: {
          label: 'Port Activity in Unregistered Routes',
          query: `WITH unregistered AS (\n  SELECT from_port_id AS port_id FROM routes WHERE registered = 0\n  UNION ALL\n  SELECT to_port_id   AS port_id FROM routes WHERE registered = 0\n),\nport_activity AS (\n  SELECT p.name, COUNT(*) AS unregistered_routes\n  FROM unregistered u\n  JOIN ports p ON p.id = u.port_id\n  GROUP BY u.port_id, p.name\n)\nSELECT name, unregistered_routes\nFROM port_activity\nORDER BY unregistered_routes DESC\nLIMIT 5;`,
          desc:  'UNION ALL both directions into one port list, then GROUP BY port and count appearances.',
        },
        hint:  'UNION ALL from_port_id and to_port_id from unregistered routes into one CTE, then GROUP BY port and COUNT.',
        hints: [
          { id: 10, cost: 25, text: 'CTE unregistered: UNION ALL of from_port_id and to_port_id WHERE registered = 0.' },
          { id: 11, cost: 35, text: 'JOIN to ports to get names. GROUP BY port_id, COUNT(*) AS unregistered_routes.' },
          { id: 12, cost: 50, text: "port_dusk appears 4 times (most of any port). It's the #1 result — that's your answer." },
        ],
      },
    ],
  },

  // ── Q010 — The Grand Conspiracy ───────────────────────────
  {
    id:        'q010',
    title:     'The Grand Conspiracy',
    rank:      'Legendary',
    rankClass: 'text-gold border-gold/40 bg-gold/10',
    diff:      5,
    lore:      'The investigation has traced ten separate crimes back to a single coordinated network. Cells within cells. Money flowing in patterns only a window function can reveal. One name appears at every node. Find the architect.',
    answer:    'malevar',
    answerHint:"The conspirator's name, lowercase.",
    xp:        300,
    tags:      ['Recursive CTE', 'Window Functions', 'NOT EXISTS', 'PIVOT', 'CASE WHEN', 'RANK'],
    schema: {
      conspirators: [
        { col: 'id',      type: 'INTEGER', pk: true },
        { col: 'name',    type: 'TEXT' },
        { col: 'rank',    type: 'TEXT' },
        { col: 'cell_id', type: 'INTEGER' },
      ],
      cells: [
        { col: 'id',        type: 'INTEGER', pk: true },
        { col: 'name',      type: 'TEXT' },
        { col: 'leader_id', type: 'INTEGER' },
      ],
      wire_transfers: [
        { col: 'id',      type: 'INTEGER', pk: true },
        { col: 'from_id', type: 'INTEGER' },
        { col: 'to_id',   type: 'INTEGER' },
        { col: 'amount',  type: 'INTEGER' },
        { col: 'tx_date', type: 'TEXT' },
        { col: 'flagged', type: 'INTEGER' },
      ],
      alibis: [
        { col: 'id',             type: 'INTEGER', pk: true },
        { col: 'conspirator_id', type: 'INTEGER' },
        { col: 'alibi_date',     type: 'TEXT' },
        { col: 'location',       type: 'TEXT' },
        { col: 'confirmed',      type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE cells (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id INTEGER
);
INSERT INTO cells VALUES
  (1, 'shadow_council', 1),
  (2, 'iron_fist',      1),
  (3, 'silver_tongue',  1);

CREATE TABLE conspirators (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  rank TEXT NOT NULL,
  cell_id INTEGER NOT NULL
);
INSERT INTO conspirators VALUES
  (1, 'malevar', 'architect', 1),
  (2, 'vorn',    'enforcer',  1),
  (3, 'sela',    'courier',   2),
  (4, 'drix',    'courier',   2),
  (5, 'cass',    'informant', 3);

CREATE TABLE wire_transfers (
  id INTEGER PRIMARY KEY,
  from_id INTEGER NOT NULL,
  to_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  tx_date TEXT NOT NULL,
  flagged INTEGER NOT NULL DEFAULT 0
);
INSERT INTO wire_transfers VALUES
  (1,  1, 2, 5000, '1247-01-05', 1),
  (2,  1, 3, 3000, '1247-01-12', 1),
  (3,  1, 4, 2500, '1247-02-03', 1),
  (4,  1, 5, 1800, '1247-02-15', 1),
  (5,  2, 3, 1200, '1247-01-08', 0),
  (6,  2, 4,  900, '1247-01-20', 0),
  (7,  3, 5,  600, '1247-02-10', 0),
  (8,  1, 2, 4000, '1247-03-01', 1),
  (9,  1, 5, 2200, '1247-03-18', 1),
  (10, 4, 5,  400, '1247-03-05', 0);

CREATE TABLE alibis (
  id INTEGER PRIMARY KEY,
  conspirator_id INTEGER NOT NULL,
  alibi_date TEXT NOT NULL,
  location TEXT NOT NULL,
  confirmed INTEGER NOT NULL DEFAULT 0
);
INSERT INTO alibis VALUES
  -- malevar has NO confirmed alibis on flagged dates
  (1, 1, '1247-01-05', 'claimed_home', 0),
  (2, 1, '1247-02-03', 'claimed_home', 0),
  -- vorn: one confirmed, others not
  (3, 2, '1247-01-08', 'guild_hall',   1),
  (4, 2, '1247-01-20', 'claimed_home', 0),
  -- sela: confirmed
  (5, 3, '1247-01-12', 'market_stall', 1),
  -- drix: confirmed
  (6, 4, '1247-02-03', 'temple',       1),
  -- cass: confirmed
  (7, 5, '1247-02-15', 'inn',          1);
`,
    floors: [
      {
        title: 'Floor I — The Cell Hierarchy',
        intro: 'The cells reference a leader_id that points back to a conspirator. Use a recursive CTE to traverse the chain of command from the top down.',
        clue: {
          label: 'Recursive Cell Hierarchy',
          query: `WITH RECURSIVE cell_hierarchy AS (\n  SELECT\n    c.id AS cell_id,\n    c.name AS cell_name,\n    c.leader_id,\n    con.name AS leader_name,\n    0 AS depth\n  FROM cells c\n  JOIN conspirators con ON con.id = c.leader_id\n  WHERE c.leader_id = (\n    SELECT MIN(leader_id) FROM cells\n  )\n  UNION ALL\n  SELECT\n    c2.id, c2.name, c2.leader_id,\n    con2.name,\n    ch.depth + 1\n  FROM cells c2\n  JOIN conspirators con2 ON con2.id = c2.leader_id\n  JOIN cell_hierarchy ch  ON c2.leader_id = ch.leader_id\n  WHERE c2.id != ch.cell_id\n)\nSELECT cell_name, leader_name, depth\nFROM cell_hierarchy\nORDER BY depth, cell_name;`,
          desc:  'Recursive CTE anchored on the root leader traverses all cells in the command chain.',
        },
        hint:  'All three cells share the same leader_id (=1, malevar). Anchor the CTE on leader_id = (SELECT MIN(leader_id) FROM cells).',
        hints: [
          { id: 1, cost: 25, text: "All cells share leader_id = 1. Anchor: WHERE c.leader_id = (SELECT MIN(leader_id) FROM cells)." },
          { id: 2, cost: 35, text: 'JOIN conspirators on c.leader_id to get the leader name. Depth starts at 0 for the anchor.' },
          { id: 3, cost: 50, text: "All three cells (shadow_council, iron_fist, silver_tongue) list malevar (id=1) as leader. He controls everything." },
        ],
      },
      {
        title: 'Floor II — Follow the Money',
        intro: "Use a window function to sum each conspirator's total transfers sent and RANK them to find who moved the most money.",
        clue: {
          label: 'Transfer Rank by Amount Sent',
          query: `WITH transfer_totals AS (\n  SELECT\n    con.name,\n    SUM(wt.amount) AS total_sent,\n    RANK() OVER (ORDER BY SUM(wt.amount) DESC) AS transfer_rank\n  FROM wire_transfers wt\n  JOIN conspirators con ON con.id = wt.from_id\n  GROUP BY wt.from_id, con.name\n)\nSELECT name, total_sent, transfer_rank\nFROM transfer_totals\nORDER BY transfer_rank;`,
          desc:  'CTE with GROUP BY computes total_sent per conspirator; RANK() OVER orders by total descending.',
        },
        hint:  'GROUP BY from_id to get totals, then apply RANK() OVER (ORDER BY SUM(amount) DESC). Wrap in a CTE.',
        hints: [
          { id: 4, cost: 25, text: 'GROUP BY wt.from_id, con.name — SUM(wt.amount) AS total_sent. This aggregates per sender.' },
          { id: 5, cost: 35, text: 'RANK() OVER (ORDER BY SUM(wt.amount) DESC) — apply after GROUP BY by wrapping in a CTE.' },
          { id: 6, cost: 50, text: "malevar sent 18,500 total — rank #1 by a large margin. vorn is #2 at 2,100." },
        ],
      },
      {
        title: 'Floor III — No Alibi',
        intro: 'Find conspirators who have NO confirmed alibi on any date when flagged wire transfers occurred.',
        clue: {
          label: 'Conspirators Without Confirmed Alibis on Flagged Dates',
          query: `SELECT con.name\nFROM conspirators con\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM alibis a\n  JOIN wire_transfers wt\n    ON wt.tx_date = a.alibi_date\n   AND wt.flagged = 1\n  WHERE a.conspirator_id = con.id\n    AND a.confirmed = 1\n)\nORDER BY con.name;`,
          desc:  'NOT EXISTS correlated subquery: returns conspirators who have zero confirmed alibis matching any flagged transfer date.',
        },
        hint:  'NOT EXISTS (SELECT 1 FROM alibis a JOIN wire_transfers wt ON wt.tx_date = a.alibi_date WHERE a.confirmed = 1 AND wt.flagged = 1 AND a.conspirator_id = con.id).',
        hints: [
          { id: 7, cost: 25, text: 'Correlated NOT EXISTS: join alibis to wire_transfers on alibi_date = tx_date where flagged = 1.' },
          { id: 8, cost: 35, text: 'The WHERE inside NOT EXISTS must include a.conspirator_id = con.id AND a.confirmed = 1.' },
          { id: 9, cost: 50, text: "Only malevar and vorn appear — malevar's alibis are all unconfirmed; vorn has one confirmed but not on all flagged dates." },
        ],
      },
      {
        title: 'Floor IV — The Verdict',
        intro: "Assemble the grand CTE: cell hierarchy, transfer rank, no-alibi list, and monthly pivot. The architect is the conspirator who leads all cells, tops the money rank, and has no confirmed alibi.",
        clue: {
          label: 'Grand Conspiracy CTE',
          query: `WITH transfer_totals AS (\n  SELECT\n    con.id AS con_id,\n    con.name,\n    SUM(wt.amount) AS total_sent,\n    RANK() OVER (ORDER BY SUM(wt.amount) DESC) AS transfer_rank\n  FROM wire_transfers wt\n  JOIN conspirators con ON con.id = wt.from_id\n  GROUP BY wt.from_id, con.name\n),\nno_alibi AS (\n  SELECT con.id AS con_id, con.name\n  FROM conspirators con\n  WHERE NOT EXISTS (\n    SELECT 1 FROM alibis a\n    JOIN wire_transfers wt ON wt.tx_date = a.alibi_date AND wt.flagged = 1\n    WHERE a.conspirator_id = con.id AND a.confirmed = 1\n  )\n),\nmonthly_pivot AS (\n  SELECT\n    from_id AS con_id,\n    SUM(CASE WHEN tx_date LIKE '1247-01%' THEN amount ELSE 0 END) AS jan_sent,\n    SUM(CASE WHEN tx_date LIKE '1247-02%' THEN amount ELSE 0 END) AS feb_sent,\n    SUM(CASE WHEN tx_date LIKE '1247-03%' THEN amount ELSE 0 END) AS mar_sent\n  FROM wire_transfers\n  GROUP BY from_id\n)\nSELECT\n  tt.name,\n  tt.total_sent,\n  tt.transfer_rank,\n  mp.jan_sent,\n  mp.feb_sent,\n  mp.mar_sent\nFROM transfer_totals tt\nJOIN no_alibi     na ON na.con_id = tt.con_id\nJOIN monthly_pivot mp ON mp.con_id = tt.con_id\nWHERE tt.transfer_rank = 1\nORDER BY tt.total_sent DESC;`,
          desc:  'Four CTEs combined: transfer rank, no-alibi filter, monthly pivot — only the architect survives all filters.',
        },
        hint:  'Chain: transfer_totals (RANK), no_alibi (NOT EXISTS), monthly_pivot (CASE WHEN LIKE). JOIN all three and filter WHERE transfer_rank = 1.',
        hints: [
          { id: 10, cost: 25, text: 'Build transfer_totals (with RANK), no_alibi (NOT EXISTS), and monthly_pivot (CASE WHEN tx_date LIKE) as separate CTEs.' },
          { id: 11, cost: 35, text: 'JOIN all three CTEs on con_id. The JOIN to no_alibi acts as a filter — only conspirators with no confirmed alibi survive.' },
          { id: 12, cost: 50, text: "malevar is the only conspirator who: is transfer_rank=1, has no confirmed alibi, and sent money in all 3 months. That's your answer." },
        ],
      },
    ],
  },
]

export const QUESTS_MAP: Record<string, Quest> = Object.fromEntries(
  QUESTS.map(q => [q.id, q])
)
