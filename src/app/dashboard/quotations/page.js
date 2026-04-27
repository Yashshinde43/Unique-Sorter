'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/rbac';

const fmtINR = n => n ? '₹ ' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(+n) : '—';
const fmtDate = iso => { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); };

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  /* ==========================================================
     QUOTATIONS PAGE - FULLY RESPONSIVE
     ========================================================== */

  /* Mobile First - Base styles */
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
    padding: 16px;
  }
  
  .card-title {
    font-size: 18px;
    font-weight: 700;
  }
  
  .card-subtitle {
    font-size: 13px;
    color: #64748b;
  }
  
  .card-actions {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }
  
  /* Move chips above buttons on mobile */
  .qf-chips {
    width: 100%;
    order: -1;
    margin-bottom: 8px;
  }
  
  /* Filter buttons equal size */
  .qf-wrap {
    flex: 1;
    min-width: 0;
  }
  
  .qf-btn {
    width: 100%;
    height: 44px;
    padding: 0 12px;
    font-size: 13px;
    justify-content: center;
    border-radius: 8px;
  }
  
  /* Filter panel */
  .qf-panel-inner {
    padding: 12px 16px;
  }
  
  .qf-field-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .qf-field {
    margin-bottom: 0;
  }
  
  .qf-input {
    height: 44px;
    min-height: 44px;
    font-size: 14px;
  }
  
  .qf-result-bar {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    margin-top: 12px;
    padding-top: 12px;
  }
  
  /* Table - card view on mobile */
  .table-wrapper {
    margin: 0;
    width: 100%;
    overflow-x: hidden;
    padding: 0 16px;
  }
  
  .data-table {
    display: block;
    width: 100%;
    border-collapse: collapse;
  }
  
  /* Hide table headers on mobile */
  .data-table thead {
    display: none;
  }
  
  .data-table tbody {
    display: block;
    width: 100%;
  }
  
  .data-table tr {
    display: block;
    width: 100%;
    margin-bottom: 16px;
    border: 1px solid #e2e8f2;
    border-radius: 12px;
    padding: 16px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  
  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 10px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 14px;
  }
  
  .data-table td:last-child {
    border-bottom: none;
  }
  
  .data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #64748b;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-right: 12px;
  }
  
  /* Empty state */
  .data-table tbody tr:only-child {
    border: none;
    box-shadow: none;
    background: transparent;
    padding: 40px 16px;
  }
  
  .data-table tbody tr:only-child td {
    display: block;
    text-align: center;
    border: none;
    padding: 0;
  }
  
  .data-table tbody tr:only-child td::before {
    display: none;
  }

  /* Tablet (768px and up) */
  @media (min-width: 768px) {
    .card-header {
      flex-direction: row;
      align-items: center !important;
      padding: 20px 24px;
    }
    
    .card-actions {
      width: auto;
      flex-wrap: nowrap;
    }
    
    .qf-chips {
      width: auto;
      order: 0;
      margin-bottom: 0;
    }
    
    .qf-wrap {
      flex: none;
    }
    
    .qf-btn {
      width: auto;
      height: 32px;
      font-size: 12.5px;
    }
    
    .qf-panel-inner {
      padding: 16px 20px 18px;
    }
    
    .qf-field-row {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .qf-input {
      height: 36px;
      min-height: 36px;
    }
    
    .qf-result-bar {
      flex-direction: row;
      align-items: center;
    }
    
    /* Table - normal view */
    .table-wrapper {
      padding: 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .data-table {
      display: table;
      min-width: 800px;
    }
    
    .data-table thead {
      display: table-header-group;
    }
    
    .data-table tbody {
      display: table-row-group;
    }
    
    .data-table tr {
      display: table-row;
      margin-bottom: 0;
      border: none;
      border-radius: 0;
      padding: 0;
      background: transparent;
      box-shadow: none;
    }
    
    .data-table td {
      display: table-cell;
      width: auto;
      padding: 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
    }
    
    .data-table td::before {
      content: none;
    }
  }

  /* Desktop (1024px and up) */
  @media (min-width: 1024px) {
    .card-header {
      padding: 24px;
    }
    
    .qf-field-row {
      grid-template-columns: repeat(4, 1fr);
    }
    
    .data-table {
      min-width: 900px;
    }
  }

  /* Extra small mobile */
  @media (max-width: 360px) {
    .card-header {
      padding: 12px;
    }
    
    .card-title {
      font-size: 16px;
    }
    
    .qf-btn {
      height: 40px;
      font-size: 12px;
    }
    
    .qf-input {
      font-size: 16px; /* Prevent iOS zoom */
    }
    
    .data-table tr {
      padding: 12px;
    }
  }

  /* Touch device optimizations */
  @media (hover: none) and (pointer: coarse) {
    .ql-row:hover td { background: transparent; }
    .ql-row:active td { background: #f7f9ff; }
    .qf-input {
      font-size: 16px;
    }
  }

  /* ── table rows ── */
  .ql-row { cursor: pointer; transition: background .1s; }
  .ql-row:hover td { background: #f7f9ff; }
  .ql-row td:first-child { border-left: 2px solid transparent; transition: border-color .1s; }
  .ql-row:hover td:first-child { border-left-color: #1A37AA; }
  .ql-badge {
    display: inline-flex; align-items: center; padding: 2px 8px;
    border-radius: 4px; font-size: 10px; font-weight: 700;
    letter-spacing: .4px; text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
  }
  .ql-badge-1page    { background: #eef1fc; color: #1A37AA; }
  .ql-badge-detailed { background: #edfaec; color: #236b21; }
  @keyframes ql-spin  { to { transform: rotate(360deg); } }
  .ql-hl { background: #fde68a; border-radius: 2px; padding: 0 1px; color: #92400e; }

  /* ══════════════════════════════════════
     FILTER BUTTON
  ══════════════════════════════════════ */
  .qf-wrap { display: inline-flex; align-items: center; }

  .qf-btn {
    display: inline-flex; align-items: center; gap: 6px;
    height: 32px; padding: 0 12px;
    border-radius: 6px;
    border: 1.5px solid #e2e8f2;
    background: #fff;
    color: #64748b;
    font-family: 'Outfit', sans-serif;
    font-size: 12.5px; font-weight: 600;
    cursor: pointer;
    transition: border-color .15s, color .15s, background .15s, box-shadow .15s;
    white-space: nowrap;
  }
  .qf-btn:hover { border-color: #94a3c4; color: #1e293b; background: #f8faff; }
  .qf-btn.is-open {
    border-color: #1A37AA; color: #1A37AA; background: #f0f4ff;
    box-shadow: 0 0 0 3px rgba(26,55,170,.1);
  }
  .qf-btn.has-active { border-color: #1A37AA; color: #1A37AA; }

  /* count dot */
  .qf-count {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 16px; height: 16px; padding: 0 4px;
    background: #1A37AA; color: #fff;
    border-radius: 10px; font-size: 9.5px; font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    line-height: 1;
  }
  .qf-btn.is-open .qf-count { background: #fff; color: #1A37AA; }

  /* ══════════════════════════════════════
     INLINE FILTER PANEL (between header and table)
  ══════════════════════════════════════ */
  .qf-panel {
    border-top: 1px solid #eef1f8;
    border-bottom: 1px solid #eef1f8;
    background: #f8faff;
    animation: qf-slide-down .2s cubic-bezier(.22,.68,0,1.1) both;
    overflow: hidden;
  }
  @keyframes qf-slide-down {
    from { opacity: 0; max-height: 0; }
    to   { opacity: 1; max-height: 300px; }
  }

  .qf-panel-inner { padding: 16px 20px 18px; }

  .qf-panel-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .qf-panel-title {
    font-family: 'Outfit', sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: .8px; text-transform: uppercase;
    color: #94a3b8;
  }
  .qf-panel-reset {
    font-family: 'Outfit', sans-serif;
    font-size: 11.5px; font-weight: 600;
    color: #94a3b8; background: none; border: none;
    cursor: pointer; padding: 2px 6px; border-radius: 4px;
    transition: color .12s, background .12s;
  }
  .qf-panel-reset:hover { color: #ef4444; background: #fef2f2; }
  .qf-panel-reset:disabled { opacity: 0; pointer-events: none; }

  /* individual field */
  .qf-field { margin-bottom: 0; }
  .qf-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .qf-label {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px; font-weight: 500;
    letter-spacing: .6px; text-transform: uppercase;
    color: #1e293b; margin-bottom: 5px;
  }

  .qf-input-wrap { position: relative; }
  .qf-input-icon {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    color: #cbd5e1; pointer-events: none;
    display: flex; align-items: center;
    transition: color .15s;
  }
  .qf-input {
    width: 100%; height: 36px;
    padding: 0 10px 0 32px;
    border: 1.5px solid #e2e8f2;
    border-radius: 7px;
    background: #f8faff;
    color: #1e293b;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 400;
    outline: none; box-sizing: border-box;
    transition: border-color .15s, background .15s, box-shadow .15s;
  }
  .qf-input::placeholder { color: #c0cce0; font-size: 12.5px; }
  .qf-input:focus {
    border-color: #1A37AA; background: #fff;
    box-shadow: 0 0 0 3px rgba(26,55,170,.09);
  }
  .qf-input:focus + .qf-input-icon,
  .qf-input-wrap:focus-within .qf-input-icon { color: #1A37AA; }
  .qf-input.has-val { border-color: #93a8e8; background: #f4f7ff; }
  .qf-input[type="date"] { padding-left: 32px; color-scheme: light; }
  .qf-input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: .3; cursor: pointer;
  }
  .qf-input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: .6; }

  /* live result bar */
  .qf-result-bar {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 14px; padding-top: 12px;
    border-top: 1px solid #f1f5f9;
  }
  .qf-result-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px; color: #94a3b8;
  }
  .qf-result-text strong { color: #1A37AA; font-weight: 600; }
  .qf-result-none { color: #f87171; }
  .qf-result-none strong { color: #ef4444; }

  /* ══════════════════════════════════════
     ACTIVE FILTER CHIPS
  ══════════════════════════════════════ */
  .qf-chips { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
  .qf-chip {
    display: inline-flex; align-items: center; gap: 4px;
    height: 24px; padding: 0 8px 0 9px;
    background: #eef1fc; border: 1px solid #c7d2f5;
    border-radius: 20px;
    font-family: 'Outfit', sans-serif;
    font-size: 11.5px; font-weight: 500; color: #1A37AA;
    animation: qf-chip-in .15s cubic-bezier(.22,.68,0,1.3) both;
  }
  @keyframes qf-chip-in {
    from { opacity: 0; transform: scale(.75); }
    to   { opacity: 1; transform: scale(1); }
  }
  .qf-chip-key {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: .4px; color: #7a90d4; margin-right: 1px;
    font-family: 'JetBrains Mono', monospace;
  }
  .qf-chip-x {
    display: flex; align-items: center; justify-content: center;
    width: 14px; height: 14px; border-radius: 50%;
    background: none; border: none; cursor: pointer;
    color: #7a90d4; padding: 0; margin-left: 1px;
    transition: background .1s, color .1s;
  }
  .qf-chip-x:hover { background: #c7d2f5; color: #1A37AA; }
`;

function Hl({ text, query }) {
  if (!query || !text) return <>{text || '—'}</>;
  const s = String(text);
  const idx = s.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{s}</>;
  return <>{s.slice(0, idx)}<mark className="ql-hl">{s.slice(idx, idx + query.length)}</mark>{s.slice(idx + query.length)}</>;
}

export default function QuotationsPage() {
  const router = useRouter();
  const { userRole } = useAuth();
  const isAdminUser = isAdmin(userRole);
  
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState(null);
  const [open, setOpen] = useState(false);

  const [fName,  setFName]  = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fDate,  setFDate]  = useState('');
  const [fNum,   setFNum]   = useState('');

  const DUMMY_QUOTATIONS = [
    { id: 'enq-001_1page', quotNo: 'USEPL/Q/2026-27/001', quotationType: '1page', company: 'Sri Balaji Rice Mill', contact: 'Rajesh Kumar', salutation: 'Mr.', mobile: '9876543210', email: 'rajesh@example.com', city: 'Nagpur', state: 'Maharashtra', model: 'USEPL-6V PINNACLE', descLine1: 'USEPL-6V PINNACLE', qty: 2, basePrice: '6600000', gstAmt: '1188000', total: '7788000', validity: 30, quotDate: '2026-04-20', createdAt: '2026-04-20T10:30:00Z', enquiryId: 'enq-001' },
    { id: 'enq-002_detailed', quotNo: 'USEPL/Q/2026-27/002', quotationType: 'detailed', company: 'Sharma Agro Industries', contact: 'Amit Sharma', salutation: 'Mr.', mobile: '8765432109', email: 'amit@sharmaagro.in', city: 'Hyderabad', state: 'Telangana', model: 'USEPL-8V PINNACLE', descLine1: 'USEPL-8V PINNACLE', qty: 1, basePrice: '4000000', gstAmt: '720000', total: '4720000', validity: 45, quotDate: '2026-04-18', createdAt: '2026-04-18T14:15:00Z', enquiryId: 'enq-002' },
    { id: 'enq-004_1page', quotNo: 'USEPL/Q/2026-27/003', quotationType: '1page', company: 'Singh Dal Mill', contact: 'Vikram Singh', salutation: 'Mr.', mobile: '9988776655', email: '', city: 'Raipur', state: 'Chhattisgarh', model: 'USEPL-5V PINNACLE', descLine1: 'USEPL-5V PINNACLE', qty: 3, basePrice: '9000000', gstAmt: '1620000', total: '10620000', validity: 30, quotDate: '2026-04-12', createdAt: '2026-04-12T16:45:00Z', enquiryId: 'enq-004' },
  ];

  useEffect(() => {
    fetch('/api/quotations')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.length > 0) setRows(d.data);
        else setRows(DUMMY_QUOTATIONS);
      })
      .catch(() => setRows(DUMMY_QUOTATIONS))
      .finally(() => setLoading(false));
  }, []);

  /* close on Escape */
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  const clearAll = useCallback(() => {
    setFName(''); setFEmail(''); setFDate(''); setFNum('');
  }, []);

  const filtered = useMemo(() => rows.filter(r => {
    if (fName)  { const n = `${r.company||''} ${r.contact||''}`.toLowerCase(); if (!n.includes(fName.toLowerCase())) return false; }
    if (fEmail) { if (!(r.email||'').toLowerCase().includes(fEmail.toLowerCase())) return false; }
    if (fDate)  { const d = (r.quotDate||r.savedAt||r.createdAt||'').slice(0,10); if (d !== fDate) return false; }
    if (fNum)   { const n = `${r.quotNo||''} ${r.refNo||''}`.toLowerCase(); if (!n.includes(fNum.toLowerCase())) return false; }
    return true;
  }), [rows, fName, fEmail, fDate, fNum]);

  const chips = [
    fName  && { key: 'name',  label: 'Name',  val: fName,            clear: () => setFName('') },
    fEmail && { key: 'email', label: 'Email', val: fEmail,           clear: () => setFEmail('') },
    fDate  && { key: 'date',  label: 'Date',  val: fmtDate(fDate),   clear: () => setFDate('') },
    fNum   && { key: 'num',   label: 'Ref',   val: fNum,             clear: () => setFNum('') },
  ].filter(Boolean);

  const hasAny   = chips.length > 0;
  const noResult = !loading && filtered.length === 0 && hasAny;

  return (
    <div className="page-wrapper">
      <style>{CSS}</style>
      <div className="page-content">
        <div className="card">

          {/* ── HEADER ── */}
          <div className="card-header">
            {/* left: title */}
            <div>
              <h2 className="card-title">All Quotations</h2>
              <p className="card-subtitle">
                {loading
                  ? 'Loading…'
                  : hasAny
                    ? `${filtered.length} of ${rows.length} records`
                    : `${rows.length} record${rows.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* right: chips + filter button */}
            <div className="card-header-right">

              {/* active chips */}
              {hasAny && (
                <div className="qf-chips">
                  {chips.map(c => (
                    <span key={c.key} className="qf-chip">
                      <span className="qf-chip-key">{c.label}</span>
                      {c.val}
                      <button className="qf-chip-x" onClick={c.clear} title={`Remove ${c.label} filter`}>
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* filter button */}
              <div className="qf-wrap">
                <button
                  className={`qf-btn${open ? ' is-open' : ''}${hasAny && !open ? ' has-active' : ''}`}
                  onClick={() => setOpen(v => !v)}
                >
                  {open ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="6"  x2="20" y2="6"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                      <line x1="11" y1="18" x2="13" y2="18"/>
                    </svg>
                  )}
                  {open ? 'Close' : 'Filter'}
                  {!open && hasAny && <span className="qf-count">{chips.length}</span>}
                </button>
              </div>
            </div>
          </div>

           {/* ── INLINE FILTER PANEL ── */}
          {open && (
            <div className="qf-panel">
              <div className="qf-panel-inner">
                <div className="qf-field-row">

                  {/* Name / Company */}
                  <div className="qf-field">
                    <label className="qf-label">Name / Company</label>
                    <div className="qf-input-wrap">
                      <input className={`qf-input${fName ? ' has-val' : ''}`} placeholder="Search client or company…" value={fName} onChange={e => setFName(e.target.value)} autoFocus />
                      <span className="qf-input-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="qf-field">
                    <label className="qf-label">Email Address</label>
                    <div className="qf-input-wrap">
                      <input className={`qf-input${fEmail ? ' has-val' : ''}`} placeholder="Filter by email…" value={fEmail} onChange={e => setFEmail(e.target.value)} />
                      <span className="qf-input-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="qf-field">
                    <label className="qf-label">Date</label>
                    <div className="qf-input-wrap">
                      <input className={`qf-input${fDate ? ' has-val' : ''}`} type="date" value={fDate} onChange={e => setFDate(e.target.value)} style={{ paddingLeft: 32 }} />
                      <span className="qf-input-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                    </div>
                  </div>

                  {/* Quote No */}
                  <div className="qf-field">
                    <label className="qf-label">Quote No.</label>
                    <div className="qf-input-wrap">
                      <input className={`qf-input${fNum ? ' has-val' : ''}`} placeholder="USEPL/Q…" value={fNum} onChange={e => setFNum(e.target.value)} />
                      <span className="qf-input-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
                    </div>
                  </div>
                </div>

                {/* bottom row: result count + reset */}
                <div className="qf-result-bar">
                  <span className={`qf-result-text${noResult ? ' qf-result-none' : ''}`}>
                    {loading ? 'Loading…' : noResult
                      ? <><strong>0</strong> matches — try broadening filters</>
                      : <><strong>{filtered.length}</strong> of {rows.length} records match</>}
                  </span>
                  {hasAny && (
                    <button className="qf-panel-reset" onClick={clearAll}>Reset all</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TABLE ── */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quote ID</th><th>Type</th><th>Client</th>
                  <th>Contact</th><th>Model</th><th>Amount (incl. GST)</th>
                  <th>Date</th><th>Validity</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A37AA" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ql-spin .8s linear infinite', display: 'inline-block' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '64px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#d0d8e8" strokeWidth="1.4" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#8898aa' }}>
                        {hasAny ? 'No matching quotations' : 'No quotations yet'}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#aab4c4' }}>
                        {hasAny ? 'Try adjusting your filters' : 'Quotations generated from enquiries will appear here'}
                      </div>
                    </div>
                  </td></tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className="ql-row" onClick={() => { setNavigatingId(r.id); router.push(`/dashboard/quotations/${r.id}`); }} title="Open quotation" style={{ position: 'relative' }}>
                    <td data-label="Quote ID" style={{ fontWeight: 600, color: '#1A37AA', fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }}>
                      {navigatingId === r.id ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A37AA" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ql-spin .8s linear infinite', display: 'block' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                      ) : (
                        <Hl text={r.quotNo || r.refNo} query={fNum} />
                      )}
                    </td>
                    <td data-label="Type">
                      {r.quotationType === 'detailed'
                        ? <span className="ql-badge ql-badge-detailed">Detailed</span>
                        : <span className="ql-badge ql-badge-1page">1-Page</span>}
                    </td>
                    <td data-label="Client">
                      <div style={{ fontWeight: 600, fontSize: 13 }}><Hl text={r.company} query={fName} /></div>
                      {r.city && <div style={{ fontSize: 11.5, color: '#8898aa' }}>{r.city}{r.state ? `, ${r.state}` : ''}</div>}
                    </td>
                    <td data-label="Contact">
                      <div style={{ fontSize: 13 }}>{r.salutation} <Hl text={r.contact} query={fName} /></div>
                      {r.mobile && <div style={{ fontSize: 11.5, color: '#8898aa' }}>{r.mobile}</div>}
                    </td>
                    <td data-label="Model" style={{ fontSize: 12.5 }}>{r.model || r.descLine1 || '—'}</td>
                    <td data-label="Amount" style={{ fontWeight: 700, fontSize: 13, color: '#1a2a1a' }}>{fmtINR(r.total)}</td>
                    <td data-label="Date" style={{ fontSize: 12.5, color: '#556' }}>{fmtDate(r.quotDate || r.savedAt || r.createdAt)}</td>
                    <td data-label="Validity" style={{ fontSize: 12.5, color: '#556' }}>
                      {r.validity ? `${r.validity} days` : r.quotationValidity ? `${r.quotationValidity} days` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
