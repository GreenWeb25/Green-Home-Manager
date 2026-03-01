import React, { useState } from 'react';
import BudgetView from './views/BudgetView';
import PlanningView from './views/PlanningView';
import CantieriView from './views/CantieriView';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-primary: #0b1120;
    --bg-secondary: #111827;
    --bg-card: #1a2332;
    --bg-card2: #1e2d3d;
    --border: #1e3a4a;
    --border-subtle: #1a2e3a;
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #475569;
    --accent-green: #4ade80;
    --accent-blue: #60a5fa;
    --accent-cyan: #22d3ee;
    --accent-orange: #f59e0b;
    --accent-red: #ef4444;
    --radius: 8px;
    --radius-lg: 12px;
  }

  html, body, #root {
    height: 100%;
    /* Immagine di sfondo con overlay scuro integrato tramite gradiente */
    background: 
      linear-gradient(rgba(11, 17, 32, 0.85), rgba(11, 17, 32, 0.9)),
      url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
  }

  /* ===== APP SHELL ===== */
  .app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ===== TOP NAV ===== */
  .top-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 58px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 200;
    gap: 16px;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: -0.5px;
    color: var(--accent-green);
    white-space: nowrap;
  }
  .nav-brand .brand-icon {
    font-size: 1.3rem;
  }
  .nav-brand .brand-sub {
    color: var(--text-secondary);
    font-size: 0.7rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    display: block;
    margin-top: 1px;
  }

  .nav-tabs {
    display: flex;
    gap: 4px;
  }
  .nav-tab {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 16px;
    border-radius: var(--radius);
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-secondary);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .nav-tab:hover {
    background: var(--bg-card);
    color: var(--text-primary);
  }
  .nav-tab.active {
    background: var(--bg-card2);
    border-color: var(--border);
    color: var(--accent-green);
  }

  .nav-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    color: var(--text-secondary);
    white-space: nowrap;
  }
  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent-green);
    box-shadow: 0 0 6px var(--accent-green);
    animation: pulse-dot 2s infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* ===== MAIN CONTENT ===== */
  .main-content {
    flex: 1;
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  /* ===== BUDGET VIEW ===== */
  .budget-view { display: flex; flex-direction: column; gap: 20px; }

  .action-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg-card);
    color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.86rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .action-btn:hover {
    background: var(--bg-card2);
    border-color: var(--accent-green);
    color: var(--accent-green);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(74, 222, 128, 0.12);
  }

  .budget-alert {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: var(--radius);
    padding: 12px 18px;
    color: #fca5a5;
    font-size: 0.9rem;
    animation: flash-alert 1.5s ease-in-out 3;
  }
  @keyframes flash-alert {
    0%, 100% { border-color: rgba(239, 68, 68, 0.4); }
    50% { border-color: rgba(239, 68, 68, 0.9); box-shadow: 0 0 16px rgba(239, 68, 68, 0.25); }
  }

  .cards-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .budget-card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 8px 8px;
    border: 1px solid var(--border);
    transition: transform 0.18s ease;
  }
  .budget-card:hover { transform: translateY(-2px); }
  .card-label { font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.06em; }
  .card-value { font-size: 1.15rem; font-weight: 200; font-family: 'Space Mono', monospace; letter-spacing: -0.5px; }
  .card-green { border-color: rgba(74, 222, 128, 0.3); }
  .card-green .card-value { color: var(--accent-green); }
  .card-orange { border-color: rgba(245, 158, 11, 0.3); }
  .card-orange .card-value { color: var(--accent-orange); }
  .card-cyan { border-color: rgba(34, 211, 238, 0.3); }
  .card-cyan .card-value { color: var(--accent-cyan); }
  .card-red { border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.06); }
  .card-red .card-value { color: var(--accent-red); }

  .chart-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    align-items: start;
  }
  .chart-box, .cost-breakdown {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 1px;
    border: 1px solid var(--border);
  }
  .section-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 12px;
  }

  .doughnut-wrap {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 180px;
    margin: 0 auto;
  }
  .doughnut-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -62%);
    text-align: center;
    pointer-events: none;
  }
  .perc-value {
    display: block;
    font-family: 'Space Mono', monospace;
    font-size: 1.3rem;
    font-weight: 700;
    line-height: 1;
  }
  .perc-label { font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; }
  .center-cyan .perc-value { color: var(--accent-cyan); }
  .center-red .perc-value { color: var(--accent-red); animation: blink-red 1s ease-in-out 5; }
  @keyframes blink-red {
    0%, 50% { opacity: 1; }
    50% { opacity: 0.2; }
  }

  .cost-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid var(--border-subtle);
  }
  .cost-item:last-child { border-bottom: none; }
  .cost-total { padding-top: 8px; }
  .cost-dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
  }
  .dot-green { background: var(--accent-green); }
  .dot-blue { background: var(--accent-blue); }
  .dot-orange { background: var(--accent-orange); }
  .dot-cyan { background: var(--accent-cyan); }
  .dot-red { background: var(--accent-red); }
  .cost-name { flex: 1; color: var(--text-secondary); font-size: 0.8rem; }
  .cost-amount { font-family: 'Space Mono', monospace; font-size: 0.85rem; color: var(--text-primary); }
  .cost-alert .cost-name, .cost-alert .cost-amount { color: var(--accent-red) !important; }

  .sub-list {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--border-subtle);
  }
  .sub-list-title { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 8px; }
  .sub-list-item { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.82rem; color: var(--text-secondary); border-bottom: 1px dashed var(--border-subtle); }
  .sub-list-item:last-child { border-bottom: none; }
  .sub-list-item span:last-child { font-family: 'Space Mono', monospace; color: var(--accent-orange); }

  /* ===== TABLE / REGISTRO ===== */
  .table-section {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 12px;
    border: 1px solid var(--border);
  }
  .excel-table-wrap {
    overflow-x: auto;
    border-radius: var(--radius);
    border: 1px solid var(--border);
  }
  .excel-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.86rem;
  }
  .excel-table thead tr { background: var(--bg-secondary); }
  .excel-table th {
    padding: 5px 8px;
    text-align: left;
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border);
  }
  .excel-table td {
    padding: 4px 8px;
    border-bottom: 1px solid var(--border-subtle);
    color: var(--text-primary);
    vertical-align: middle;
    font-size: 0.8rem;
  }
  .excel-table tr:hover td { background: var(--bg-card2); }
  .excel-table tr:last-child td { border-bottom: none; }

  .insert-row td { background: rgba(74, 222, 128, 0.04); }
  .insert-row input, .insert-row select {
    width: 100%;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-primary);
    padding: 6px 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.86rem;
    outline: none;
    transition: border-color 0.15s;
  }
  .insert-row input:focus, .insert-row select:focus { border-color: var(--accent-green); }
  .btn-add-row {
    padding: 7px 14px;
    background: rgba(74, 222, 128, 0.12);
    border: 1px solid rgba(74, 222, 128, 0.3);
    border-radius: 6px;
    color: var(--accent-green);
    cursor: pointer;
    font-size: 0.83rem;
    font-weight: 600;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .btn-add-row:hover { background: rgba(74, 222, 128, 0.2); }
  .btn-add-row:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-delete {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    transition: all 0.15s;
  }
  .btn-delete:hover { background: rgba(239, 68, 68, 0.12); color: var(--accent-red); }

  /* ===== MODALS ===== */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(7, 11, 20, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 500;
    animation: fadein 0.15s ease;
  }
  @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
  .modal-box {
    background: rgba(26, 35, 50, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(30, 58, 74, 0.5);
    border-radius: var(--radius-lg);
    padding: 24px;
    width: 95%;
    max-width: 1400px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
    animation: slidein 0.18s ease;
    position: relative;
  }
  @keyframes slidein { from { transform: translateY(12px); opacity: 0; } to { transform: none; opacity: 1; } }
  .modal-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 15px; color: var(--text-primary); }
  .modal-form label {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 14px;
    font-size: 0.82rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
  .modal-form input, .modal-form select, .modal-form textarea {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text-primary);
    padding: 9px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.15s;
  }
  .modal-form input:focus, .modal-form select:focus { border-color: var(--accent-green); }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .btn-cancel {
    padding: 9px 20px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.88rem;
    transition: all 0.15s;
  }
  .btn-cancel:hover { border-color: var(--text-secondary); color: var(--text-primary); }
  .btn-save {
    padding: 9px 22px;
    background: var(--accent-green);
    border: none;
    border-radius: var(--radius);
    color: #052e16;
    font-weight: 700;
    font-size: 0.88rem;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-save:hover { background: #86efac; }
  .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ===== PLANNING VIEW ===== */
  .planning-view { display: flex; flex-direction: column; gap: 18px; }
  .planning-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: space-between; }
  .worker-legend { display: flex; gap: 8px; flex-wrap: wrap; }
  .legend-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 13px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: transparent;
    cursor: pointer;
    font-size: 0.84rem;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    color: var(--text-secondary);
  }
  .legend-chip:hover { transform: translateY(-1px); }
  .legend-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    border: 1px solid transparent;
  }

  .worker-stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  .worker-stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: transform 0.15s;
  }
  .worker-stat-card:hover { transform: translateY(-2px); }
  .ws-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .ws-name { flex: 1; font-weight: 600; font-size: 0.9rem; }
  .ws-ore { font-family: 'Space Mono', monospace; font-size: 1.1rem; font-weight: 700; color: var(--accent-cyan); }
  .ws-label { font-size: 0.7rem; color: var(--text-muted); margin-left: -2px; }

  .calendar-box {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 20px;
    border: 1px solid var(--border);
  }

  /* FullCalendar overrides */
  .fc { color: var(--text-primary) !important; }
  .fc .fc-toolbar { margin-bottom: 16px; }
  .fc .fc-toolbar-title { font-size: 1.05rem !important; font-weight: 700; color: var(--text-primary); font-family: 'DM Sans', sans-serif; }
  .fc .fc-button {
    background: var(--bg-card2) !important;
    border: 1px solid var(--border) !important;
    color: var(--text-secondary) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 0.82rem !important;
    padding: 5px 12px !important;
    transition: all 0.15s !important;
    border-radius: var(--radius) !important;
  }
  .fc .fc-button:hover {
    background: var(--border) !important;
    color: var(--text-primary) !important;
  }
  .fc .fc-button-primary:not(:disabled).fc-button-active {
    background: rgba(74, 222, 128, 0.15) !important;
    border-color: rgba(74, 222, 128, 0.4) !important;
    color: var(--accent-green) !important;
  }
  .fc .fc-col-header-cell-cushion {
    color: var(--text-secondary) !important;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    padding: 8px 0 !important;
  }
  .fc .fc-daygrid-day { cursor: pointer; transition: background 0.15s; }
  .fc .fc-daygrid-day:hover .fc-daygrid-day-frame { background: rgba(74, 222, 128, 0.04); }
  .fc .fc-daygrid-day-number { color: var(--text-secondary) !important; font-size: 0.82rem; padding: 6px 8px; }
  .fc .fc-day-today { background: rgba(34, 211, 238, 0.06) !important; }
  .fc .fc-day-today .fc-daygrid-day-number { color: var(--accent-cyan) !important; font-weight: 700; }
  .fc-sunday { background-color: rgba(220, 38, 38, 0.08) !important; }
  .fc-sunday .fc-daygrid-day-number { color: rgba(239, 68, 68, 0.7) !important; }
  .fc .fc-scrollgrid { border: none !important; }
  .fc .fc-scrollgrid td, .fc .fc-scrollgrid th { border-color: var(--border-subtle) !important; }
  .fc .fc-event { border-radius: 5px !important; font-size: 0.78rem !important; font-weight: 600 !important; padding: 1px 5px !important; cursor: pointer; }
  .fc .fc-event:hover { opacity: 0.85; }
  .fc .fc-more-link { color: var(--accent-blue) !important; font-size: 0.76rem; }

  .calendar-legend {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 14px;
    padding: 10px 0;
    font-size: 0.82rem;
    color: var(--text-secondary);
  }
  .legend-item { display: flex; align-items: center; gap: 6px; }
  .legend-square { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }

  /* Event popup */
  .popup-backdrop {
    position: fixed;
    inset: 0;
    z-index: 900;
  }
  .event-popup {
    background: var(--bg-card2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 16px 18px;
    width: 240px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.5);
    z-index: 1000;
    animation: slidein 0.12s ease;
  }
  .popup-close {
    position: absolute;
    top: 10px;
    right: 12px;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.78rem;
  }
  .popup-close:hover { color: var(--text-primary); }
  .popup-title { font-weight: 700; font-size: 0.92rem; margin-bottom: 6px; }
  .popup-date { font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 10px; }
  .popup-detail { font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 5px; }
  .popup-delete {
    margin-top: 12px;
    width: 100%;
    padding: 7px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius);
    color: #fca5a5;
    cursor: pointer;
    font-size: 0.82rem;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .popup-delete:hover { background: rgba(239, 68, 68, 0.2); }

  /* ===== LOADING ===== */
  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
    color: var(--text-muted);
    font-size: 0.9rem;
    gap: 10px;
  }
  .loading-spinner::before {
    content: '';
    width: 18px; height: 18px;
    border: 2px solid var(--border);
    border-top-color: var(--accent-green);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ===== SCROLLBAR ===== */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg-primary); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 1100px) {
    .nav-brand .brand-sub { display: none; }
    .cards-row { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 900px) {
    .top-nav { height: auto; padding: 12px 24px; flex-direction: column; align-items: stretch; gap: 12px; }
    .nav-tabs { justify-content: center; overflow-x: auto; padding-bottom: 4px; }
    .action-bar { justify-content: center; }
    .chart-row { grid-template-columns: 1fr; }
  }

  @media (max-width: 600px) {
    .main-content { padding: 12px; }
    .cards-row { grid-template-columns: 1fr; }
    .top-nav { padding: 12px; }
    .nav-tab { padding: 6px 10px; font-size: 0.8rem; }
    .modal-box { padding: 16px; width: 100%; border-radius: 0; min-height: 100vh; max-height: 100vh; }
    .excel-table th, .excel-table td { font-size: 0.75rem; padding: 4px; }
    .fc .fc-toolbar-title { font-size: 0.85rem !important; }
    .fc .fc-toolbar { flex-direction: column; gap: 8px; }
  }
`;

const TABS = [
  { id: 'budget', label: 'Dashboard', icon: '📊' },
  { id: 'cantieri', label: 'Cantieri', icon: '🏗️' },
  { id: 'planning', label: 'Pianificazione', icon: '📅' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('budget');

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="app-shell">
        {/* TOP NAV */}
        <nav className="top-nav">
          <div className="nav-brand">
            <span className="brand-icon">🌿</span>
            <div>
              Green Home Manager
              <span className="brand-sub">Gestione Cantiere — Dashboard Aziendale</span>
            </div>
          </div>

          <div className="nav-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          <div className="nav-status">
            <div className="status-dot" />
            Supabase live
          </div>
        </nav>

        {/* MAIN */}
        <main className="main-content">
          {activeTab === 'cantieri' && <CantieriView />}
          {activeTab === 'budget' && <BudgetView />}
          {activeTab === 'planning' && <PlanningView />}
        </main>
      </div>
    </>
  );
}
