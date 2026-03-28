import type { Rank, SchemaColumn } from '@/types'

export interface ContractStarterQuery {
  label: string
  query: string
  desc: string
}

export interface ContractQuestPack {
  id: string
  title: string
  lore: string
  answer: string
  answerHint: string
  rank: Rank
  rankClass: string
  diff: number
  xp: number
  finalClueLabel: string
  finalClueQuery: string
  finalClueDesc: string
}

export interface DungeonContract {
  id: string
  proposition: number
  title: string
  leadRole: 'Navigator' | 'Driver'
  scenario: string
  navigatorRole: string
  driverRole: string
  schema: Record<string, SchemaColumn[]>
  seed: string
  requirements: string[]
  starterQueries: ContractStarterQuery[]
  deliverables: string[]
  tags: string[]
  quest: ContractQuestPack
}

export const CONTRACT_PROCESS_STEPS = [
  'Navigator states the business need, sharpens the question, and explains what a useful answer would change.',
  'Driver writes T-SQL in a shared notebook, tests results, and narrates what each iteration proves or disproves.',
  'Both partners refine the query path together, switch emphasis when needed, and keep role notes in the notebook.',
  'Finish with recommendations, query evolution, and a notebook trail strong enough for GitHub submission.',
]

export const CONTRACT_EVALUATION_CRITERIA = [
  'Collaboration: role alternation, listening, and requirement handoff stay clear throughout the session.',
  'Depth: the pair uses advanced T-SQL patterns such as CTEs, subqueries, ranking, pivots, or performance thinking.',
  'Innovation: the solution goes beyond a first-pass answer and explores edge cases, tuning, or richer analysis.',
  'Documentation: the notebook captures role notes, query evolution, evidence, and final recommendations.',
]

export const DUNGEON_CONTRACTS: DungeonContract[] = [
  {
    id: 'dc001',
    proposition: 1,
    title: 'The Inventory Oracle',
    leadRole: 'Navigator',
    scenario:
      'A guild warehouse is tying up too much cash. Some items are moving too fast, others are collecting dust, and the inventory team wants a restock and markdown plan before the next buying cycle.',
    navigatorRole:
      'Define the business thresholds first: velocity, days of stock, and margin risk. Keep the Driver focused on which signals actually justify a restock recommendation.',
    driverRole:
      'Translate the thresholds into layered T-SQL with aggregates and a final prioritization query. Report back which products are urgent, slow, or margin-poor.',
    schema: {
      products: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
        { col: 'category', type: 'TEXT' },
        { col: 'unit_cost', type: 'INTEGER' },
        { col: 'unit_price', type: 'INTEGER' },
      ],
      stock: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'product_id', type: 'INTEGER' },
        { col: 'quantity_on_hand', type: 'INTEGER' },
        { col: 'restock_threshold', type: 'INTEGER' },
      ],
      sales_history: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'product_id', type: 'INTEGER' },
        { col: 'qty_sold', type: 'INTEGER' },
        { col: 'sale_date', type: 'TEXT' },
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
  (1, 'iron_ingot',  'metals',   40, 55),
  (2, 'coal_sack',   'fuel',     12, 18),
  (3, 'silk_bolt',   'textiles', 90, 120),
  (4, 'spice_jar',   'food',     25, 38),
  (5, 'timber_plank','lumber',   15, 20),
  (6, 'silver_thread','textiles',200,280),
  (7, 'bronze_fitting','metals', 60, 75);

CREATE TABLE stock (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  quantity_on_hand INTEGER NOT NULL,
  restock_threshold INTEGER NOT NULL
);
INSERT INTO stock VALUES
  (1, 1, 15, 20),
  (2, 2, 200, 60),
  (3, 3, 5, 10),
  (4, 4, 80, 15),
  (5, 5, 350, 30),
  (6, 6, 2, 5),
  (7, 7, 10, 15);

CREATE TABLE sales_history (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  qty_sold INTEGER NOT NULL,
  sale_date TEXT NOT NULL
);
INSERT INTO sales_history VALUES
  (1, 1, 8, '1247-02-15'), (2, 1, 6, '1247-02-22'), (3, 1, 9, '1247-03-01'), (4, 1, 7, '1247-03-08'),
  (5, 2, 20, '1247-02-10'), (6, 2, 18, '1247-02-20'), (7, 2, 22, '1247-03-05'),
  (8, 3, 3, '1247-03-01'), (9, 3, 2, '1247-03-10'),
  (10, 4, 5, '1247-01-20'), (11, 4, 3, '1247-02-15'),
  (12, 5, 4, '1246-12-01'), (13, 5, 3, '1247-01-10'),
  (14, 6, 2, '1247-03-10'), (15, 6, 1, '1247-03-14'),
  (16, 7, 4, '1247-02-28'), (17, 7, 5, '1247-03-10');
`,
    requirements: [
      'Rank products by 30-day sales velocity as of 1247-03-15.',
      'Identify which products are currently below their restock threshold.',
      'Estimate days of stock at the current 30-day velocity.',
      'Choose the single product that should be reordered first.',
    ],
    starterQueries: [
      {
        label: 'Velocity Scan',
        query: `SELECT p.name, SUM(sh.qty_sold) AS sold_30d
FROM sales_history sh
JOIN products p ON p.id = sh.product_id
WHERE sh.sale_date >= '1247-02-13'
GROUP BY sh.product_id, p.name
ORDER BY sold_30d DESC, p.name;`,
        desc: 'Shows which products moved fastest in the latest 30-day window.',
      },
      {
        label: 'Threshold Breach List',
        query: `SELECT p.name, s.quantity_on_hand, s.restock_threshold
FROM stock s
JOIN products p ON p.id = s.product_id
WHERE s.quantity_on_hand < s.restock_threshold
ORDER BY s.quantity_on_hand ASC, p.name;`,
        desc: 'Surfaces the items already below their replenishment floor.',
      },
      {
        label: 'Days of Stock',
        query: `WITH sold_30 AS (
  SELECT product_id, SUM(qty_sold) AS sold_30d
  FROM sales_history
  WHERE sale_date >= '1247-02-13'
  GROUP BY product_id
)
SELECT p.name, s.quantity_on_hand, COALESCE(s30.sold_30d, 0) AS sold_30d,
  ROUND(CASE WHEN COALESCE(s30.sold_30d, 0) = 0 THEN NULL
    ELSE s.quantity_on_hand / (s30.sold_30d / 30.0) END, 1) AS days_of_stock
