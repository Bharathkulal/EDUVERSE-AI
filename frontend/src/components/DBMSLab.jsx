import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Table, Key, GitMerge, RefreshCw, Award, Zap,
  Play, Pause, RotateCcw, Eye, Terminal, ArrowLeft, BookOpen,
  Monitor, Home, ChevronRight, Search
} from 'lucide-react';
import './DBMSLab.css';

// ═══════════════════════════════════════════════════════════
// DBMS DATA SET
// ═══════════════════════════════════════════════════════════
const DBMS_DATA = [
  {
    id: 'basics',
    title: 'Database Basics',
    Icon: Database,
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #2563EB, #06B6D4)',
    description: 'Understand databases, schemas, tables, fields, and records.',
    difficulty: 'beginner',
    duration: '10 min',
    xp: 100,
    topics: [
      {
        id: 'table-viz',
        title: 'Table Operations Visualizer',
        vizType: 'tableViz',
        steps: 5,
        preview: 'Visualize SQL operations like INSERT, UPDATE, DELETE, and SELECT in a live table.',
        code: `-- Database Table Operations Demo\n\n-- Step 1: SELECT initial state\nSELECT * FROM users;\n\n-- Step 2: INSERT a new record\nINSERT INTO users (id, name, role) \nVALUES (3, 'Charlie', 'Editor');\n\n-- Step 3: UPDATE an existing record\nUPDATE users SET role = 'Lead' \nWHERE id = 2;\n\n-- Step 4: DELETE a record\nDELETE FROM users WHERE id = 1;\n\n-- Step 5: SELECT final filter\nSELECT * FROM users WHERE role = 'Lead';`,
        stepLabels: ['Select *', 'Insert', 'Update', 'Delete', 'Select Filter'],
        stepDescriptions: [
          'Initial query scans and displays all current records from the "users" table. We have 2 records initially.',
          'An INSERT operation adds a brand-new row to the end of the table with ID 3 (Charlie). Watch the row slide in!',
          'An UPDATE command locates the row matching id = 2 (Bob) and updates his role cell to "Lead" with a pulse glow effect.',
          'A DELETE command removes the row where id = 1 (Alice). Watch her record dissolve from the table.',
          'Finally, SELECT with WHERE role = "Lead" filters the table, highlighting and returning only the matching rows.'
        ]
      }
    ]
  },
  {
    id: 'constraints',
    title: 'Keys & Constraints',
    Icon: Key,
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
    description: 'Master Primary Keys, Foreign Keys, Unique constraints, and referential integrity.',
    difficulty: 'intermediate',
    duration: '15 min',
    xp: 150,
    topics: [
      {
        id: 'key-constraints',
        title: 'Keys & Referential Integrity',
        vizType: 'keyConstraintViz',
        steps: 4,
        preview: 'Explore Primary Keys, duplicate errors, and Foreign Key constraints linking tables.',
        code: `-- Keys & Integrity constraints\n\n-- Step 1: Identify Primary Keys\n-- users.id (PK) must be unique and non-null\n\n-- Step 2: Insert Duplicate Key Error\nINSERT INTO users (id, name) VALUES (2, 'Error'); \n-- Throws duplicate entry exception!\n\n-- Step 3: Referential Link (Foreign Key)\n-- orders.user_id references users.id (FK)\n\n-- Step 4: Delete with cascade / restrict constraint\nDELETE FROM users WHERE id = 2;\n-- Throws integrity violation or cascades deletions!`,
        stepLabels: ['Primary Keys', 'Duplicate Error', 'Foreign Keys', 'Integrity Restrict'],
        stepDescriptions: [
          'Primary Keys uniquely identify every row. Notice the "id" columns marked with PK badge in both tables.',
          'Trying to INSERT a user with id = 2 throws a Unique Violation error because id 2 (Bob) already exists! Observe the duplicate entry shake.',
          'Foreign Keys create relation lines between tables. Orders table has a user_id column (FK) pointing to Users table id.',
          'Deleting Bob (id = 2) is blocked or cascades because Order 101 relies on Bob. Removing him directly breaks referential integrity!'
        ]
      }
    ]
  },
  {
    id: 'joins',
    title: 'JOIN Lab',
    Icon: GitMerge,
    color: '#60A5FA',
    gradient: 'linear-gradient(135deg, #60A5FA, #2563EB)',
    description: 'Learn how to combine fields from multiple tables using INNER, LEFT, RIGHT, and FULL JOINs.',
    difficulty: 'intermediate',
    duration: '20 min',
    xp: 200,
    topics: [
      {
        id: 'join-lab',
        title: 'Interactive JOIN Lab',
        vizType: 'joinViz',
        steps: 4,
        preview: 'See how rows from Users and Orders connect and combine under different JOIN commands.',
        code: `-- Interactive JOIN Types\n\n-- Mode 1: INNER JOIN (Only matching IDs)\nSELECT u.name, o.item FROM users u \nINNER JOIN orders o ON u.id = o.user_id;\n\n-- Mode 2: LEFT JOIN (All users, match orders)\nSELECT u.name, o.item FROM users u \nLEFT JOIN orders o ON u.id = o.user_id;\n\n-- Mode 3: RIGHT JOIN (All orders, match users)\nSELECT u.name, o.item FROM users u \nRIGHT JOIN orders o ON u.id = o.user_id;\n\n-- Mode 4: FULL JOIN (All records from both sides)\nSELECT u.name, o.item FROM users u \nFULL OUTER JOIN orders o ON u.id = o.user_id;`,
        stepLabels: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'],
        stepDescriptions: [
          'INNER JOIN matches rows where users.id equals orders.user_id. Unmatched rows (Alice, Order 102) are excluded.',
          'LEFT JOIN returns ALL rows from the left table (Users), plus matched right rows. Unmatched user Alice gets NULL for item.',
          'RIGHT JOIN returns ALL rows from the right table (Orders), plus matched left rows. Unmatched order 102 gets NULL for user name.',
          'FULL OUTER JOIN returns all rows from both tables. Missing matches on either side are filled with NULL values.'
        ]
      }
    ]
  },
  {
    id: 'transactions',
    title: 'Transaction Simulator',
    Icon: RefreshCw,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    description: 'Explore transactions, ACID properties, commits, and rollbacks step-by-step.',
    difficulty: 'advanced',
    duration: '15 min',
    xp: 250,
    topics: [
      {
        id: 'transaction-sim',
        title: 'ACID Transaction Simulator',
        vizType: 'transactionViz',
        steps: 5,
        preview: 'Simulate a bank transfer to inspect Atomicity, Consistency, Isolation, and Durability.',
        code: `-- Bank Transfer Transaction simulation\n\nSTART TRANSACTION;\n\n-- Step 1: Debit Account A\nUPDATE accounts SET balance = balance - 100 \nWHERE id = 'A';\n\n-- Step 2: Credit Account B\nUPDATE accounts SET balance = balance + 100 \nWHERE id = 'B';\n\n-- Step 3: Commit OR Rollback on failure\nCOMMIT; -- Durably saves changes\n-- OR ROLLBACK; -- Restores original state`,
        stepLabels: ['Start TX', 'Debit A', 'Credit B', 'Commit (Success)', 'Rollback (Failure)'],
        stepDescriptions: [
          'A transaction starts (START TRANSACTION). Changes remain isolated inside the transaction buffer, invisible to others.',
          'Debit $100 from Account A. Balance drops. The transaction is in-flight, not yet permanent.',
          'Credit $100 to Account B. Balance increases. Money is balanced; transaction is ready to be committed.',
          'COMMIT commits changes to disk. Atomicity is secured (both updates succeed). Consistency/Durability verified!',
          'If a failure occurs before Commit (e.g. system crash), ROLLBACK undoes all changes, restoring initial balances.'
        ]
      }
    ]
  },
  { id: 'sql-playground', title: 'SQL Playground', Icon: Terminal, color: '#64748B', gradient: 'linear-gradient(135deg, #64748B, #475569)', description: 'Interactive SQL execution arena (Phase 2)', difficulty: 'intermediate', duration: 'Locked', xp: 200, locked: true, topics: [] },
  { id: 'normalization', title: 'Normalization Studio', Icon: Table, color: '#7C3AED', gradient: 'linear-gradient(135deg, #7C3AED, #EC4899)', description: 'Step-by-step normalization guide (Phase 2)', difficulty: 'advanced', duration: 'Locked', xp: 250, locked: true, topics: [] },
  { id: 'indexing', title: 'Indexing Explorer', Icon: Search, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', description: 'Scan vs B-Tree indexing visuals (Phase 2)', difficulty: 'advanced', duration: 'Locked', xp: 300, locked: true, topics: [] },
  { id: 'er-builder', title: 'ER Diagram Builder', Icon: Home, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #B91C1C)', description: 'Interactive React Flow builder (Phase 2)', difficulty: 'intermediate', duration: 'Locked', xp: 200, locked: true, topics: [] }
];

// ═══════════════════════════════════════════════════════════
// SVG VISUALIZATIONS
// ═══════════════════════════════════════════════════════════

// 1. Table Visualizer
function TableViz({ step }) {
  const users = [
    { id: 1, name: 'Alice', role: 'Admin', opacity: step >= 3 ? 0.2 : 1, deleted: step === 3 },
    { id: 2, name: 'Bob', role: step >= 2 ? 'Lead' : 'User', opacity: 1, updated: step === 2, selected: step === 4 },
    { id: 3, name: 'Charlie', role: 'Editor', opacity: step >= 1 ? 1 : 0, inserted: step === 1 }
  ];

  return (
    <svg viewBox="0 0 500 280" className="db-viz-svg">
      <defs>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Table Card wrapper */}
      <rect x="20" y="10" width="460" height="240" rx="12" fill="var(--db-card)" stroke="var(--db-border)" strokeWidth="1" filter="url(#shadow)" />
      
      {/* Table Header */}
      <rect x="20" y="10" width="460" height="45" rx="12" fill="var(--db-primary)" opacity="0.9" />
      <text x="40" y="38" fill="white" fontWeight="700" fontSize="13" fontFamily="Fira Code, monospace">ID</text>
      <text x="140" y="38" fill="white" fontWeight="700" fontSize="13" fontFamily="Fira Code, monospace">Name</text>
      <text x="280" y="38" fill="white" fontWeight="700" fontSize="13" fontFamily="Fira Code, monospace">Role</text>

      {/* Rows */}
      {users.map((u, i) => {
        const rowY = 55 + i * 55;
        let strokeColor = "var(--db-border)";
        let strokeWidth = 1;
        let pulseClass = "";

        if (u.inserted && step === 1) { pulseClass = "anim-pulse-glow"; strokeColor = "var(--db-primary)"; strokeWidth = 2; }
        if (u.updated && step === 2) { pulseClass = "anim-pulse-glow"; strokeColor = "var(--db-warning)"; strokeWidth = 2; }
        if (u.deleted && step === 3) { strokeColor = "var(--db-danger)"; strokeWidth = 2; }
        if (u.selected && step === 4) { strokeColor = "var(--db-success)"; strokeWidth = 2.5; }

        return (
          <g key={u.id} style={{ opacity: u.opacity, transition: 'opacity 0.5s ease' }}>
            <rect
              className={pulseClass}
              x="25"
              y={rowY}
              width="450"
              height="48"
              rx="8"
              fill={u.selected && step === 4 ? "rgba(16, 185, 129, 0.08)" : "var(--db-card)"}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <text x="40" y={rowY + 28} fill="var(--db-text)" fontSize="13" fontWeight="600" fontFamily="Fira Code, monospace">{u.id}</text>
            <text x="140" y={rowY + 28} fill="var(--db-text)" fontSize="13" fontWeight="600">{u.name}</text>
            
            {/* Updated Cell Glow */}
            {u.updated && step === 2 ? (
              <g>
                <rect x="270" y={rowY + 10} width="100" height="28" rx="6" fill="rgba(245, 158, 11, 0.2)" stroke="var(--db-warning)" strokeWidth="1.5" />
                <text x="280" y={rowY + 28} fill="var(--db-warning)" fontSize="13" fontWeight="700" fontFamily="Fira Code, monospace">{u.role}</text>
              </g>
            ) : (
              <text x="280" y={rowY + 28} fill="var(--db-text)" fontSize="13">{u.role}</text>
            )}
          </g>
        );
      })}

      {/* Delete Strike-through */}
      {step === 3 && (
        <line x1="30" y1="89" x2="470" y2="89" stroke="var(--db-danger)" strokeWidth="2.5" strokeDasharray="5,4" />
      )}
    </svg>
  );
}

// 2. Keys & Constraints
function KeyConstraintViz({ step }) {
  const isErr = step === 1;

  return (
    <svg viewBox="0 0 520 280" className={`db-viz-svg ${isErr ? 'anim-shake' : ''}`}>
      {/* Table 1: Users */}
      <g transform="translate(10, 20)">
        <rect x="0" y="0" width="220" height="220" rx="12" fill="var(--db-card)" stroke={isErr ? "var(--db-danger)" : "var(--db-border)"} strokeWidth={isErr ? 2 : 1} />
        <rect x="0" y="0" width="220" height="40" rx="12" fill="var(--db-primary)" />
        <text x="110" y="25" textAnchor="middle" fill="white" fontWeight="700" fontSize="13">Users Table</text>

        {/* Row 1 (PK) */}
        <rect x="5" y="45" width="210" height="40" rx="6" fill="rgba(37, 99, 235, 0.05)" stroke="var(--db-primary)" strokeWidth="1.5" />
        <text x="15" y="69" fill="var(--db-text)" fontSize="11" fontWeight="700">id [PK]</text>
        <text x="150" y="69" fill="var(--db-primary)" fontSize="11" fontWeight="700">2 (Bob)</text>

        {/* Row 2 */}
        <rect x="5" y="90" width="210" height="40" rx="6" fill="var(--db-card)" stroke="var(--db-border)" />
        <text x="15" y="114" fill="var(--db-text)" fontSize="11">name</text>
        <text x="150" y="114" fill="var(--db-muted)" fontSize="11">Alice</text>

        {/* Duplicate Error Insert */}
        {step === 1 && (
          <g>
            <rect x="5" y="135" width="210" height="40" rx="6" fill="rgba(239, 68, 68, 0.05)" stroke="var(--db-danger)" strokeWidth="1.5" />
            <text x="15" y="159" fill="var(--db-danger)" fontSize="11" fontWeight="750">id [PK] DUPL</text>
            <text x="150" y="159" fill="var(--db-danger)" fontSize="11" fontWeight="750">2 (Error)</text>
            <text x="110" y="200" textAnchor="middle" fill="var(--db-danger)" fontSize="10" fontWeight="700">Duplicate Key Violation!</text>
          </g>
        )}
      </g>

      {/* Table 2: Orders */}
      <g transform="translate(290, 20)">
        <rect x="0" y="0" width="220" height="220" rx="12" fill="var(--db-card)" stroke="var(--db-border)" strokeWidth="1" />
        <rect x="0" y="0" width="220" height="40" rx="12" fill="#06B6D4" />
        <text x="110" y="25" textAnchor="middle" fill="white" fontWeight="700" fontSize="13">Orders Table</text>

        {/* Row 1 (PK) */}
        <rect x="5" y="45" width="210" height="40" rx="6" fill="var(--db-card)" stroke="var(--db-border)" />
        <text x="15" y="69" fill="var(--db-text)" fontSize="11">order_id [PK]</text>
        <text x="150" y="69" fill="var(--db-muted)" fontSize="11">101</text>

        {/* Row 2 (FK) */}
        <rect x="5" y="90" width="210" height="40" rx="6" fill="rgba(6, 182, 212, 0.05)" stroke="#06B6D4" strokeWidth="1.5" />
        <text x="15" y="114" fill="var(--db-text)" fontSize="11" fontWeight="700">user_id [FK]</text>
        <text x="150" y="114" fill="#06B6D4" fontSize="11" fontWeight="700">2</text>

        {step === 3 && (
          <g>
            <rect x="5" y="145" width="210" height="48" rx="6" fill="rgba(239, 68, 68, 0.05)" stroke="var(--db-danger)" strokeWidth="1.5" />
            <text x="15" y="165" fill="var(--db-danger)" fontSize="9" fontWeight="700">Integrity Restrict Error!</text>
            <text x="15" y="180" fill="var(--db-muted)" fontSize="8.5">Cannot delete row ref by FK</text>
          </g>
        )}
      </g>

      {/* Relational Link arrow */}
      {step >= 2 && (
        <g style={{ opacity: 1, transition: 'all 0.5s' }}>
          <path d="M 295 130 C 250 130, 250 85, 225 85" fill="transparent" stroke="var(--db-primary)" strokeWidth="2.5" strokeDasharray={step === 3 ? "5,3" : "0"} />
          <polygon points="225,85 231,81 231,89" fill="var(--db-primary)" />
        </g>
      )}
    </svg>
  );
}

// 3. JOIN Lab
function JoinViz({ step }) {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];

  const orders = [
    { order_id: 101, user_id: 2, item: 'Laptop' },
    { order_id: 102, user_id: 3, item: 'Phone' }
  ];

  // Render combined results based on JOIN selection
  let results = [];
  if (step === 0) { // INNER
    results = [{ name: 'Bob', item: 'Laptop' }];
  } else if (step === 1) { // LEFT
    results = [
      { name: 'Alice', item: 'NULL' },
      { name: 'Bob', item: 'Laptop' }
    ];
  } else if (step === 2) { // RIGHT
    results = [
      { name: 'Bob', item: 'Laptop' },
      { name: 'NULL', item: 'Phone' }
    ];
  } else if (step === 3) { // FULL
    results = [
      { name: 'Alice', item: 'NULL' },
      { name: 'Bob', item: 'Laptop' },
      { name: 'NULL', item: 'Phone' }
    ];
  }

  return (
    <svg viewBox="0 0 540 320" className="db-viz-svg">
      {/* Left Table: Users */}
      <g transform="translate(10, 10)">
        <rect x="0" y="0" width="140" height="110" rx="8" fill="var(--db-card)" stroke="var(--db-border)" />
        <rect x="0" y="0" width="140" height="28" rx="8" fill="var(--db-primary)" />
        <text x="70" y="18" textAnchor="middle" fill="white" fontWeight="700" fontSize="11">Users</text>
        {users.map((u, i) => (
          <g key={u.id} transform={`translate(0, ${28 + i * 36})`}>
            <rect x="2" y="2" width="136" height="32" rx="4" fill="var(--db-card)" stroke="var(--db-border)" />
            <text x="10" y="21" fill="var(--db-text)" fontSize="10" fontWeight="700">ID: {u.id}</text>
            <text x="50" y="21" fill="var(--db-text)" fontSize="10">{u.name}</text>
          </g>
        ))}
      </g>

      {/* Right Table: Orders */}
      <g transform="translate(390, 10)">
        <rect x="0" y="0" width="140" height="110" rx="8" fill="var(--db-card)" stroke="var(--db-border)" />
        <rect x="0" y="0" width="140" height="28" rx="8" fill="#06B6D4" />
        <text x="70" y="18" textAnchor="middle" fill="white" fontWeight="700" fontSize="11">Orders</text>
        {orders.map((o, i) => (
          <g key={o.order_id} transform={`translate(0, ${28 + i * 36})`}>
            <rect x="2" y="2" width="136" height="32" rx="4" fill="var(--db-card)" stroke="var(--db-border)" />
            <text x="8" y="21" fill="#06B6D4" fontSize="9" fontWeight="700">UID: {o.user_id}</text>
            <text x="50" y="21" fill="var(--db-text)" fontSize="9">{o.item}</text>
          </g>
        ))}
      </g>

      {/* Animated Connection Lines */}
      {step === 0 && <line x1="150" y1="88" x2="390" y2="54" stroke="var(--db-success)" strokeWidth="2.5" strokeDasharray="4,2" />}
      {step === 1 && (
        <g>
          <line x1="150" y1="52" x2="390" y2="52" stroke="var(--db-danger)" strokeWidth="1.5" strokeDasharray="4,4" />
          <line x1="150" y1="88" x2="390" y2="54" stroke="var(--db-success)" strokeWidth="2.5" />
        </g>
      )}
      {step === 2 && (
        <g>
          <line x1="150" y1="88" x2="390" y2="54" stroke="var(--db-success)" strokeWidth="2.5" />
          <line x1="150" y1="88" x2="390" y2="90" stroke="var(--db-danger)" strokeWidth="1.5" strokeDasharray="4,4" />
        </g>
      )}

      {/* Result Table Panel */}
      <g transform="translate(110, 160)">
        <rect x="0" y="0" width="320" height="145" rx="10" fill="var(--db-card)" stroke="var(--db-border)" strokeWidth="1.5" />
        <rect x="0" y="0" width="320" height="30" rx="10" fill="var(--db-success)" />
        <text x="160" y="19" textAnchor="middle" fill="white" fontWeight="700" fontSize="12">JOIN Result Set</text>
        
        {results.map((r, i) => (
          <g key={i} transform={`translate(0, ${30 + i * 32})`}>
            <rect x="2" y="2" width="316" height="28" rx="4" fill="rgba(16, 185, 129, 0.03)" stroke="var(--db-border)" />
            <text x="20" y="20" fill="var(--db-text)" fontSize="11" fontWeight="700">{r.name}</text>
            <text x="180" y="20" fill={r.item === 'NULL' ? 'var(--db-danger)' : 'var(--db-text)'} fontSize="11" fontWeight={r.item === 'NULL' ? '700' : '400'}>{r.item}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// 4. Transaction Simulator
function TransactionViz({ step }) {
  const acid = [
    { key: 'A', name: 'Atomicity', desc: 'All or nothing', active: step >= 3 },
    { key: 'C', name: 'Consistency', desc: 'Preserves balance', active: step >= 2 },
    { key: 'I', name: 'Isolation', desc: 'Invisible updates', active: step >= 0 },
    { key: 'D', name: 'Durability', desc: 'Committed to disk', active: step === 3 }
  ];

  return (
    <svg viewBox="0 0 540 300" className="db-viz-svg">
      {/* Account Balance Cards */}
      <g transform="translate(20, 20)">
        <rect x="0" y="0" width="130" height="80" rx="12" fill="var(--db-card)" stroke="var(--db-border)" strokeWidth="2" />
        <rect x="0" y="0" width="130" height="28" rx="12" fill="var(--db-primary)" />
        <text x="65" y="18" textAnchor="middle" fill="white" fontWeight="700" fontSize="11">Account A</text>
        <text x="65" y="55" textAnchor="middle" fill="var(--db-text)" fontWeight="800" fontSize="16">
          {step === 0 ? '$500' : step >= 1 ? '$400' : '$500'}
        </text>
      </g>

      <g transform="translate(370, 20)">
        <rect x="0" y="0" width="130" height="80" rx="12" fill="var(--db-card)" stroke="var(--db-border)" strokeWidth="2" />
        <rect x="0" y="0" width="130" height="28" rx="12" fill="var(--db-primary)" />
        <text x="65" y="18" textAnchor="middle" fill="white" fontWeight="700" fontSize="11">Account B</text>
        <text x="65" y="55" textAnchor="middle" fill="var(--db-text)" fontWeight="800" fontSize="16">
          {step <= 1 ? '$200' : step >= 2 ? '$300' : '$200'}
        </text>
      </g>

      {/* Action Flow Arrow */}
      {step === 1 && (
        <g>
          <path d="M 160 60 L 360 60" fill="transparent" stroke="var(--db-warning)" strokeWidth="3" markerEnd="url(#arrow)" />
          <text x="260" y="48" textAnchor="middle" fill="var(--db-warning)" fontSize="10" fontWeight="700">-$100 Transferring...</text>
        </g>
      )}

      {step === 2 && (
        <g>
          <path d="M 160 60 L 360 60" fill="transparent" stroke="var(--db-success)" strokeWidth="3" />
          <text x="260" y="48" textAnchor="middle" fill="var(--db-success)" fontSize="10" fontWeight="700">Money Arrived</text>
        </g>
      )}

      {/* ACID Cards */}
      <g transform="translate(20, 130)">
        {acid.map((a, i) => (
          <g key={a.key} transform={`translate(${i * 125}, 0)`}>
            <rect
              x="0"
              y="0"
              width="115"
              height="90"
              rx="10"
              fill="var(--db-card)"
              stroke={a.active ? "var(--db-success)" : "var(--db-border)"}
              strokeWidth={a.active ? 2.5 : 1}
              style={{ transition: 'all 0.4s' }}
            />
            <rect x="10" y="10" width="22" height="22" rx="6" fill={a.active ? "var(--db-success)" : "var(--db-border)"} />
            <text x="21" y="26" textAnchor="middle" fill={a.active ? "white" : "var(--db-muted)"} fontWeight="800" fontSize="12">{a.key}</text>
            <text x="12" y="50" fill="var(--db-text)" fontWeight="700" fontSize="11">{a.name}</text>
            <text x="12" y="68" fill="var(--db-muted)" fontSize="9" width="90">{a.desc}</text>
          </g>
        ))}
      </g>

      {/* State Badge */}
      <g transform="translate(180, 240)">
        <rect x="0" y="0" width="180" height="35" rx="18" fill={step === 3 ? "rgba(16, 185, 129, 0.12)" : step === 4 ? "rgba(239, 68, 68, 0.12)" : "rgba(245, 158, 11, 0.12)"} />
        <text x="90" y="22" textAnchor="middle" fill={step === 3 ? "var(--db-success)" : step === 4 ? "var(--db-danger)" : "var(--db-warning)"} fontWeight="800" fontSize="12">
          {step === 0 ? 'TX STARTED' : step === 1 ? 'ACCOUNT DEBITED' : step === 2 ? 'BUFFER BALANCED' : step === 3 ? 'COMMIT (SUCCESS)' : 'ROLLBACK (RESTORE)'}
        </text>
      </g>
    </svg>
  );
}

// Visualizer Switch router
function VizComponent({ vizType, step }) {
  switch (vizType) {
    case 'tableViz':
      return <TableViz step={step} />;
    case 'keyConstraintViz':
      return <KeyConstraintViz step={step} />;
    case 'joinViz':
      return <JoinViz step={step} />;
    case 'transactionViz':
      return <TransactionViz step={step} />;
    default:
      return <div className="text-center p-8 text-gray-400">Visualization not implemented</div>;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function DBMSLab() {
  const [level, setLevel] = useState('categories'); // 'categories', 'topics', 'concept'
  const [category, setCategory] = useState(null);
  const [topic, setTopic] = useState(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [xp, setXp] = useState(() => Number(localStorage.getItem('dbms_xp') || 0));
  const [completedTopics, setCompletedTopics] = useState(() => {
    const saved = localStorage.getItem('dbms_completed_topics');
    return saved ? JSON.parse(saved) : [];
  });

  // Calculate stats
  const totalXP = xp;
  const streak = 3; // Mocked
  const totalCompleted = completedTopics.length;

  const openCategory = (cat) => {
    setCategory(cat);
    setLevel('topics');
  };

  const openTopic = (t) => {
    setTopic(t);
    setStep(0);
    setPlaying(false);
    setLevel('concept');
  };

  const goHome = () => {
    setLevel('categories');
    setCategory(null);
    setTopic(null);
  };

  const goTopics = () => {
    setLevel('topics');
    setTopic(null);
  };

  // Autoplay handler
  useEffect(() => {
    let timer = null;
    if (playing && topic) {
      timer = setInterval(() => {
        setStep((currentStep) => {
          if (currentStep < topic.steps - 1) {
            return currentStep + 1;
          } else {
            setPlaying(false);
            // Award XP on complete topic
            if (!completedTopics.includes(topic.id)) {
              const newCompleted = [...completedTopics, topic.id];
              setCompletedTopics(newCompleted);
              localStorage.setItem('dbms_completed_topics', JSON.stringify(newCompleted));
              const newXP = xp + (category?.xp || 50);
              setXp(newXP);
              localStorage.setItem('dbms_xp', newXP.toString());
            }
            return currentStep;
          }
        });
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [playing, topic, completedTopics, category, xp]);

  // Compute circular progress
  const getTopicProgress = (topicId) => {
    return completedTopics.includes(topicId) ? 100 : 0;
  };

  const getCategoryProgress = (cat) => {
    if (!cat.topics || cat.topics.length === 0) return 0;
    const completedInCat = cat.topics.filter(t => completedTopics.includes(t.id)).length;
    return Math.round((completedInCat / cat.topics.length) * 100);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const filteredData = DBMS_DATA.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dbms-lab p-6">
      
      {/* ─── Breadcrumbs ─── */}
      {level !== 'categories' && (
        <div className="db-breadcrumb">
          <button className="db-breadcrumb-btn" onClick={goHome}>
            <Home size={14} /> DBMS Lab
          </button>
          {level === 'topics' && (
            <>
              <span className="db-breadcrumb-sep">›</span>
              <span className="db-breadcrumb-current">{category?.title}</span>
            </>
          )}
          {level === 'concept' && (
            <>
              <span className="db-breadcrumb-sep">›</span>
              <button className="db-breadcrumb-btn" onClick={goTopics}>{category?.title}</button>
              <span className="db-breadcrumb-sep">›</span>
              <span className="db-breadcrumb-current">{topic?.title}</span>
            </>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* ─── LEVEL 1: DASHBOARD CATEGORIES ─── */}
        {level === 'categories' && (
          <motion.div key="categories" {...pageVariants}>
            
            {/* Top Stats bar */}
            <div className="db-stats-banner">
              <div className="db-stat-card">
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--db-primary)' }}>✨</div>
                <div className="db-stat-info">
                  <span className="db-stat-value">{totalXP}</span>
                  <span className="db-stat-label">Total XP</span>
                </div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--db-warning)' }}>🔥</div>
                <div className="db-stat-info">
                  <span className="db-stat-value">{streak} Days</span>
                  <span className="db-stat-label">Streak</span>
                </div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--db-success)' }}>🏆</div>
                <div className="db-stat-info">
                  <span className="db-stat-value">{totalCompleted}</span>
                  <span className="db-stat-label">Modules Completed</span>
                </div>
              </div>
            </div>

            <div className="db-header">
              <div className="db-title-area">
                <h1>🗄️ Database Visual Laboratory</h1>
                <p>Learn core database management concepts through interactive micro-simulations.</p>
              </div>
              <div className="db-search-bar">
                <Search size={16} className="db-search-icon" />
                <input
                  type="text"
                  placeholder="Search database modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="db-grid">
              {filteredData.map((cat) => {
                const progress = getCategoryProgress(cat);
                const radius = 16;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (progress / 100) * circumference;

                return (
                  <motion.div
                    key={cat.id}
                    className={`db-card-el ${cat.locked ? 'opacity-70' : ''}`}
                    whileTap={cat.locked ? {} : { scale: 0.98 }}
                  >
                    <div className="db-card-top">
                      <div className="db-card-icon" style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}40)`, color: cat.color }}>
                        <cat.Icon size={24} />
                      </div>
                      
                      {!cat.locked && (
                        <div className="db-progress-ring-container">
                          <svg width="36" height="36">
                            <circle className="db-progress-ring-bg" cx="18" cy="18" r={radius} />
                            <circle
                              className="db-progress-ring-circle"
                              cx="18"
                              cy="18"
                              r={radius}
                              strokeDasharray={`${circumference} ${circumference}`}
                              strokeDashoffset={strokeDashoffset}
                              style={{ stroke: cat.color }}
                            />
                          </svg>
                          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '8px', fontWeight: 'bold' }}>
                            {progress}%
                          </span>
                        </div>
                      )}

                      {cat.locked && <span className="db-card-badge advanced" style={{ background: '#E2E8F0', color: '#64748B' }}>Locked</span>}
                      {!cat.locked && <span className={`db-card-badge ${cat.difficulty}`}>{cat.difficulty}</span>}
                    </div>

                    <h3 className="db-card-title">{cat.title}</h3>
                    <p className="db-card-desc">{cat.description}</p>
                    
                    <div className="db-card-footer">
                      <div className="db-card-meta">
                        <span className="db-meta-item">⏱ {cat.duration}</span>
                        <span className="db-meta-item">💎 {cat.xp} XP</span>
                      </div>
                      <button
                        className="db-card-btn"
                        onClick={() => openCategory(cat)}
                        disabled={cat.locked}
                        style={cat.locked ? {} : { background: cat.color }}
                      >
                        {cat.locked ? 'Coming Soon' : 'Continue'} <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ─── LEVEL 2: TOPICS LIST ─── */}
        {level === 'topics' && category && (
          <motion.div key="topics" {...pageVariants}>
            <div className="db-header">
              <div className="db-title-area">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <category.Icon size={32} style={{ color: category.color }} />
                  {category.title}
                </h1>
                <p>{category.description}</p>
              </div>
              <button className="db-breadcrumb-btn" onClick={goHome} style={{ border: '1px solid var(--db-border)', padding: '10px 18px', borderRadius: '12px' }}>
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
            </div>

            <div className="db-grid" style={{ marginTop: '24px' }}>
              {category.topics.map((t, idx) => (
                <div key={t.id} className="db-card-el">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2">Topic {idx + 1}</span>
                  <h3 className="db-card-title">{t.title}</h3>
                  <p className="db-card-desc">{t.preview}</p>
                  <div className="db-card-footer">
                    <button className="db-card-btn" onClick={() => openTopic(t)} style={{ background: category.color }}>
                      <Eye size={14} /> Visualize Lab
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── LEVEL 3: CONCEPT SIMULATOR ─── */}
        {level === 'concept' && topic && (
          <motion.div key="concept" {...pageVariants}>
            <div className="db-header">
              <div className="db-title-area">
                <h1>{topic.title}</h1>
                <p>Run micro-queries and step through database state modifications.</p>
              </div>
              <button className="db-breadcrumb-btn" onClick={goTopics} style={{ border: '1px solid var(--db-border)', padding: '10px 18px', borderRadius: '12px' }}>
                <ArrowLeft size={16} /> Back to Topics
              </button>
            </div>

            <div className="db-lab-panel">
              {/* Visualization Canvas */}
              <div className="db-viz-panel">
                <div className="db-viz-topbar">
                  <span className="db-viz-title">
                    <span className="db-live-dot" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                    Simulation Canvas
                  </span>
                  <span className="db-viz-badge">Step {step + 1} / {topic.steps}</span>
                </div>
                <div className="db-viz-canvas">
                  <VizComponent vizType={topic.vizType} step={step} />
                </div>
              </div>

              {/* Code/Concept Panel */}
              <div className="db-code-panel">
                <div className="db-code-topbar">
                  <div className="db-code-dots">
                    <span /><span /><span />
                  </div>
                  <span className="db-code-filename">query.sql</span>
                  <span className="db-code-lang">SQL</span>
                </div>
                <pre className="db-code-body">{topic.code}</pre>
              </div>
            </div>

            {/* Timeline Playback Controls */}
            <div className="db-timeline">
              <div className="db-timeline-label">⏱ Simulation Timeline</div>
              <div className="db-timeline-controls">
                <button className="db-tl-btn" title="Reset" onClick={() => { setStep(0); setPlaying(false); }}>
                  <RotateCcw size={15} />
                </button>
                <button className="db-tl-btn play-btn" title={playing ? 'Pause' : 'Play'} onClick={() => {
                  if (step >= topic.steps - 1) setStep(0);
                  setPlaying(!playing);
                }}>
                  {playing ? <Pause size={15} /> : <Play size={15} />}
                </button>
                <div className="db-tl-slider-wrap">
                  <input
                    type="range"
                    className="db-tl-slider"
                    min={0}
                    max={topic.steps - 1}
                    value={step}
                    style={{ '--progress': `${(step / (topic.steps - 1)) * 100}%` }}
                    onChange={e => { setStep(Number(e.target.value)); setPlaying(false); }}
                  />
                  <div className="db-tl-steps">
                    {topic.stepLabels.map((lbl, idx) => (
                      <span
                        key={idx}
                        className={`db-tl-step-label ${idx === step ? 'active' : ''}`}
                        onClick={() => { setStep(idx); setPlaying(false); }}
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step Explanation Card */}
            {topic.stepDescriptions?.[step] && (
              <motion.div
                key={`desc-${step}`}
                className="db-step-info"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h4>
                  <span className="db-step-num-badge">{step + 1}</span>
                  {topic.stepLabels?.[step]}
                </h4>
                <p>{topic.stepDescriptions[step]}</p>
              </motion.div>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
