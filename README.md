# ⚔️ SQL Dungeon: The Query Chronicles

**SQL Dungeon** is a gamified web platform that transforms advanced T-SQL learning into an immersive RPG experience. Designed for CS majors, this project replaces traditional database drills with narrative-driven "SQLNOIR" mysteries, XP-based progression, and high-stakes "Guild Contracts."

---

## 🎮 The Core Mechanic: Gamified Learning

In this dungeon, your SQL queries are your weapons.
* **XP System:** Every successful query earns you Experience Points (XP).
* **Secret Unlocks:** Accumulating XP allows you to unlock "Secret Boss" levels—highly complex SQL challenges that test the limits of your optimization skills.
* **The Leaderboard:** A live ranking system to see which "Data Architect" has claimed the most XP across the platform.

---

## 🗺️ The Quest Pipelines (Part 1: Individual Mysteries)

The project features 20 multi-part "SQLNOIR" mysteries divided into two distinct campaigns. Each mystery follows a 4-step structure: gathering clues, joining datasets, applying advanced functions, and a final optimized master query.

### 🗡️ Azm Quests (10 Chapters)
A specialized pipeline focusing on deep-dive data forensics.
* **Focus:** Narrative-driven puzzles involving suspect identification and transaction anomalies.
* **Technical Goal:** Mastery of **CTEs (Common Table Expressions)** and complex **Joins**.

### 🛡️ Kazi Quests (10 Chapters)
A parallel campaign exploring diverse datasets and edge-case scenarios.
* **Focus:** Pattern recognition and detecting "data crimes" within large-scale inventory and sales systems.
* **Technical Goal:** Application of **Window Functions** (`RANK`, `LEAD/LAG`) and **Subqueries**.

---

## 📜 The Guild Contracts (Part 2: Paired Problem-Solving)

The **Guild Contracts** are 10 high-level "Proposition Questions" that simulate real-world software development and consulting.

* **Format:** Paired programming (Driver/Navigator roles).
* **Objective:** Solve 10 real-life implementations, such as fraud detection algorithms, inventory forecasting, and customer churn analysis.
* **Deliverable:** A collaborative SQL Notebook documenting the business requirement, the technical solution, and the final insights.

---

## 🛠️ Technical Arsenal

* **Frontend:** Next.js (for the interactive UI and leaderboard)
* **Backend:** Node.js 
* **Database:** SQL Server (T-SQL) & Supabase (for XP/User tracking)
* **Tools:** Azure Data Studio / VS Code Notebooks
* **Deployment:** Render / Vercel

---

## 🚀 Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/your-username/sql-dungeon.git](https://github.com/your-username/sql-dungeon.git)
    ```
2.  **Environment Configuration:**
    Create a `.env` file and link your SQL Server connection strings and Supabase API keys.
3.  **Run Development Server:**
    ```bash
    npm install
    npm run dev
    ```
4.  **Database Attachment:**
    Ensure the `AdventureWorks` or provided custom datasets are attached to your local SQL instance to execute the quest queries.

---

### 🏆 Learning Objectives
This project demonstrates proficiency in:
* **Advanced T-SQL:** Recursive CTEs, Window Functions, and User-Defined Functions.
* **Optimization:** Writing performant queries for large datasets.
* **Soft Skills:** Collaborative problem solving and "Business Stakeholder" communication.