FROM products p
JOIN stock s ON s.product_id = p.id
LEFT JOIN sold_30 s30 ON s30.product_id = p.id
ORDER BY days_of_stock ASC, p.name;`,
        desc: 'Converts raw sales into a days-of-cover estimate.',
      },
    ],
    deliverables: [
      'A ranked restock priority list.',
      'A markdown shortlist for slow and overstocked items.',
      'A days-of-stock table with clear thresholds.',
      'A final recommendation naming the first item to reorder.',
    ],
    tags: ['Inventory', 'CTE', 'Aggregation', 'Forecasting'],
    quest: {
      id: 'AZ01',
      title: 'The Burn Rate Oracle',
      lore:
        'Azm hands you a warehouse ledger instead of a mystery scroll. The answer is hidden in velocity, thresholds, and days of cover. Find the product that forces the fastest restock decision.',
      answer: 'iron_ingot',
      answerHint: 'Enter the product name in lowercase with underscore.',
      rank: 'Rare',
      rankClass: 'border-rune/40 bg-rune/10 text-rune',
      diff: 3,
      xp: 210,
      finalClueLabel: 'Reveal the reorder verdict',
      finalClueQuery: `WITH sold_30 AS (
  SELECT product_id, SUM(qty_sold) AS sold_30d
  FROM sales_history
  WHERE sale_date >= '1247-02-13'
  GROUP BY product_id
),
priority AS (
  SELECT p.name, s.quantity_on_hand, s.restock_threshold, COALESCE(s30.sold_30d, 0) AS sold_30d,
    CASE WHEN COALESCE(s30.sold_30d, 0) = 0 THEN 9999
      ELSE ROUND(s.quantity_on_hand / (s30.sold_30d / 30.0), 1) END AS days_of_stock
  FROM products p
  JOIN stock s ON s.product_id = p.id
  LEFT JOIN sold_30 s30 ON s30.product_id = p.id
  WHERE s.quantity_on_hand < s.restock_threshold
)
SELECT name
FROM priority
ORDER BY days_of_stock ASC, sold_30d DESC, name
LIMIT 1;`,
      finalClueDesc: 'The answer is the below-threshold item with the least runway once current velocity is taken seriously.',
    },
  },
  {
    id: 'dc002',
    proposition: 2,
    title: 'The Fraud Tribunal',
    leadRole: 'Driver',
    scenario:
      'Bank auditors suspect structuring: many small transfers to the same shadow merchant instead of a few obvious large ones. The pair needs a defensible fraud shortlist before compliance locks the accounts.',
    navigatorRole:
      'Set the suspicion rules clearly: outlier behavior against account norms, repeated small transfers, and concentration into a risky merchant.',
    driverRole:
      'Build the account-average baseline, the merchant concentration view, and the final structuring filter in T-SQL.',
    schema: {
      accounts: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
        { col: 'account_type', type: 'TEXT' },
      ],
      merchants: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
        { col: 'category', type: 'TEXT' },
      ],
      transactions: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'account_id', type: 'INTEGER' },
        { col: 'merchant_id', type: 'INTEGER' },
        { col: 'amount', type: 'INTEGER' },
        { col: 'tx_date', type: 'TEXT' },
      ],
    },
    seed: `
CREATE TABLE accounts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL
);
INSERT INTO accounts VALUES
  (1, 'torven_trading', 'merchant'),
  (2, 'aldric_personal', 'personal'),
  (3, 'brom_imports', 'merchant'),
  (4, 'cessa_guild', 'guild'),
  (5, 'draven_co', 'merchant');

CREATE TABLE merchants (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL
);
INSERT INTO merchants VALUES
  (1, 'ironworks_guild', 'metals'),
  (2, 'spice_road_co', 'food'),
  (3, 'shadow_exchange', 'unknown'),
  (4, 'harbor_freight', 'logistics');

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  merchant_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  tx_date TEXT NOT NULL
);
INSERT INTO transactions VALUES
  (1, 1, 1, 1200, '1247-01-05'), (2, 1, 1, 1500, '1247-01-12'), (3, 1, 4, 980, '1247-01-20'), (4, 1, 1, 9800, '1247-02-15'),
  (5, 2, 2, 150, '1247-01-08'), (6, 2, 2, 200, '1247-01-15'), (7, 2, 3, 1800, '1247-02-20'),
  (8, 3, 3, 490, '1247-01-03'), (9, 3, 3, 495, '1247-01-04'), (10, 3, 3, 498, '1247-01-05'),
  (11, 3, 3, 492, '1247-01-06'), (12, 3, 3, 488, '1247-01-07'), (13, 3, 3, 496, '1247-01-08'),
  (14, 3, 3, 500, '1247-01-09'), (15, 3, 3, 493, '1247-01-10'),
  (16, 4, 4, 3000, '1247-01-10'), (17, 4, 4, 3200, '1247-02-08'),
  (18, 5, 1, 800, '1247-01-15'), (19, 5, 4, 820, '1247-02-20');
`,
    requirements: [
      'Measure the average transaction amount per account.',
      'Flag transfers more than 2x the account average.',
      'Show merchants receiving many small transactions that add up to suspicious volume.',
      'Name the account with the clearest structuring pattern.',
    ],
    starterQueries: [
      {
        label: 'Account Average Baseline',
        query: `SELECT a.name, AVG(t.amount) AS avg_amount, COUNT(*) AS tx_count
FROM transactions t
JOIN accounts a ON a.id = t.account_id
GROUP BY t.account_id, a.name
ORDER BY avg_amount DESC;`,
        desc: 'Builds the normal transaction profile for each account.',
      },
      {
        label: '2x Outlier Transfers',
        query: `WITH acct_avg AS (
  SELECT account_id, AVG(amount) AS avg_amount
  FROM transactions
  GROUP BY account_id
)
SELECT a.name, t.amount, t.tx_date, ROUND(t.amount / aa.avg_amount, 2) AS ratio
FROM transactions t
JOIN acct_avg aa ON aa.account_id = t.account_id
JOIN accounts a ON a.id = t.account_id
WHERE t.amount > aa.avg_amount * 2
ORDER BY ratio DESC, a.name;`,
        desc: 'Flags transactions that break their own account norm.',
      },
      {
        label: 'Merchant Concentration',
        query: `SELECT a.name, m.name AS merchant_name, COUNT(*) AS tx_count, SUM(t.amount) AS total_volume
FROM transactions t
JOIN accounts a ON a.id = t.account_id
JOIN merchants m ON m.id = t.merchant_id
GROUP BY t.account_id, a.name, m.name
ORDER BY tx_count DESC, total_volume DESC;`,
        desc: 'Shows repeated payment behavior by account and merchant.',
      },
    ],
    deliverables: [
      'A table of outlier transfers with account context.',
      'A merchant concentration report focused on small repeated transfers.',
      'A shortlist of suspicious accounts.',
      'A final written fraud verdict naming the strongest structuring candidate.',
    ],
    tags: ['Fraud', 'CTE', 'Outliers', 'Aggregation'],
    quest: {
      id: 'AZ02',
      title: 'The Structuring Ledger',
      lore:
        'Azm replaces monsters with money trails. One account hides in repetition instead of scale. Follow the account that keeps feeding the shadow merchant in nearly identical amounts.',
      answer: 'brom_imports',
      answerHint: 'Enter the account name in lowercase with underscore.',
      rank: 'Legendary',
      rankClass: 'border-gold/40 bg-gold/10 text-gold',
      diff: 4,
      xp: 260,
      finalClueLabel: 'Reveal the structuring verdict',
      finalClueQuery: `SELECT a.name
FROM transactions t
JOIN accounts a ON a.id = t.account_id
JOIN merchants m ON m.id = t.merchant_id
WHERE m.name = 'shadow_exchange'
  AND t.amount BETWEEN 480 AND 500
