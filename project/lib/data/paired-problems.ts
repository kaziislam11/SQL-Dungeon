// ─────────────────────────────────────────────────────────────
// lib/data/paired-problems.ts
// Paired Navigator/Driver collaborative SQL problems.
// Seed SQL targets SQLite (sql.js). Dates use '1247-XX-XX' format.
// ─────────────────────────────────────────────────────────────

export interface PairedProblem {
  id: string
  title: string
  scenario: string
  navigatorRole: string
  driverRole: string
  seed: string
  schema: Record<string, { col: string; type: string; pk?: boolean }[]>
  requirements: string[]
  starterQueries: { label: string; query: string }[]
  deliverables: string[]
  tags: string[]
}

export interface TrialContract extends PairedProblem {
  mentor: 'Kazi' | 'Azm'
  session: number
  leadRole: 'Navigator' | 'Driver'
  mentorFocus: string
  outputFocus: string
  sourceProblemId: string
}

export const PAIRED_PROBLEMS: PairedProblem[] = [
  // ── PC001 — The Inventory Oracle ──────────────────────────
  {
    id: 'pc001',
    title: 'The Inventory Oracle',
    scenario:
      'The guild warehouse is bleeding gold. Some items sell out in days; others rot on shelves for months. Analyze sales velocity and recommend which items to restock immediately — and which to liquidate before they become a total loss.',
    navigatorRole:
      'Describe which metrics matter: sell-through rate, days-of-stock, margin. Verbally direct the query logic, catch edge cases (zero sales, zero stock), and propose the ranking criteria before the Driver writes a single line.',
    driverRole:
      'Translate the Navigator\'s strategy into CTEs that calculate 30-day sales velocity, projected days-of-stock, and margin flags. Run queries iteratively and report back what the results reveal.',
    schema: {
      products: [
        { col: 'id',         type: 'INTEGER', pk: true },
        { col: 'name',       type: 'TEXT' },
        { col: 'category',   type: 'TEXT' },
        { col: 'unit_cost',  type: 'INTEGER' },
        { col: 'unit_price', type: 'INTEGER' },
      ],
      stock: [
        { col: 'id',                type: 'INTEGER', pk: true },
        { col: 'product_id',        type: 'INTEGER' },
        { col: 'quantity_on_hand',  type: 'INTEGER' },
        { col: 'restock_threshold', type: 'INTEGER' },
      ],
      sales_history: [
        { col: 'id',         type: 'INTEGER', pk: true },
        { col: 'product_id', type: 'INTEGER' },
        { col: 'qty_sold',   type: 'INTEGER' },
        { col: 'sale_date',  type: 'TEXT' },
      ],
    },
    seed: `
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_cost INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);
INSERT INTO products VALUES
  (1,  'iron_ingot',      'metals',    40,  55),
  (2,  'coal_sack',       'fuel',      12,  18),
  (3,  'silk_bolt',       'textiles',  90, 120),
  (4,  'spice_jar',       'food',      25,  38),
  (5,  'timber_plank',    'lumber',    15,  20),
  (6,  'silver_thread',   'textiles', 200, 280),
  (7,  'wheat_barrel',    'food',       8,  11),
  (8,  'stone_block',     'lumber',     5,   6),
  (9,  'bronze_fitting',  'metals',    60,  75),
  (10, 'dried_herbs',     'food',      30,  35);

CREATE TABLE stock (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  quantity_on_hand INTEGER NOT NULL,
  restock_threshold INTEGER NOT NULL
);
INSERT INTO stock VALUES
  (1,  1,  15,  20),
  (2,  2, 200,  50),
  (3,  3,   5,  10),
  (4,  4,  80,  15),
  (5,  5, 350,  30),
  (6,  6,   2,   5),
  (7,  7, 400,  60),
  (8,  8, 900,  40),
  (9,  9,  10,  15),
  (10, 10,  70,  20);

CREATE TABLE sales_history (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  qty_sold INTEGER NOT NULL,
  sale_date TEXT NOT NULL
);
INSERT INTO sales_history VALUES
  -- iron_ingot: high velocity
  (1,  1, 8, '1247-02-15'), (2,  1, 6, '1247-02-22'),
  (3,  1, 9, '1247-03-01'), (4,  1, 7, '1247-03-08'),
  (5,  1, 8, '1247-03-15'),
  -- coal_sack: moderate steady
  (6,  2, 20, '1247-02-10'), (7,  2, 18, '1247-02-20'),
  (8,  2, 22, '1247-03-05'), (9,  2, 19, '1247-03-12'),
  -- silk_bolt: fast moving luxury
  (10, 3, 3, '1247-03-01'), (11, 3, 2, '1247-03-10'),
  -- spice_jar: slow
  (12, 4, 5, '1247-01-20'), (13, 4, 3, '1247-02-15'),
  -- timber_plank: very slow
  (14, 5, 4, '1246-12-01'), (15, 5, 3, '1247-01-10'),
  -- silver_thread: luxury, very fast
  (16, 6, 2, '1247-03-10'), (17, 6, 1, '1247-03-14'),
  -- wheat_barrel: slow
  (18, 7, 15, '1247-01-05'), (19, 7, 12, '1247-02-01'),
  -- stone_block: nearly dead
  (20, 8, 2, '1246-10-01'),
  -- bronze_fitting: moderate
  (21, 9, 4, '1247-02-28'), (22, 9, 5, '1247-03-10'),
  -- dried_herbs: negative margin pressure
  (23, 10, 8, '1247-02-20'), (24, 10, 6, '1247-03-01');
`,
    requirements: [
      'Which 5 products have the highest 30-day sales velocity (total qty_sold in the last 30 days before 1247-03-15)?',
      'Which products are currently below their restock_threshold?',
      'What is the projected days-of-stock for each item at current 30-day velocity (quantity_on_hand / daily_velocity)?',
      'Which items have a margin of less than 20% ((unit_price - unit_cost) / unit_price)?',
    ],
    starterQueries: [
      {
        label: '30-Day Sales Velocity',
        query: `SELECT p.name, SUM(sh.qty_sold) AS sold_30d\nFROM sales_history sh\nJOIN products p ON p.id = sh.product_id\nWHERE sh.sale_date >= '1247-02-13'\nGROUP BY sh.product_id, p.name\nORDER BY sold_30d DESC;`,
      },
      {
        label: 'Below Restock Threshold',
        query: `SELECT p.name, s.quantity_on_hand, s.restock_threshold\nFROM stock s\nJOIN products p ON p.id = s.product_id\nWHERE s.quantity_on_hand < s.restock_threshold\nORDER BY s.quantity_on_hand;`,
      },
      {
        label: 'Margin Check',
        query: `SELECT name, unit_cost, unit_price,\n  ROUND(CAST(unit_price - unit_cost AS REAL) / unit_price * 100, 1) AS margin_pct\nFROM products\nORDER BY margin_pct ASC;`,
      },
    ],
    deliverables: [
      'A ranked restock list (top 5 by velocity + below threshold)',
      'A liquidation shortlist (slow-moving, overstocked, low-margin items)',
      'A projected days-of-stock table for all products',
      'Written recommendation: which 3 items to reorder this week and which 2 to mark down',
    ],
    tags: ['Moving Average', 'Ranking', 'Business Intelligence'],
  },

  // ── PC002 — The Fraud Tribunal ─────────────────────────────
  {
    id: 'pc002',
    title: 'The Fraud Tribunal',
    scenario:
      'The guild bank has flagged unusual transaction patterns. Some merchants are breaking large transactions into smaller ones to avoid detection thresholds — a technique known as "structuring." Your pair must identify statistical outliers and suspicious merchants before the Tribunal convenes.',
    navigatorRole:
      'Define the outlier threshold strategy: 2x the account average is the initial filter. Direct the Driver toward frequency analysis for the structuring pattern. Identify which results look genuinely suspicious versus noise.',
    driverRole:
      'Write queries to compute per-account averages, flag outlier transactions, aggregate merchant volumes, and calculate transaction frequency. Report findings back clearly so the Navigator can direct the next query.',
    schema: {
      accounts: [
        { col: 'id',           type: 'INTEGER', pk: true },
        { col: 'name',         type: 'TEXT' },
        { col: 'account_type', type: 'TEXT' },
      ],
      transactions: [
        { col: 'id',          type: 'INTEGER', pk: true },
        { col: 'account_id',  type: 'INTEGER' },
        { col: 'amount',      type: 'INTEGER' },
        { col: 'tx_date',     type: 'TEXT' },
        { col: 'merchant_id', type: 'INTEGER' },
      ],
      merchants: [
        { col: 'id',       type: 'INTEGER', pk: true },
        { col: 'name',     type: 'TEXT' },
        { col: 'category', type: 'TEXT' },
      ],
    },
    seed: `
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL
);
INSERT INTO accounts VALUES
  (1, 'torven_trading',  'merchant'),
  (2, 'aldric_personal', 'personal'),
  (3, 'brom_imports',    'merchant'),
  (4, 'cessa_guild',     'guild'),
  (5, 'draven_co',       'merchant');

CREATE TABLE merchants (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL
);
INSERT INTO merchants VALUES
  (1, 'ironworks_guild', 'metals'),
  (2, 'spice_road_co',   'food'),
  (3, 'shadow_exchange', 'unknown'),
  (4, 'harbor_freight',  'logistics'),
  (5, 'silk_road_trade', 'textiles');

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  tx_date TEXT NOT NULL,
  merchant_id INTEGER NOT NULL
);
INSERT INTO transactions VALUES
  -- torven_trading: normal large merchant transactions
  (1,  1, 1200, '1247-01-05', 1),
  (2,  1, 1500, '1247-01-12', 1),
  (3,  1,  980, '1247-01-20', 4),
  (4,  1, 1100, '1247-02-03', 1),
  (5,  1, 9800, '1247-02-15', 1),
  -- aldric_personal: normal small personal, one outlier
  (6,  2,  150, '1247-01-08', 2),
  (7,  2,  200, '1247-01-15', 2),
  (8,  2,  175, '1247-01-22', 5),
  (9,  2,  160, '1247-02-01', 2),
  (10, 2, 1800, '1247-02-20', 3),
  -- brom_imports: structuring — many small txns to shadow_exchange
  (11, 3,  490, '1247-01-03', 3),
  (12, 3,  495, '1247-01-04', 3),
  (13, 3,  498, '1247-01-05', 3),
  (14, 3,  492, '1247-01-06', 3),
  (15, 3,  488, '1247-01-07', 3),
  (16, 3,  496, '1247-01-08', 3),
  (17, 3,  500, '1247-01-09', 3),
  (18, 3,  493, '1247-01-10', 3),
  -- cessa_guild: normal guild transactions
  (19, 4, 3000, '1247-01-10', 4),
  (20, 4, 2800, '1247-01-25', 4),
  (21, 4, 3200, '1247-02-08', 4),
  -- draven_co: normal
  (22, 5,  800, '1247-01-15', 1),
  (23, 5,  750, '1247-02-01', 5),
  (24, 5,  820, '1247-02-20', 1);
`,
    requirements: [
      'What is the average transaction amount per account? Which accounts have transactions more than 2x their own average?',
      'Which merchants are receiving many small transactions (>5 transactions) that sum to a large total (>2000)?',
      'Which accounts have the highest transaction frequency in the period 1247-01-01 to 1247-02-28?',
      'Flag transactions to merchant "shadow_exchange" — what is the total volume and how many accounts are involved?',
    ],
    starterQueries: [
      {
        label: 'Average Transaction per Account',
        query: `SELECT a.name, AVG(t.amount) AS avg_amount, COUNT(*) AS tx_count\nFROM transactions t\nJOIN accounts a ON a.id = t.account_id\nGROUP BY t.account_id, a.name\nORDER BY avg_amount DESC;`,
      },
      {
        label: 'Outlier Transactions (2x Account Average)',
        query: `WITH acct_avg AS (\n  SELECT account_id, AVG(amount) AS avg_amt\n  FROM transactions GROUP BY account_id\n)\nSELECT a.name, t.amount, t.tx_date, aa.avg_amt,\n  ROUND(CAST(t.amount AS REAL) / aa.avg_amt, 2) AS ratio\nFROM transactions t\nJOIN acct_avg aa ON aa.account_id = t.account_id\nJOIN accounts a  ON a.id = t.account_id\nWHERE t.amount > aa.avg_amt * 2\nORDER BY ratio DESC;`,
      },
      {
        label: 'Merchant Volume Analysis',
        query: `SELECT m.name, COUNT(*) AS tx_count, SUM(t.amount) AS total_volume\nFROM transactions t\nJOIN merchants m ON m.id = t.merchant_id\nGROUP BY t.merchant_id, m.name\nORDER BY tx_count DESC;`,
      },
    ],
    deliverables: [
      'A list of outlier transactions with their account context and 2x-average ratio',
      'A merchant structuring report: who received many small transactions summing large',
      'A frequency leaderboard: top 3 most active accounts in the period',
      'A written summary identifying which account shows the clearest structuring pattern and why',
    ],
    tags: ['Statistical Analysis', 'Window Functions', 'Fraud Detection'],
  },

  // ── PC003 — The Sales Tribunal ─────────────────────────────
  {
    id: 'pc003',
    title: 'The Sales Tribunal',
    scenario:
      "The guild's regional sales force is under review. Performance varies wildly by region and product line. Your pair must identify top and bottom performers, measure target attainment, and surface whether tenure or region explains the gap — before the Tribunal issues reassignments.",
    navigatorRole:
      'Define what "performance" means in this context: raw totals, target attainment percentage, or rank within region. Direct the Driver to calculate each metric in sequence and narrate the business story the numbers tell.',
    driverRole:
      'Write the SUM, RANK, and julianday queries as directed. Calculate target attainment percentages and present results clearly. Use window functions to rank within each region.',
    schema: {
      salespersons: [
        { col: 'id',        type: 'INTEGER', pk: true },
        { col: 'name',      type: 'TEXT' },
        { col: 'region',    type: 'TEXT' },
        { col: 'hire_date', type: 'TEXT' },
      ],
      sales: [
        { col: 'id',             type: 'INTEGER', pk: true },
        { col: 'salesperson_id', type: 'INTEGER' },
        { col: 'product_id',     type: 'INTEGER' },
        { col: 'amount',         type: 'INTEGER' },
        { col: 'sale_date',      type: 'TEXT' },
      ],
      targets: [
        { col: 'id',             type: 'INTEGER', pk: true },
        { col: 'salesperson_id', type: 'INTEGER' },
        { col: 'month',          type: 'TEXT' },
        { col: 'target_amount',  type: 'INTEGER' },
      ],
      regions: [
        { col: 'id',         type: 'INTEGER', pk: true },
        { col: 'name',       type: 'TEXT' },
        { col: 'population', type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE regions (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  population INTEGER NOT NULL
);
INSERT INTO regions VALUES
  (1, 'northern_bay',   45000),
  (2, 'southern_coast', 38000),
  (3, 'western_inlet',  22000);

CREATE TABLE salespersons (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  hire_date TEXT NOT NULL
);
INSERT INTO salespersons VALUES
  (1, 'aldric',  'northern_bay',   '1244-03-01'),
  (2, 'brecken', 'northern_bay',   '1246-08-15'),
  (3, 'cessa',   'southern_coast', '1243-01-10'),
  (4, 'draven',  'southern_coast', '1247-01-05'),
  (5, 'ellara',  'western_inlet',  '1245-06-20'),
  (6, 'fenn',    'western_inlet',  '1246-11-01');

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  salesperson_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  sale_date TEXT NOT NULL
);
INSERT INTO sales VALUES
  -- aldric: strong performer
  (1,  1, 1, 2200, '1247-01-10'),
  (2,  1, 2, 1800, '1247-01-25'),
  (3,  1, 1, 2400, '1247-02-08'),
  (4,  1, 3, 1600, '1247-02-20'),
  (5,  1, 2, 2100, '1247-03-05'),
  -- brecken: new hire, low numbers
  (6,  2, 1,  800, '1247-01-15'),
  (7,  2, 2,  650, '1247-02-10'),
  (8,  2, 1,  900, '1247-03-01'),
  -- cessa: veteran, solid
  (9,  3, 3, 1900, '1247-01-08'),
  (10, 3, 1, 2100, '1247-01-22'),
  (11, 3, 2, 1700, '1247-02-14'),
  (12, 3, 3, 2000, '1247-03-10'),
  -- draven: new hire, struggling
  (13, 4, 1,  600, '1247-01-20'),
  (14, 4, 2,  550, '1247-02-15'),
  -- ellara: strong in small region
  (15, 5, 2, 1500, '1247-01-12'),
  (16, 5, 3, 1200, '1247-02-01'),
  (17, 5, 1, 1800, '1247-02-25'),
  (18, 5, 2, 1400, '1247-03-12'),
  -- fenn: new, minimal
  (19, 6, 1,  500, '1247-02-20'),
  (20, 6, 2,  480, '1247-03-08');

CREATE TABLE targets (
  id INTEGER PRIMARY KEY,
  salesperson_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  target_amount INTEGER NOT NULL
);
INSERT INTO targets VALUES
  (1,  1, '1247-01', 3500), (2,  1, '1247-02', 3500), (3,  1, '1247-03', 3500),
  (4,  2, '1247-01', 2000), (5,  2, '1247-02', 2000), (6,  2, '1247-03', 2000),
  (7,  3, '1247-01', 3000), (8,  3, '1247-02', 3000), (9,  3, '1247-03', 3000),
  (10, 4, '1247-01', 1500), (11, 4, '1247-02', 1500), (12, 4, '1247-03', 1500),
  (13, 5, '1247-01', 2500), (14, 5, '1247-02', 2500), (15, 5, '1247-03', 2500),
  (16, 6, '1247-01', 1200), (17, 6, '1247-02', 1200), (18, 6, '1247-03', 1200);
`,
    requirements: [
      'Who are the top 3 and bottom 3 performers by total sales amount across all months?',
      'What percentage of each salesperson\'s monthly target did they hit? (SUM actual / SUM target * 100)',
      'How does total sales correlate with tenure in days? (julianday(\'1247-03-15\') - julianday(hire_date))',
      'RANK salespersons within their region by total sales using RANK() OVER (PARTITION BY region ORDER BY total_sales DESC).',
    ],
    starterQueries: [
      {
        label: 'Total Sales per Salesperson',
        query: `SELECT sp.name, sp.region, SUM(s.amount) AS total_sales\nFROM sales s\nJOIN salespersons sp ON sp.id = s.salesperson_id\nGROUP BY s.salesperson_id, sp.name, sp.region\nORDER BY total_sales DESC;`,
      },
      {
        label: 'Target Attainment Percentage',
        query: `WITH actuals AS (\n  SELECT salesperson_id, SUM(amount) AS total_actual\n  FROM sales GROUP BY salesperson_id\n),\ntotal_targets AS (\n  SELECT salesperson_id, SUM(target_amount) AS total_target\n  FROM targets GROUP BY salesperson_id\n)\nSELECT sp.name,\n  a.total_actual, tt.total_target,\n  ROUND(CAST(a.total_actual AS REAL) / tt.total_target * 100, 1) AS attainment_pct\nFROM salespersons sp\nJOIN actuals      a  ON a.salesperson_id  = sp.id\nJOIN total_targets tt ON tt.salesperson_id = sp.id\nORDER BY attainment_pct DESC;`,
      },
      {
        label: 'Regional Rank via RANK()',
        query: `WITH totals AS (\n  SELECT sp.id, sp.name, sp.region, SUM(s.amount) AS total_sales\n  FROM sales s\n  JOIN salespersons sp ON sp.id = s.salesperson_id\n  GROUP BY sp.id, sp.name, sp.region\n)\nSELECT name, region, total_sales,\n  RANK() OVER (PARTITION BY region ORDER BY total_sales DESC) AS region_rank\nFROM totals\nORDER BY region, region_rank;`,
      },
    ],
    deliverables: [
      'A ranked leaderboard: all 6 salespersons by total sales with top/bottom flags',
      'A monthly target attainment table showing which months each person hit or missed',
      'A tenure vs. performance scatter summary (narrated, not necessarily graphed)',
      'Regional rankings and a recommendation: who in each region deserves recognition or coaching',
    ],
    tags: ['RANK', 'Date Arithmetic', 'Performance Analysis'],
  },

  // ── PC004 — The Loyalty Index ──────────────────────────────
  {
    id: 'pc004',
    title: 'The Loyalty Index',
    scenario:
      "The merchants guild is losing members to a rival network. Using order history, your pair must segment customers by churn risk, calculate lifetime value, and produce a prioritized re-engagement list — before the rival guild locks them in with long-term contracts.",
    navigatorRole:
      "Define the segmentation buckets: Active (<30 days since last order), At Risk (30-90 days), Churned (>90 days) as of '1247-03-15'. Direct the Driver to calculate recency, frequency, and monetary value and synthesize the RFM story.",
    driverRole:
      "Use julianday() to calculate days since each customer's last order. Write the segmentation CASE WHEN, then calculate lifetime value (SUM of orders). Sort churned customers by LTV for re-engagement priority.",
    schema: {
      customers: [
        { col: 'id',          type: 'INTEGER', pk: true },
        { col: 'name',        type: 'TEXT' },
        { col: 'guild_since', type: 'TEXT' },
        { col: 'tier',        type: 'TEXT' },
      ],
      orders: [
        { col: 'id',           type: 'INTEGER', pk: true },
        { col: 'customer_id',  type: 'INTEGER' },
        { col: 'total_amount', type: 'INTEGER' },
        { col: 'order_date',   type: 'TEXT' },
      ],
      products_purchased: [
        { col: 'id',         type: 'INTEGER', pk: true },
        { col: 'order_id',   type: 'INTEGER' },
        { col: 'product_id', type: 'INTEGER' },
        { col: 'qty',        type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  guild_since TEXT NOT NULL,
  tier TEXT NOT NULL
);
INSERT INTO customers VALUES
  (1, 'aldric',     '1242-05-01', 'gold'),
  (2, 'brecken',    '1245-08-10', 'silver'),
  (3, 'cessa',      '1243-03-20', 'gold'),
  (4, 'draven',     '1246-11-01', 'bronze'),
  (5, 'ellara',     '1244-07-15', 'silver'),
  (6, 'fenwick',    '1241-02-28', 'gold'),
  (7, 'griml',      '1247-01-10', 'bronze'),
  (8, 'harwick',    '1243-09-05', 'silver');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  order_date TEXT NOT NULL
);
INSERT INTO orders VALUES
  -- aldric: active, high value
  (1,  1, 1200, '1247-03-10'),
  (2,  1, 1500, '1247-02-20'),
  (3,  1,  900, '1247-01-15'),
  -- brecken: at risk
  (4,  2,  600, '1247-01-08'),
  (5,  2,  750, '1246-12-15'),
  -- cessa: active
  (6,  3, 2200, '1247-03-12'),
  (7,  3, 1800, '1247-02-28'),
  (8,  3, 2500, '1247-01-20'),
  -- draven: churned, low value
  (9,  4,  300, '1246-11-20'),
  -- ellara: at risk
  (10, 5,  950, '1247-01-10'),
  (11, 5, 1100, '1246-12-01'),
  -- fenwick: churned, high value (prime re-engagement target)
  (12, 6, 3000, '1246-10-01'),
  (13, 6, 2800, '1246-08-15'),
  (14, 6, 3200, '1246-07-20'),
  -- griml: active, new member
  (15, 7,  250, '1247-03-08'),
  -- harwick: churned, moderate value
  (16, 8, 1400, '1246-11-01'),
  (17, 8, 1600, '1246-09-15');

CREATE TABLE products_purchased (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  qty INTEGER NOT NULL
);
INSERT INTO products_purchased VALUES
  (1, 1, 1, 3), (2, 1, 2, 5),
  (3, 2, 3, 2), (4, 2, 1, 4),
  (5, 3, 2, 8),
  (6, 4, 1, 2), (7, 5, 2, 3),
  (8, 6, 3, 5), (9, 6, 1, 6),
  (10, 7, 3, 4), (11, 8, 1, 7),
  (12, 9, 2, 2),
  (13, 10, 1, 3), (14, 11, 2, 4),
  (15, 12, 3, 8), (16, 13, 1, 9),
  (17, 14, 3, 10),
  (18, 15, 2, 1),
  (19, 16, 1, 4), (20, 17, 3, 5);
`,
    requirements: [
      "How many days since each customer's last order as of '1247-03-15'? Use julianday arithmetic.",
      "Segment customers: Active (<30 days), At Risk (30-90 days), Churned (>90 days).",
      "What is each customer's total lifetime value (SUM of all order totals)?",
      "Which churned customers had the highest historical spend? List them ranked by LTV — these are the re-engagement targets.",
    ],
    starterQueries: [
      {
        label: 'Days Since Last Order',
        query: `SELECT c.name,\n  MAX(o.order_date) AS last_order,\n  CAST(julianday('1247-03-15') - julianday(MAX(o.order_date)) AS INTEGER) AS days_since\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY o.customer_id, c.name\nORDER BY days_since ASC;`,
      },
      {
        label: 'Churn Segmentation',
        query: `WITH recency AS (\n  SELECT customer_id,\n    CAST(julianday('1247-03-15') - julianday(MAX(order_date)) AS INTEGER) AS days_since\n  FROM orders GROUP BY customer_id\n)\nSELECT c.name, r.days_since,\n  CASE\n    WHEN r.days_since < 30  THEN 'Active'\n    WHEN r.days_since <= 90 THEN 'At Risk'\n    ELSE 'Churned'\n  END AS segment\nFROM recency r\nJOIN customers c ON c.id = r.customer_id\nORDER BY r.days_since;`,
      },
      {
        label: 'Lifetime Value per Customer',
        query: `SELECT c.name, c.tier, SUM(o.total_amount) AS lifetime_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY o.customer_id, c.name, c.tier\nORDER BY lifetime_value DESC;`,
      },
    ],
    deliverables: [
      'A segmented customer table: Active / At Risk / Churned with days_since and LTV',
      'A re-engagement priority list: churned customers ranked by LTV (highest value targets first)',
      'A retention risk summary: At Risk customers and their LTV at stake',
      'Written recommendation: which 2 churned gold-tier customers to contact first and why',
    ],
    tags: ['RFM Analysis', 'Segmentation', 'Date Functions', 'julianday'],
  },

  // ── PC005 — The Chain of Blame ─────────────────────────────
  {
    id: 'pc005',
    title: 'The Chain of Blame',
    scenario:
      'Shipments are chronically late and nobody agrees on whose fault it is. The guild supply chain has five stages: pick, pack, ship, deliver — each logged with a start and end time. Your pair must identify the bottleneck stage and the supplier causing the most delays, before the Guild Master reassigns blame arbitrarily.',
    navigatorRole:
      "Decide which metric defines 'bottleneck': average duration, variance, or both. Guide the Driver to query stage-by-stage durations, then pivot to supplier analysis. Frame the final narrative: where is time actually being lost?",
    driverRole:
      'Write julianday queries to compute duration per stage per order. GROUP BY stage to find averages. JOIN to suppliers to trace which supplier correlates with the longest lead times. Flag orders missing SLA.',
    schema: {
      orders_sc: [
        { col: 'id',           type: 'INTEGER', pk: true },
        { col: 'customer_id',  type: 'INTEGER' },
        { col: 'created_date', type: 'TEXT' },
      ],
      fulfillment_log: [
        { col: 'id',           type: 'INTEGER', pk: true },
        { col: 'order_id',     type: 'INTEGER' },
        { col: 'stage',        type: 'TEXT' },
        { col: 'started_at',   type: 'TEXT' },
        { col: 'completed_at', type: 'TEXT' },
      ],
      suppliers: [
        { col: 'id',               type: 'INTEGER', pk: true },
        { col: 'name',             type: 'TEXT' },
        { col: 'lead_time_days',   type: 'INTEGER' },
        { col: 'reliability_score', type: 'REAL' },
      ],
      order_suppliers: [
        { col: 'id',          type: 'INTEGER', pk: true },
        { col: 'order_id',    type: 'INTEGER' },
        { col: 'supplier_id', type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE orders_sc (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  created_date TEXT NOT NULL
);
INSERT INTO orders_sc VALUES
  (1, 1, '1247-01-05'),
  (2, 2, '1247-01-08'),
  (3, 3, '1247-01-10'),
  (4, 1, '1247-01-15'),
  (5, 4, '1247-01-18'),
  (6, 2, '1247-02-01'),
  (7, 3, '1247-02-05');

CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  lead_time_days INTEGER NOT NULL,
  reliability_score REAL NOT NULL
);
INSERT INTO suppliers VALUES
  (1, 'swift_cargo',     2, 0.95),
  (2, 'iron_haulers',    5, 0.72),
  (3, 'coastal_freight', 3, 0.88),
  (4, 'mire_runners',    8, 0.61);

CREATE TABLE order_suppliers (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  supplier_id INTEGER NOT NULL
);
INSERT INTO order_suppliers VALUES
  (1, 1, 1), (2, 2, 2), (3, 3, 3),
  (4, 4, 2), (5, 5, 4), (6, 6, 1),
  (7, 7, 4);

CREATE TABLE fulfillment_log (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  stage TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL
);
INSERT INTO fulfillment_log VALUES
  -- order 1 (swift_cargo): fast, within SLA
  (1,  1, 'pick',    '1247-01-05', '1247-01-05'),
  (2,  1, 'pack',    '1247-01-05', '1247-01-06'),
  (3,  1, 'ship',    '1247-01-06', '1247-01-07'),
  (4,  1, 'deliver', '1247-01-07', '1247-01-08'),
  -- order 2 (iron_haulers): ship stage slow
  (5,  2, 'pick',    '1247-01-08', '1247-01-09'),
  (6,  2, 'pack',    '1247-01-09', '1247-01-10'),
  (7,  2, 'ship',    '1247-01-10', '1247-01-14'),
  (8,  2, 'deliver', '1247-01-14', '1247-01-16'),
  -- order 3 (coastal_freight): moderate
  (9,  3, 'pick',    '1247-01-10', '1247-01-11'),
  (10, 3, 'pack',    '1247-01-11', '1247-01-12'),
  (11, 3, 'ship',    '1247-01-12', '1247-01-14'),
  (12, 3, 'deliver', '1247-01-14', '1247-01-15'),
  -- order 4 (iron_haulers): ship stage very slow, misses SLA
  (13, 4, 'pick',    '1247-01-15', '1247-01-16'),
  (14, 4, 'pack',    '1247-01-16', '1247-01-17'),
  (15, 4, 'ship',    '1247-01-17', '1247-01-22'),
  (16, 4, 'deliver', '1247-01-22', '1247-01-24'),
  -- order 5 (mire_runners): catastrophically slow, misses SLA badly
  (17, 5, 'pick',    '1247-01-18', '1247-01-20'),
  (18, 5, 'pack',    '1247-01-20', '1247-01-22'),
  (19, 5, 'ship',    '1247-01-22', '1247-02-01'),
  (20, 5, 'deliver', '1247-02-01', '1247-02-05'),
  -- order 6 (swift_cargo): fast again
  (21, 6, 'pick',    '1247-02-01', '1247-02-01'),
  (22, 6, 'pack',    '1247-02-01', '1247-02-02'),
  (23, 6, 'ship',    '1247-02-02', '1247-02-03'),
  (24, 6, 'deliver', '1247-02-03', '1247-02-04'),
  -- order 7 (mire_runners): slow again, misses SLA
  (25, 7, 'pick',    '1247-02-05', '1247-02-07'),
  (26, 7, 'pack',    '1247-02-07', '1247-02-09'),
  (27, 7, 'ship',    '1247-02-09', '1247-02-17'),
  (28, 7, 'deliver', '1247-02-17', '1247-02-20');
`,
    requirements: [
      "What is the average duration in days for each stage (pick, pack, ship, deliver) across all orders?",
      "Which stage has the highest variance in completion time? (MAX duration - MIN duration per stage)",
      "Which supplier causes the most delays? Calculate average total fulfillment days per supplier and compare to their promised lead_time_days.",
      "For orders that missed SLA (total fulfillment > 5 days), show the full stage-by-stage breakdown with each stage's duration.",
    ],
    starterQueries: [
      {
        label: 'Average Duration per Stage',
        query: `SELECT stage,\n  ROUND(AVG(julianday(completed_at) - julianday(started_at)), 2) AS avg_days,\n  MIN(julianday(completed_at) - julianday(started_at)) AS min_days,\n  MAX(julianday(completed_at) - julianday(started_at)) AS max_days\nFROM fulfillment_log\nGROUP BY stage\nORDER BY avg_days DESC;`,
      },
      {
        label: 'Total Fulfillment Days per Order',
        query: `SELECT fl.order_id,\n  MIN(fl.started_at) AS started,\n  MAX(fl.completed_at) AS finished,\n  ROUND(julianday(MAX(fl.completed_at)) - julianday(MIN(fl.started_at)), 1) AS total_days\nFROM fulfillment_log fl\nGROUP BY fl.order_id\nORDER BY total_days DESC;`,
      },
      {
        label: 'Supplier Delay Analysis',
        query: `WITH order_duration AS (\n  SELECT order_id,\n    julianday(MAX(completed_at)) - julianday(MIN(started_at)) AS total_days\n  FROM fulfillment_log GROUP BY order_id\n)\nSELECT s.name, s.lead_time_days AS promised_days,\n  ROUND(AVG(od.total_days), 1) AS actual_avg_days,\n  ROUND(AVG(od.total_days) - s.lead_time_days, 1) AS delay_gap\nFROM order_suppliers os\nJOIN suppliers s ON s.id = os.supplier_id\nJOIN order_duration od ON od.order_id = os.order_id\nGROUP BY os.supplier_id, s.name, s.lead_time_days\nORDER BY delay_gap DESC;`,
      },
    ],
    deliverables: [
      'A stage breakdown table: average, min, max, and variance for each of the 4 stages',
      'A supplier performance report: promised vs. actual lead time, ranked by delay gap',
      'A list of SLA-breaching orders (>5 days total) with their full stage durations',
      'Written verdict: which single stage and which single supplier are the root causes, and the recommended fix',
    ],
    tags: ['Date Arithmetic', 'Supply Chain', 'julianday', 'GROUP BY'],
  },
]

export const PAIRED_PROBLEMS_MAP: Record<string, PairedProblem> = Object.fromEntries(
  PAIRED_PROBLEMS.map(p => [p.id, p])
)

function buildTrialContract(
  problem: PairedProblem,
  session: number,
  mentor: 'Kazi' | 'Azm'
): TrialContract {
  const isKazi = mentor === 'Kazi'

  return {
    ...problem,
    id: `${isKazi ? 'kz' : 'az'}${String(session).padStart(2, '0')}`,
    mentor,
    session,
    leadRole: isKazi ? 'Navigator' : 'Driver',
    mentorFocus: isKazi
      ? 'Kazi grades requirement framing, business translation, role discipline, and whether the pair can explain why the SQL matters before it is typed.'
      : 'Azm grades SQL execution depth, iteration quality, query refinement, and whether the pair pushes into advanced T-SQL patterns and performance thinking.',
    outputFocus: isKazi
      ? 'Finish with a business-facing notebook summary and a clear recommendation the stakeholder could act on.'
      : 'Finish with a technical notebook trail that shows query evolution, deeper SQL features, and the strongest final implementation.',
    sourceProblemId: problem.id,
  }
}

export const KAZI_TRIALS: TrialContract[] = PAIRED_PROBLEMS.map((problem, index) =>
  buildTrialContract(problem, index + 1, 'Kazi')
)

export const AZM_TRIALS: TrialContract[] = PAIRED_PROBLEMS.map((problem, index) =>
  buildTrialContract(problem, index + 1, 'Azm')
)

export const ALL_TRIALS: TrialContract[] = [...KAZI_TRIALS, ...AZM_TRIALS]