GROUP BY a.id, a.name
HAVING COUNT(*) >= 5 AND SUM(t.amount) > 2000
ORDER BY SUM(t.amount) DESC, COUNT(*) DESC
LIMIT 1;`,
      finalClueDesc: 'The guilty account is not the one with the biggest single outlier. It is the one that hides large volume in repeated near-threshold transfers.',
    },
  },
  {
    id: 'dc003',
    proposition: 3,
    title: 'The Sales Tribunal',
    leadRole: 'Navigator',
    scenario:
      'Regional sales results are uneven, management wants coaching assignments, and nobody agrees on whether tenure or territory is the real issue. The pair must turn raw sales into a fair performance story.',
    navigatorRole:
      'Define the evaluation order: totals first, attainment next, then regional context. Keep the analysis business-facing, not just leaderboard-heavy.',
    driverRole:
      'Use aggregates, joins, and ranking functions to surface total sales, target attainment, and within-region rank.',
    schema: {
      salespersons: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
        { col: 'region', type: 'TEXT' },
        { col: 'hire_date', type: 'TEXT' },
      ],
      sales: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'salesperson_id', type: 'INTEGER' },
        { col: 'amount', type: 'INTEGER' },
        { col: 'sale_date', type: 'TEXT' },
      ],
      targets: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'salesperson_id', type: 'INTEGER' },
        { col: 'month', type: 'TEXT' },
        { col: 'target_amount', type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE salespersons (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  hire_date TEXT NOT NULL
);
INSERT INTO salespersons VALUES
  (1, 'aldric', 'north', '1244-03-01'),
  (2, 'brecken', 'north', '1246-08-15'),
  (3, 'cessa', 'south', '1243-01-10'),
  (4, 'draven', 'south', '1247-01-05'),
  (5, 'ellara', 'west', '1245-06-20'),
  (6, 'fenn', 'west', '1246-11-01');

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  salesperson_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  sale_date TEXT NOT NULL
);
INSERT INTO sales VALUES
  (1, 1, 2200, '1247-01-10'), (2, 1, 1800, '1247-01-25'), (3, 1, 2400, '1247-02-08'), (4, 1, 2100, '1247-03-05'),
  (5, 2, 800, '1247-01-15'), (6, 2, 650, '1247-02-10'), (7, 2, 900, '1247-03-01'),
  (8, 3, 1900, '1247-01-08'), (9, 3, 2100, '1247-01-22'), (10, 3, 1700, '1247-02-14'), (11, 3, 2000, '1247-03-10'),
  (12, 4, 600, '1247-01-20'), (13, 4, 550, '1247-02-15'),
  (14, 5, 1500, '1247-01-12'), (15, 5, 1200, '1247-02-01'), (16, 5, 1800, '1247-02-25'), (17, 5, 1400, '1247-03-12'),
  (18, 6, 500, '1247-02-20'), (19, 6, 480, '1247-03-08');

CREATE TABLE targets (
  id INTEGER PRIMARY KEY,
  salesperson_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  target_amount INTEGER NOT NULL
);
INSERT INTO targets VALUES
  (1, 1, '1247-01', 3500), (2, 1, '1247-02', 3500), (3, 1, '1247-03', 3500),
  (4, 2, '1247-01', 2000), (5, 2, '1247-02', 2000), (6, 2, '1247-03', 2000),
  (7, 3, '1247-01', 3000), (8, 3, '1247-02', 3000), (9, 3, '1247-03', 3000),
  (10, 4, '1247-01', 1500), (11, 4, '1247-02', 1500), (12, 4, '1247-03', 1500),
  (13, 5, '1247-01', 2500), (14, 5, '1247-02', 2500), (15, 5, '1247-03', 2500),
  (16, 6, '1247-01', 1200), (17, 6, '1247-02', 1200), (18, 6, '1247-03', 1200);
`,
    requirements: [
      'Rank the sales team by total sales.',
      'Compute total target attainment for each salesperson.',
      'Rank salespeople within their region.',
      'Name the person who most clearly needs coaching.',
    ],
    starterQueries: [
      {
        label: 'Total Sales',
        query: `SELECT sp.name, sp.region, SUM(s.amount) AS total_sales
FROM sales s
JOIN salespersons sp ON sp.id = s.salesperson_id
GROUP BY sp.id, sp.name, sp.region
ORDER BY total_sales DESC;`,
        desc: 'Builds the raw performance leaderboard.',
      },
      {
        label: 'Target Attainment',
        query: `WITH actuals AS (
  SELECT salesperson_id, SUM(amount) AS total_actual
  FROM sales
  GROUP BY salesperson_id
),
targets_all AS (
  SELECT salesperson_id, SUM(target_amount) AS total_target
  FROM targets
  GROUP BY salesperson_id
)
SELECT sp.name, a.total_actual, t.total_target,
  ROUND(CAST(a.total_actual AS REAL) / t.total_target * 100, 1) AS attainment_pct
FROM salespersons sp
JOIN actuals a ON a.salesperson_id = sp.id
JOIN targets_all t ON t.salesperson_id = sp.id
ORDER BY attainment_pct DESC;`,
        desc: 'Shows who is converting effort into target hit rate.',
      },
      {
        label: 'Regional Rank',
        query: `WITH totals AS (
  SELECT sp.id, sp.name, sp.region, SUM(s.amount) AS total_sales
  FROM sales s
  JOIN salespersons sp ON sp.id = s.salesperson_id
  GROUP BY sp.id, sp.name, sp.region
)
SELECT name, region, total_sales,
  RANK() OVER (PARTITION BY region ORDER BY total_sales DESC) AS region_rank
FROM totals
ORDER BY region, region_rank;`,
        desc: 'Adds context so weak performance is not judged without territory comparison.',
      },
    ],
    deliverables: [
      'A team leaderboard by total sales.',
      'A target attainment table.',
      'A regional rank summary.',
      'A final coaching recommendation naming the weakest performer.',
    ],
    tags: ['Sales', 'RANK', 'Targets', 'Performance'],
    quest: {
      id: 'AZ03',
      title: 'The Coaching Writ',
      lore:
        'Azm does not want the flashiest rep. He wants the cleanest case for intervention. Find the salesperson whose attainment collapses under every lens you can measure.',
      answer: 'draven',
      answerHint: 'Enter the salesperson name in lowercase.',
      rank: 'Rare',
      rankClass: 'border-rune/40 bg-rune/10 text-rune',
      diff: 3,
      xp: 220,
      finalClueLabel: 'Reveal the coaching verdict',
      finalClueQuery: `WITH actuals AS (
  SELECT salesperson_id, SUM(amount) AS total_actual
  FROM sales
  GROUP BY salesperson_id
),
targets_all AS (
  SELECT salesperson_id, SUM(target_amount) AS total_target
  FROM targets
  GROUP BY salesperson_id
)
SELECT sp.name
FROM salespersons sp
JOIN actuals a ON a.salesperson_id = sp.id
JOIN targets_all t ON t.salesperson_id = sp.id
ORDER BY CAST(a.total_actual AS REAL) / t.total_target ASC, sp.name
LIMIT 1;`,
      finalClueDesc: 'The person who needs help most is the one with the lowest overall attainment, not merely the lowest raw sales total.',
    },
  },
  {
    id: 'dc004',
    proposition: 4,
    title: 'The Loyalty Index',
    leadRole: 'Driver',
    scenario:
      'A rival network is winning back old customers. The pair must segment churn risk, estimate value at stake, and decide which dormant members are worth re-engaging first.',
    navigatorRole:
      'Define the recency buckets and keep the Driver focused on business value, not just inactivity.',
    driverRole:
      'Use date arithmetic, aggregation, and segmentation logic to turn order history into a retention plan.',
    schema: {
      customers: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
        { col: 'tier', type: 'TEXT' },
      ],
      orders: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'customer_id', type: 'INTEGER' },
        { col: 'total_amount', type: 'INTEGER' },
        { col: 'order_date', type: 'TEXT' },
      ],
    },
    seed: `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL
);
INSERT INTO customers VALUES
  (1, 'aldric', 'gold'),
  (2, 'brecken', 'silver'),
  (3, 'cessa', 'gold'),
  (4, 'draven', 'bronze'),
  (5, 'ellara', 'silver'),
  (6, 'fenwick', 'gold'),
  (7, 'griml', 'bronze'),
  (8, 'harwick', 'silver');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  order_date TEXT NOT NULL
);
INSERT INTO orders VALUES
  (1, 1, 1200, '1247-03-10'), (2, 1, 1500, '1247-02-20'), (3, 1, 900, '1247-01-15'),
  (4, 2, 600, '1247-01-08'), (5, 2, 750, '1246-12-15'),
  (6, 3, 2200, '1247-03-12'), (7, 3, 1800, '1247-02-28'), (8, 3, 2500, '1247-01-20'),
  (9, 4, 300, '1246-11-20'),
  (10, 5, 950, '1247-01-10'), (11, 5, 1100, '1246-12-01'),
  (12, 6, 3000, '1246-10-01'), (13, 6, 2800, '1246-08-15'), (14, 6, 3200, '1246-07-20'),
  (15, 7, 250, '1247-03-08'),
  (16, 8, 1400, '1246-11-01'), (17, 8, 1600, '1246-09-15');
`,
    requirements: [
      'Measure days since last order as of 1247-03-15.',
      'Segment each customer into Active, At Risk, or Churned.',
      'Compute lifetime value for each customer.',
      'Name the best churned customer to re-engage first.',
    ],
    starterQueries: [
      {
        label: 'Recency Scan',
        query: `SELECT c.name, MAX(o.order_date) AS last_order,
  CAST(julianday('1247-03-15') - julianday(MAX(o.order_date)) AS INTEGER) AS days_since
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY days_since ASC;`,
        desc: 'Shows how long each customer has been idle.',
      },
      {
        label: 'Churn Segmentation',
        query: `WITH recency AS (
  SELECT customer_id,
    CAST(julianday('1247-03-15') - julianday(MAX(order_date)) AS INTEGER) AS days_since
  FROM orders
  GROUP BY customer_id
)
SELECT c.name, r.days_since,
  CASE
    WHEN r.days_since < 30 THEN 'Active'
    WHEN r.days_since <= 90 THEN 'At Risk'
    ELSE 'Churned'
  END AS segment
FROM recency r
JOIN customers c ON c.id = r.customer_id
ORDER BY r.days_since DESC;`,
        desc: 'Turns recency into an actionable retention bucket.',
      },
      {
        label: 'Lifetime Value',
        query: `SELECT c.name, c.tier, SUM(o.total_amount) AS lifetime_value
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY c.id, c.name, c.tier
ORDER BY lifetime_value DESC;`,
        desc: 'Adds value so the team can prioritize recovery effort.',
      },
    ],
    deliverables: [
      'A recency and segment table for all customers.',
      'A lifetime value ranking.',
      'A re-engagement shortlist for churned members.',
      'A final recommendation naming the top re-engagement target.',
    ],
    tags: ['Retention', 'Segmentation', 'Date Functions', 'LTV'],
    quest: {
      id: 'AZ04',
      title: 'The Recovery Ledger',
      lore:
        'Azm does not chase every lost customer. He wants the one whose silence costs the guild the most. Find the churned member with the biggest value still worth recovering.',
      answer: 'fenwick',
      answerHint: 'Enter the customer name in lowercase.',
      rank: 'Legendary',
      rankClass: 'border-gold/40 bg-gold/10 text-gold',
      diff: 4,
      xp: 270,
      finalClueLabel: 'Reveal the re-engagement verdict',
      finalClueQuery: `WITH recency AS (
  SELECT customer_id,
    CAST(julianday('1247-03-15') - julianday(MAX(order_date)) AS INTEGER) AS days_since
  FROM orders
  GROUP BY customer_id
),
ltv AS (
  SELECT customer_id, SUM(total_amount) AS lifetime_value
  FROM orders
  GROUP BY customer_id
)
SELECT c.name
FROM customers c
JOIN recency r ON r.customer_id = c.id
JOIN ltv l ON l.customer_id = c.id
WHERE r.days_since > 90
ORDER BY l.lifetime_value DESC, c.name
LIMIT 1;`,
      finalClueDesc: 'The best recovery target is the churned customer with the greatest historical value still left on the table.',
    },
  },
  {
    id: 'dc005',
    proposition: 5,
    title: 'The Chain of Blame',
    leadRole: 'Navigator',
    scenario:
      'Late shipments are setting off internal blame wars. The pair must identify the worst stage and the supplier most responsible for missed SLAs before leadership punishes the wrong team.',
    navigatorRole:
      'Choose whether to judge delay by stage averages, supplier gap, or both. Keep the final story focused on root cause, not just noisy delays.',
    driverRole:
      'Use date arithmetic and grouped comparisons to measure stage duration, order duration, and supplier delay gap.',
    schema: {
      suppliers: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
        { col: 'lead_time_days', type: 'INTEGER' },
      ],
      order_suppliers: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'order_id', type: 'INTEGER' },
        { col: 'supplier_id', type: 'INTEGER' },
      ],
      fulfillment_log: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'order_id', type: 'INTEGER' },
        { col: 'stage', type: 'TEXT' },
        { col: 'started_at', type: 'TEXT' },
        { col: 'completed_at', type: 'TEXT' },
      ],
    },
    seed: `
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  lead_time_days INTEGER NOT NULL
);
INSERT INTO suppliers VALUES
  (1, 'swift_cargo', 2),
  (2, 'iron_haulers', 5),
  (3, 'coastal_freight', 3),
  (4, 'mire_runners', 8);

CREATE TABLE order_suppliers (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  supplier_id INTEGER NOT NULL
);
INSERT INTO order_suppliers VALUES
  (1, 1, 1), (2, 2, 2), (3, 3, 3), (4, 4, 2), (5, 5, 4), (6, 6, 1), (7, 7, 4);

CREATE TABLE fulfillment_log (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  stage TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL
);
INSERT INTO fulfillment_log VALUES
  (1, 1, 'pick', '1247-01-05', '1247-01-05'), (2, 1, 'pack', '1247-01-05', '1247-01-06'), (3, 1, 'ship', '1247-01-06', '1247-01-07'), (4, 1, 'deliver', '1247-01-07', '1247-01-08'),
  (5, 2, 'pick', '1247-01-08', '1247-01-09'), (6, 2, 'pack', '1247-01-09', '1247-01-10'), (7, 2, 'ship', '1247-01-10', '1247-01-14'), (8, 2, 'deliver', '1247-01-14', '1247-01-16'),
  (9, 3, 'pick', '1247-01-10', '1247-01-11'), (10, 3, 'pack', '1247-01-11', '1247-01-12'), (11, 3, 'ship', '1247-01-12', '1247-01-14'), (12, 3, 'deliver', '1247-01-14', '1247-01-15'),
  (13, 4, 'pick', '1247-01-15', '1247-01-16'), (14, 4, 'pack', '1247-01-16', '1247-01-17'), (15, 4, 'ship', '1247-01-17', '1247-01-22'), (16, 4, 'deliver', '1247-01-22', '1247-01-24'),
  (17, 5, 'pick', '1247-01-18', '1247-01-20'), (18, 5, 'pack', '1247-01-20', '1247-01-22'), (19, 5, 'ship', '1247-01-22', '1247-02-01'), (20, 5, 'deliver', '1247-02-01', '1247-02-05'),
  (21, 6, 'pick', '1247-02-01', '1247-02-01'), (22, 6, 'pack', '1247-02-01', '1247-02-02'), (23, 6, 'ship', '1247-02-02', '1247-02-03'), (24, 6, 'deliver', '1247-02-03', '1247-02-04'),
  (25, 7, 'pick', '1247-02-05', '1247-02-07'), (26, 7, 'pack', '1247-02-07', '1247-02-09'), (27, 7, 'ship', '1247-02-09', '1247-02-17'), (28, 7, 'deliver', '1247-02-17', '1247-02-20');
`,
    requirements: [
      'Measure average duration by stage.',
      'Measure total fulfillment days by order.',
      'Compare actual order duration to each supplier promise.',
      'Name the supplier creating the worst delay gap.',
    ],
    starterQueries: [
      {
        label: 'Stage Duration',
        query: `SELECT stage,
  ROUND(AVG(julianday(completed_at) - julianday(started_at)), 2) AS avg_days
FROM fulfillment_log
GROUP BY stage
ORDER BY avg_days DESC;`,
        desc: 'Shows which stage is slowest on average.',
      },
      {
        label: 'Order Duration',
        query: `SELECT order_id,
  ROUND(julianday(MAX(completed_at)) - julianday(MIN(started_at)), 1) AS total_days
FROM fulfillment_log
GROUP BY order_id
ORDER BY total_days DESC;`,
        desc: 'Shows which orders actually breached expectations.',
      },
      {
        label: 'Supplier Delay Gap',
        query: `WITH order_duration AS (
  SELECT order_id,
    julianday(MAX(completed_at)) - julianday(MIN(started_at)) AS total_days
  FROM fulfillment_log
  GROUP BY order_id
)
SELECT s.name, s.lead_time_days,
  ROUND(AVG(od.total_days), 1) AS avg_actual_days,
  ROUND(AVG(od.total_days) - s.lead_time_days, 1) AS delay_gap
FROM order_suppliers os
JOIN suppliers s ON s.id = os.supplier_id
JOIN order_duration od ON od.order_id = os.order_id
GROUP BY s.id, s.name, s.lead_time_days
ORDER BY delay_gap DESC;`,
        desc: 'Shows which supplier promise diverges most from reality.',
      },
    ],
    deliverables: [
      'A stage duration summary.',
      'An SLA breach list by order.',
      'A supplier gap report.',
      'A root-cause verdict naming the worst supplier.',
    ],
    tags: ['Supply Chain', 'Date Arithmetic', 'SLA', 'CTE'],
    quest: {
      id: 'AZ05',
      title: 'The Delay Gap',
      lore:
        'Azm has no patience for vague blame. He wants the supplier whose promises collapse hardest once the full order life is measured end to end.',
      answer: 'mire_runners',
      answerHint: 'Enter the supplier name in lowercase with underscore.',
      rank: 'Legendary',
      rankClass: 'border-gold/40 bg-gold/10 text-gold',
      diff: 4,
      xp: 280,
      finalClueLabel: 'Reveal the delay verdict',
      finalClueQuery: `WITH order_duration AS (
  SELECT order_id,
    julianday(MAX(completed_at)) - julianday(MIN(started_at)) AS total_days
  FROM fulfillment_log
  GROUP BY order_id
)
SELECT s.name
FROM order_suppliers os
JOIN suppliers s ON s.id = os.supplier_id
JOIN order_duration od ON od.order_id = os.order_id
GROUP BY s.id, s.name, s.lead_time_days
ORDER BY AVG(od.total_days) - s.lead_time_days DESC, s.name
LIMIT 1;`,
      finalClueDesc: 'The answer is the supplier whose promised lead time is most detached from actual fulfillment time.',
    },
  },
  {
    id: 'dc006',
    proposition: 6,
    title: 'The Discount Leak Ledger',
    leadRole: 'Driver',
    scenario:
      'Discount approvals are being ignored in the field. The pair must identify which bundle is leaking the most margin and which reps keep selling beyond approved markdown levels.',
    navigatorRole:
      'Define what counts as abuse: actual discount above approved discount, plus enough unit volume to matter.',
    driverRole:
      'Use price math, grouped sales totals, and a final leak calculation to name the offer creating the biggest unauthorized loss.',
    schema: {
      offers: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
        { col: 'list_price', type: 'INTEGER' },
        { col: 'current_price', type: 'INTEGER' },
      ],
      approvals: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'offer_id', type: 'INTEGER' },
        { col: 'approved_discount_pct', type: 'REAL' },
      ],
      reps: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
        { col: 'region', type: 'TEXT' },
      ],
      sales: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'offer_id', type: 'INTEGER' },
        { col: 'rep_id', type: 'INTEGER' },
        { col: 'units', type: 'INTEGER' },
        { col: 'sale_date', type: 'TEXT' },
      ],
    },
    seed: `
CREATE TABLE offers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  list_price INTEGER NOT NULL,
  current_price INTEGER NOT NULL
);
INSERT INTO offers VALUES
  (1, 'phoenix_bundle', 220, 140),
  (2, 'ember_crate', 180, 150),
  (3, 'harbor_pack', 95, 88),
  (4, 'night_kit', 130, 117);

CREATE TABLE approvals (
  id INTEGER PRIMARY KEY,
  offer_id INTEGER NOT NULL,
  approved_discount_pct REAL NOT NULL
);
INSERT INTO approvals VALUES
  (1, 1, 15.0),
  (2, 2, 12.0),
  (3, 3, 5.0),
  (4, 4, 10.0);

CREATE TABLE reps (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL
);
INSERT INTO reps VALUES
  (1, 'sel', 'north'),
  (2, 'vora', 'south'),
  (3, 'tarin', 'west');

CREATE TABLE sales (
  id INTEGER PRIMARY KEY,
  offer_id INTEGER NOT NULL,
  rep_id INTEGER NOT NULL,
  units INTEGER NOT NULL,
  sale_date TEXT NOT NULL
);
INSERT INTO sales VALUES
  (1, 1, 1, 18, '1247-02-15'), (2, 1, 2, 12, '1247-02-18'), (3, 1, 3, 10, '1247-03-03'),
  (4, 2, 1, 9, '1247-02-16'), (5, 2, 2, 11, '1247-03-01'),
  (6, 3, 3, 22, '1247-02-12'), (7, 3, 2, 8, '1247-03-05'),
  (8, 4, 1, 14, '1247-02-21'), (9, 4, 2, 9, '1247-03-06');
`,
    requirements: [
      'Calculate the actual discount percent for each offer.',
      'Show which offers exceed their approved discount level.',
      'Show discounted unit volume by rep.',
      'Name the offer leaking the most unauthorized revenue.',
    ],
    starterQueries: [
      {
        label: 'Actual Discount Table',
        query: `SELECT name, list_price, current_price,
  ROUND((list_price - current_price) * 100.0 / list_price, 1) AS actual_discount_pct
FROM offers
ORDER BY actual_discount_pct DESC;`,
        desc: 'Shows the markdown actually being given in the field.',
      },
      {
        label: 'Approval Breaches',
        query: `SELECT o.name,
  ROUND((o.list_price - o.current_price) * 100.0 / o.list_price, 1) AS actual_discount_pct,
  a.approved_discount_pct
FROM offers o
JOIN approvals a ON a.offer_id = o.id
WHERE ((o.list_price - o.current_price) * 100.0 / o.list_price) > a.approved_discount_pct
ORDER BY actual_discount_pct DESC;`,
        desc: 'Shows which offers are discounting beyond approval.',
      },
      {
        label: 'Rep Discount Volume',
        query: `SELECT r.name, SUM(s.units) AS discounted_units
FROM sales s
JOIN reps r ON r.id = s.rep_id
GROUP BY r.id, r.name
ORDER BY discounted_units DESC;`,
        desc: 'Shows who is moving the most discounted volume.',
      },
    ],
    deliverables: [
      'An actual-vs-approved discount table.',
      'A rep volume view.',
      'An unauthorized discount shortlist.',
      'A final answer naming the worst margin leak.',
    ],
    tags: ['Pricing', 'Discounts', 'Margin', 'Aggregation'],
    quest: {
      id: 'AZ06',
      title: 'The Margin Leak',
      lore:
        'Azm treats pricing drift like a breach in the wall. One bundle is leaking margin faster than the rest once approval limits and unit volume are combined.',
      answer: 'phoenix_bundle',
      answerHint: 'Enter the offer name in lowercase with underscore.',
      rank: 'Epic',
      rankClass: 'border-violet-500/50 bg-violet-500/10 text-violet-300',
      diff: 4,
      xp: 290,
      finalClueLabel: 'Reveal the leak verdict',
      finalClueQuery: `WITH leak AS (
  SELECT o.name,
    ((o.list_price - o.current_price) * 100.0 / o.list_price) - a.approved_discount_pct AS extra_discount_pct,
    SUM(s.units) AS total_units
  FROM offers o
  JOIN approvals a ON a.offer_id = o.id
  JOIN sales s ON s.offer_id = o.id
  GROUP BY o.id, o.name, o.list_price, o.current_price, a.approved_discount_pct
)
SELECT name
FROM leak
ORDER BY extra_discount_pct * total_units DESC, name
LIMIT 1;`,
      finalClueDesc: 'The worst leak is the offer where approval overage and sales volume multiply into the largest unauthorized hit.',
    },
  },
  {
    id: 'dc007',
    proposition: 7,
    title: 'The Return Rift',
    leadRole: 'Navigator',
    scenario:
      'Returns are climbing, but only a few customers are driving most of the cost. The pair must separate normal returns from abuse by looking at repeat patterns, reason codes, and support escalation volume.',
    navigatorRole:
      'Define a suspicious pattern before the Driver starts coding: high return rate, repeated damage reasons, and heavy ticket volume.',
    driverRole:
      'Use grouped comparisons and joined evidence to calculate return rate and identify the strongest abuse signal.',
    schema: {
      customers: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
      ],
      orders: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'customer_id', type: 'INTEGER' },
        { col: 'order_total', type: 'INTEGER' },
      ],
      returns: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'order_id', type: 'INTEGER' },
        { col: 'reason', type: 'TEXT' },
      ],
      tickets: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'customer_id', type: 'INTEGER' },
        { col: 'category', type: 'TEXT' },
      ],
    },
    seed: `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO customers VALUES
  (1, 'morrow'),
  (2, 'selene'),
  (3, 'brax'),
  (4, 'tallis');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_total INTEGER NOT NULL
);
INSERT INTO orders VALUES
  (1, 1, 240), (2, 1, 310), (3, 1, 275), (4, 1, 225),
  (5, 2, 190), (6, 2, 205), (7, 2, 180),
  (8, 3, 420), (9, 3, 390),
  (10, 4, 160), (11, 4, 175);

CREATE TABLE returns (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  reason TEXT NOT NULL
);
INSERT INTO returns VALUES
  (1, 1, 'damaged'), (2, 2, 'damaged'), (3, 3, 'damaged'), (4, 4, 'late'),
  (5, 6, 'wrong_item'),
  (6, 8, 'damaged'),
  (7, 10, 'size_issue');

CREATE TABLE tickets (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  category TEXT NOT NULL
);
INSERT INTO tickets VALUES
  (1, 1, 'refund'), (2, 1, 'refund'), (3, 1, 'damage_claim'), (4, 1, 'damage_claim'),
  (5, 2, 'refund'),
  (6, 3, 'damage_claim'),
  (7, 4, 'refund');
`,
    requirements: [
      'Count orders and returns by customer.',
      'Measure return rate by customer.',
      'Count support tickets and damage-claim tickets by customer.',
      'Name the customer whose behavior looks most abusive.',
    ],
    starterQueries: [
      {
        label: 'Orders vs Returns',
        query: `SELECT c.name, COUNT(DISTINCT o.id) AS order_count, COUNT(r.id) AS return_count
FROM customers c
JOIN orders o ON o.customer_id = c.id
LEFT JOIN returns r ON r.order_id = o.id
GROUP BY c.id, c.name
ORDER BY return_count DESC, order_count DESC;`,
        desc: 'Shows who returns the largest share of what they order.',
      },
      {
        label: 'Return Rate',
        query: `SELECT c.name,
  COUNT(r.id) * 1.0 / COUNT(DISTINCT o.id) AS return_rate
FROM customers c
JOIN orders o ON o.customer_id = c.id
LEFT JOIN returns r ON r.order_id = o.id
GROUP BY c.id, c.name
ORDER BY return_rate DESC, c.name;`,
        desc: 'Converts volume into rate so small customers do not hide behind low counts.',
      },
      {
        label: 'Ticket Pressure',
        query: `SELECT c.name,
  COUNT(t.id) AS ticket_count,
  SUM(CASE WHEN t.category = 'damage_claim' THEN 1 ELSE 0 END) AS damage_claims
FROM customers c
LEFT JOIN tickets t ON t.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY ticket_count DESC, damage_claims DESC;`,
        desc: 'Adds support burden to the return story.',
      },
    ],
    deliverables: [
      'An order vs return table.',
      'A customer return-rate table.',
      'A support escalation summary.',
      'A final abuse verdict naming the strongest suspect.',
    ],
    tags: ['Returns', 'Customer Analysis', 'CASE WHEN', 'Aggregation'],
    quest: {
      id: 'AZ07',
      title: 'The Refund Spiral',
      lore:
        'Azm thinks one customer has learned to weaponize the return desk. Find the person whose return rate and damage-claim pressure rise together too often to be random.',
      answer: 'morrow',
      answerHint: 'Enter the customer name in lowercase.',
      rank: 'Rare',
      rankClass: 'border-rune/40 bg-rune/10 text-rune',
      diff: 3,
      xp: 225,
      finalClueLabel: 'Reveal the abuse verdict',
      finalClueQuery: `WITH return_stats AS (
  SELECT c.id, c.name,
    COUNT(DISTINCT o.id) AS order_count,
    COUNT(r.id) AS return_count
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  LEFT JOIN returns r ON r.order_id = o.id
  GROUP BY c.id, c.name
),
ticket_stats AS (
  SELECT customer_id,
    COUNT(*) AS ticket_count,
    SUM(CASE WHEN category = 'damage_claim' THEN 1 ELSE 0 END) AS damage_claims
  FROM tickets
  GROUP BY customer_id
)
SELECT rs.name
FROM return_stats rs
JOIN ticket_stats ts ON ts.customer_id = rs.id
ORDER BY (rs.return_count * 1.0 / rs.order_count) DESC, ts.damage_claims DESC, ts.ticket_count DESC
LIMIT 1;`,
      finalClueDesc: 'The most suspicious customer blends a high return rate with a repeat pattern of damage claims and refund pressure.',
    },
  },
  {
    id: 'dc008',
    proposition: 8,
    title: 'The Overtime Apparition',
    leadRole: 'Driver',
    scenario:
      'Labor costs spiked after schedules were tightened. Leadership wants to know whether one team is absorbing too much overtime or whether the issue is spread across the floor.',
    navigatorRole:
      'Decide whether the story should focus on teams, people, or both. Keep the analysis tied to staffing decisions.',
    driverRole:
      'Compare scheduled hours to logged hours, aggregate overtime, and surface the team driving the largest overage.',
    schema: {
      teams: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
      ],
      employees: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
        { col: 'team_id', type: 'INTEGER' },
      ],
      schedules: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'employee_id', type: 'INTEGER' },
        { col: 'shift_hours', type: 'INTEGER' },
      ],
      clock_logs: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'employee_id', type: 'INTEGER' },
        { col: 'hours_worked', type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO teams VALUES
  (1, 'night_watch'),
  (2, 'harbor_shift'),
  (3, 'forge_line');

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  team_id INTEGER NOT NULL
);
INSERT INTO employees VALUES
  (1, 'serik', 1), (2, 'mira', 1),
  (3, 'tovan', 2), (4, 'elric', 2),
  (5, 'brin', 3), (6, 'cass', 3);

CREATE TABLE schedules (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  shift_hours INTEGER NOT NULL
);
INSERT INTO schedules VALUES
  (1, 1, 40), (2, 2, 40), (3, 3, 40), (4, 4, 40), (5, 5, 40), (6, 6, 40);

CREATE TABLE clock_logs (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  hours_worked INTEGER NOT NULL
);
INSERT INTO clock_logs VALUES
  (1, 1, 58), (2, 2, 54),
  (3, 3, 44), (4, 4, 42),
  (5, 5, 46), (6, 6, 45);
`,
    requirements: [
      'Compare scheduled hours to actual hours by employee.',
      'Sum overtime by employee.',
      'Sum overtime by team.',
      'Name the team carrying the heaviest overtime load.',
    ],
    starterQueries: [
      {
        label: 'Employee Hours Gap',
        query: `SELECT e.name, t.name AS team_name, s.shift_hours, c.hours_worked,
  c.hours_worked - s.shift_hours AS overtime_hours
FROM employees e
JOIN teams t ON t.id = e.team_id
JOIN schedules s ON s.employee_id = e.id
JOIN clock_logs c ON c.employee_id = e.id
ORDER BY overtime_hours DESC, e.name;`,
        desc: 'Shows the schedule gap for every employee.',
      },
      {
        label: 'Employee Overtime Totals',
        query: `SELECT e.name, SUM(c.hours_worked - s.shift_hours) AS overtime_hours
FROM employees e
JOIN schedules s ON s.employee_id = e.id
JOIN clock_logs c ON c.employee_id = e.id
GROUP BY e.id, e.name
ORDER BY overtime_hours DESC, e.name;`,
        desc: 'Shows who individually is carrying the most extra hours.',
      },
      {
        label: 'Team Overtime Totals',
        query: `SELECT t.name, SUM(c.hours_worked - s.shift_hours) AS overtime_hours
FROM teams t
JOIN employees e ON e.team_id = t.id
JOIN schedules s ON s.employee_id = e.id
JOIN clock_logs c ON c.employee_id = e.id
GROUP BY t.id, t.name
ORDER BY overtime_hours DESC, t.name;`,
        desc: 'Rolls overtime up to the staffing team level.',
      },
    ],
    deliverables: [
      'An employee hours-gap table.',
      'An overtime ranking by person.',
      'An overtime ranking by team.',
      'A final staffing verdict naming the most overloaded team.',
    ],
    tags: ['Workforce', 'Overtime', 'Aggregation', 'Operations'],
    quest: {
      id: 'AZ08',
      title: 'The Exhaustion Ledger',
      lore:
        'Azm sees payroll like a battlefield map. One team is soaking up more overtime than the rest, and the numbers have stopped being accidental.',
      answer: 'night_watch',
      answerHint: 'Enter the team name in lowercase with underscore.',
      rank: 'Rare',
      rankClass: 'border-rune/40 bg-rune/10 text-rune',
      diff: 3,
      xp: 230,
      finalClueLabel: 'Reveal the overtime verdict',
      finalClueQuery: `SELECT t.name
FROM teams t
JOIN employees e ON e.team_id = t.id
JOIN schedules s ON s.employee_id = e.id
JOIN clock_logs c ON c.employee_id = e.id
GROUP BY t.id, t.name
ORDER BY SUM(c.hours_worked - s.shift_hours) DESC, t.name
LIMIT 1;`,
      finalClueDesc: 'The answer is the team whose scheduled hours are most overwhelmed by real labor demand.',
    },
  },
  {
    id: 'dc009',
    proposition: 9,
    title: 'The Route Profit Atlas',
    leadRole: 'Navigator',
    scenario:
      'Shipping revenue looks healthy, but route margins say otherwise. The pair must identify which lane is quietly destroying profit once transport costs are fully loaded.',
    navigatorRole:
      'Define the profit story clearly: revenue minus total route cost, not just revenue alone.',
    driverRole:
      'Join revenue to route costs, calculate net margin, and isolate the route that needs to be rerouted or repriced first.',
    schema: {
      routes: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
      ],
      shipments: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'route_id', type: 'INTEGER' },
        { col: 'revenue', type: 'INTEGER' },
      ],
      route_costs: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'route_id', type: 'INTEGER' },
        { col: 'fuel_cost', type: 'INTEGER' },
        { col: 'crew_cost', type: 'INTEGER' },
        { col: 'toll_cost', type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE routes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO routes VALUES
  (1, 'ash_span'),
  (2, 'harbor_arc'),
  (3, 'mire_run'),
  (4, 'silver_pass');

CREATE TABLE shipments (
  id INTEGER PRIMARY KEY,
  route_id INTEGER NOT NULL,
  revenue INTEGER NOT NULL
);
INSERT INTO shipments VALUES
  (1, 1, 320), (2, 1, 290), (3, 1, 310),
  (4, 2, 500), (5, 2, 520),
  (6, 3, 420), (7, 3, 405),
  (8, 4, 610), (9, 4, 590);

CREATE TABLE route_costs (
  id INTEGER PRIMARY KEY,
  route_id INTEGER NOT NULL,
  fuel_cost INTEGER NOT NULL,
  crew_cost INTEGER NOT NULL,
  toll_cost INTEGER NOT NULL
);
INSERT INTO route_costs VALUES
  (1, 1, 240, 170, 60),
  (2, 2, 180, 120, 40),
  (3, 3, 210, 140, 45),
  (4, 4, 190, 130, 35);
`,
    requirements: [
      'Aggregate shipment revenue by route.',
      'Aggregate total cost by route.',
      'Calculate net margin by route.',
      'Name the route that needs intervention first.',
    ],
    starterQueries: [
      {
        label: 'Revenue by Route',
        query: `SELECT r.name, SUM(s.revenue) AS total_revenue
FROM routes r
JOIN shipments s ON s.route_id = r.id
GROUP BY r.id, r.name
ORDER BY total_revenue DESC;`,
        desc: 'Shows the tempting top-line story before cost is loaded in.',
      },
      {
        label: 'Cost by Route',
        query: `SELECT r.name, rc.fuel_cost + rc.crew_cost + rc.toll_cost AS total_cost
FROM routes r
JOIN route_costs rc ON rc.route_id = r.id
ORDER BY total_cost DESC;`,
        desc: 'Shows the operating burden for each lane.',
      },
      {
        label: 'Net Margin by Route',
        query: `WITH revenue AS (
  SELECT route_id, SUM(revenue) AS total_revenue
  FROM shipments
  GROUP BY route_id
)
SELECT r.name, rev.total_revenue,
  rc.fuel_cost + rc.crew_cost + rc.toll_cost AS total_cost,
  rev.total_revenue - (rc.fuel_cost + rc.crew_cost + rc.toll_cost) AS net_margin
FROM routes r
JOIN revenue rev ON rev.route_id = r.id
JOIN route_costs rc ON rc.route_id = r.id
ORDER BY net_margin ASC, r.name;`,
        desc: 'Shows which lane hurts profit once cost is included.',
      },
    ],
    deliverables: [
      'A revenue view by route.',
      'A cost view by route.',
      'A net margin ranking.',
      'A final route intervention recommendation.',
    ],
    tags: ['Logistics', 'Margin', 'CTE', 'Operations'],
    quest: {
      id: 'AZ09',
      title: 'The Margin Atlas',
      lore:
        'Azm cares less about noisy revenue than survivable lanes. Find the route whose margin collapses first once fuel, crew, and tolls are loaded against real shipment revenue.',
      answer: 'ash_span',
      answerHint: 'Enter the route name in lowercase with underscore.',
      rank: 'Epic',
      rankClass: 'border-violet-500/50 bg-violet-500/10 text-violet-300',
      diff: 4,
      xp: 300,
      finalClueLabel: 'Reveal the route verdict',
      finalClueQuery: `WITH revenue AS (
  SELECT route_id, SUM(revenue) AS total_revenue
  FROM shipments
  GROUP BY route_id
)
SELECT r.name
FROM routes r
JOIN revenue rev ON rev.route_id = r.id
JOIN route_costs rc ON rc.route_id = r.id
ORDER BY rev.total_revenue - (rc.fuel_cost + rc.crew_cost + rc.toll_cost) ASC, r.name
LIMIT 1;`,
      finalClueDesc: 'The route that needs intervention first is the one with the weakest net margin, not the one with the lowest revenue.',
    },
  },
  {
    id: 'dc010',
    proposition: 10,
    title: 'The Defect Council',
    leadRole: 'Driver',
    scenario:
      'Quality failures are creeping into inventory. The pair must compare suppliers on defects, rework, and claims cost to identify which source is quietly poisoning downstream margin.',
    navigatorRole:
      'Define the standard up front: raw defects are not enough; rework and claims cost must influence the verdict.',
    driverRole:
      'Join lots, inspections, and claims into a defect-adjusted cost view, then isolate the supplier with the worst downstream impact.',
    schema: {
      suppliers: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'name', type: 'TEXT' },
      ],
      lots: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'supplier_id', type: 'INTEGER' },
        { col: 'units_received', type: 'INTEGER' },
      ],
      inspections: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'lot_id', type: 'INTEGER' },
        { col: 'defects_found', type: 'INTEGER' },
        { col: 'rework_cost', type: 'INTEGER' },
      ],
      claims: [
        { col: 'id', type: 'INTEGER', pk: true },
        { col: 'lot_id', type: 'INTEGER' },
        { col: 'claim_amount', type: 'INTEGER' },
      ],
    },
    seed: `
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO suppliers VALUES
  (1, 'brass_harbor'),
  (2, 'stone_quarry'),
  (3, 'silver_reach'),
  (4, 'torch_mill');

CREATE TABLE lots (
  id INTEGER PRIMARY KEY,
  supplier_id INTEGER NOT NULL,
  units_received INTEGER NOT NULL
);
INSERT INTO lots VALUES
  (1, 1, 300), (2, 1, 260),
  (3, 2, 420), (4, 2, 390),
  (5, 3, 280), (6, 3, 310),
  (7, 4, 350), (8, 4, 340);

CREATE TABLE inspections (
  id INTEGER PRIMARY KEY,
  lot_id INTEGER NOT NULL,
  defects_found INTEGER NOT NULL,
  rework_cost INTEGER NOT NULL
);
INSERT INTO inspections VALUES
  (1, 1, 24, 180), (2, 2, 20, 160),
  (3, 3, 10, 70), (4, 4, 8, 55),
  (5, 5, 7, 45), (6, 6, 6, 42),
  (7, 7, 12, 95), (8, 8, 11, 88);

CREATE TABLE claims (
  id INTEGER PRIMARY KEY,
  lot_id INTEGER NOT NULL,
  claim_amount INTEGER NOT NULL
);
INSERT INTO claims VALUES
  (1, 1, 240), (2, 2, 210),
  (3, 3, 65), (4, 4, 50),
  (5, 5, 35), (6, 6, 30),
  (7, 7, 90), (8, 8, 80);
`,
    requirements: [
      'Aggregate defects by supplier.',
      'Aggregate rework and claims cost by supplier.',
      'Calculate a defect-adjusted cost signal by supplier.',
      'Name the supplier with the worst quality impact.',
    ],
    starterQueries: [
      {
        label: 'Defects by Supplier',
        query: `SELECT s.name, SUM(i.defects_found) AS total_defects
FROM suppliers s
JOIN lots l ON l.supplier_id = s.id
JOIN inspections i ON i.lot_id = l.id
GROUP BY s.id, s.name
ORDER BY total_defects DESC;`,
        desc: 'Shows raw defect volume by supplier.',
      },
      {
        label: 'Quality Cost by Supplier',
        query: `SELECT s.name,
  SUM(i.rework_cost) AS total_rework_cost,
  SUM(c.claim_amount) AS total_claim_cost
FROM suppliers s
JOIN lots l ON l.supplier_id = s.id
JOIN inspections i ON i.lot_id = l.id
JOIN claims c ON c.lot_id = l.id
GROUP BY s.id, s.name
ORDER BY total_rework_cost + total_claim_cost DESC;`,
        desc: 'Adds the financial cost of poor quality to the picture.',
      },
      {
        label: 'Defect-Adjusted Impact',
        query: `SELECT s.name,
  SUM(i.defects_found) AS total_defects,
  SUM(i.rework_cost + c.claim_amount) AS total_quality_cost
FROM suppliers s
JOIN lots l ON l.supplier_id = s.id
JOIN inspections i ON i.lot_id = l.id
JOIN claims c ON c.lot_id = l.id
GROUP BY s.id, s.name
ORDER BY total_quality_cost DESC, total_defects DESC;`,
        desc: 'Combines the operational and financial side of supplier quality.',
      },
    ],
    deliverables: [
      'A defect-volume table.',
      'A rework and claims cost table.',
      'A defect-adjusted supplier ranking.',
      'A final supplier quality verdict.',
    ],
    tags: ['Quality', 'Claims', 'Aggregation', 'Operations'],
    quest: {
      id: 'AZ10',
      title: 'The Supplier Reckoning',
      lore:
        'Azm wants the supplier whose defects keep echoing after receipt. Find the source whose lots create the worst combined burden of defects, rework, and claims.',
      answer: 'brass_harbor',
      answerHint: 'Enter the supplier name in lowercase with underscore.',
      rank: 'Epic',
      rankClass: 'border-violet-500/50 bg-violet-500/10 text-violet-300',
      diff: 4,
      xp: 310,
      finalClueLabel: 'Reveal the supplier verdict',
      finalClueQuery: `SELECT s.name
FROM suppliers s
JOIN lots l ON l.supplier_id = s.id
JOIN inspections i ON i.lot_id = l.id
JOIN claims c ON c.lot_id = l.id
GROUP BY s.id, s.name
ORDER BY SUM(i.rework_cost + c.claim_amount) DESC, SUM(i.defects_found) DESC, s.name
LIMIT 1;`,
      finalClueDesc: 'The worst supplier is the one whose quality failures create the largest combined downstream cost.',
    },
  },
]
