'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const fmtDate = iso => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ── Drawer ────────────────────────────────────────────────────── */
function EnquiryDrawer({ row, onClose, onUpdated, onDeleted }) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (row) { requestAnimationFrame(() => setVisible(true)); setDraft({ ...row }); setEditing(false); }
    else setVisible(false);
  }, [row]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { if (editing) { setEditing(false); setDraft({ ...row }); } else handleClose(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing, row]);

  const set = (key, val) => setDraft(d => ({ ...d, [key]: val }));
  const setItem = (idx, key, val) => setDraft(d => {
    const items = [...(d.items || [])];
    items[idx] = { ...items[idx], [key]: val };
    return { ...d, items };
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/enquiry/${row.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Delete failed');
      handleClose();
      onDeleted(row.id);
    } catch (e) { setSaveErr(e.message); setConfirmDelete(false); }
    finally { setDeleting(false); }
  };

  const handleSave = async () => {
    setSaving(true); setSaveErr('');
    try {
      const res = await fetch(`/api/enquiry/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      onUpdated({ ...draft });
      setEditing(false);
    } catch (e) { setSaveErr(e.message); }
    finally { setSaving(false); }
  };

  if (!row) return null;

  const initials = (row.customerName || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const isImmediate = row.hasRequirement === true;

  return (
    <>
      <style>{`
        .eq-backdrop {
          position: fixed; inset: 0; z-index: 400;
          background: rgba(8, 15, 28, 0.65);
          opacity: 0; transition: opacity 0.25s ease;
          backdrop-filter: blur(3px);
        }
        .eq-backdrop.eq-in { opacity: 1; }

        .eq-modal {
          position: fixed; top: 50%; left: 50%; z-index: 401;
          width: 820px; max-width: calc(100vw - 40px);
          max-height: calc(100vh - 56px);
          background: var(--bg);
          display: flex; flex-direction: column;
          border-radius: 18px;
          border: 1px solid var(--border);
          box-shadow: 0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04);
          transform: translate(-50%, -46%) scale(0.97);
          opacity: 0;
          transition: transform 0.28s cubic-bezier(0.34,1.2,0.64,1), opacity 0.22s ease;
          overflow: hidden;
        }
        .eq-modal.eq-in { transform: translate(-50%, -50%) scale(1); opacity: 1; }

        /* ── Header ── */
        .eq-head {
          flex-shrink: 0;
          background: var(--sidebar-bg);
          background-image: linear-gradient(135deg, #0d1829 0%, #111c2d 50%, #0e1f38 100%);
          padding: 26px 28px 22px;
          display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
          position: relative; overflow: hidden;
        }
        .eq-head::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 95% 50%, rgba(26,55,170,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .eq-head::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(26,55,170,0.4), rgba(82,186,79,0.2), transparent);
        }
        .eq-head-left { display: flex; align-items: center; gap: 18px; min-width: 0; position: relative; }
        .eq-avatar-wrap { position: relative; flex-shrink: 0; }
        .eq-avatar {
          width: 54px; height: 54px; border-radius: 14px; flex-shrink: 0;
          background: linear-gradient(135deg, #1A37AA 0%, #2549cc 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700; color: #fff;
          font-family: var(--font-display);
          box-shadow: 0 4px 16px rgba(26,55,170,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
          letter-spacing: 0.5px;
        }
        .eq-avatar-ring {
          position: absolute; inset: -3px; border-radius: 17px;
          border: 1.5px solid rgba(26,55,170,0.35);
          pointer-events: none;
        }
        .eq-head-info { min-width: 0; }
        .eq-head-label {
          font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
          text-transform: uppercase; color: rgba(255,255,255,0.35);
          margin-bottom: 5px; font-family: var(--font-body);
        }
        .eq-head-name {
          font-family: var(--font-display); font-size: 20px; font-weight: 700;
          color: #fff; line-height: 1.2; letter-spacing: -0.2px;
        }
        .eq-head-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; position: relative; }
        .eq-status-badge {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 13px; border-radius: 99px;
          font-size: 12px; font-weight: 600; font-family: var(--font-body);
          letter-spacing: 0.2px;
        }
        .eq-status-badge.immediate {
          background: rgba(82,186,79,0.12); color: #4ecb4b;
          border: 1px solid rgba(82,186,79,0.25);
        }
        .eq-status-badge.future {
          background: rgba(232,160,32,0.1); color: #e8a020;
          border: 1px solid rgba(232,160,32,0.25);
        }
        .eq-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .eq-close {
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .eq-close:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .eq-edit-btn {
          height: 34px; padding: 0 14px; border-radius: 9px;
          display: flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
          font-size: 12px; font-weight: 600; font-family: var(--font-body);
          transition: background 0.15s, color 0.15s;
        }
        .eq-edit-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .eq-edit-btn.active { background: rgba(26,55,170,0.3); color: #7aa0ff; border-color: rgba(26,55,170,0.4); }
        .eq-del-btn {
          height: 34px; padding: 0 12px; border-radius: 9px;
          display: flex; align-items: center; gap: 6px;
          color: rgba(220,80,80,0.7); background: rgba(220,80,80,0.07);
          border: 1px solid rgba(220,80,80,0.2); cursor: pointer;
          font-size: 12px; font-weight: 600; font-family: var(--font-body);
          transition: background 0.15s, color 0.15s;
        }
        .eq-del-btn:hover { background: rgba(220,80,80,0.14); color: #e05555; border-color: rgba(220,80,80,0.35); }
        .eq-del-btn.confirm { background: #c0392b; color: #fff; border-color: #c0392b; }

        /* ── Edit inputs ── */
        .eq-input {
          width: 100%; border: 1.5px solid var(--border); border-radius: 7px;
          padding: 7px 10px; font-size: 13px; font-family: var(--font-body);
          color: var(--text-primary); background: var(--bg);
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          margin-top: 2px;
        }
        .eq-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(26,55,170,0.1); }
        .eq-save-err { font-size: 12px; color: #c0392b; padding: 0 28px 10px; }

        /* ── Meta strip ── */
        .eq-meta-strip {
          flex-shrink: 0;
          display: flex; gap: 0;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
        }
        .eq-meta-cell {
          flex: 1; padding: 12px 20px;
          display: flex; flex-direction: column; gap: 2px;
          border-right: 1px solid var(--border);
        }
        .eq-meta-cell:last-child { border-right: none; }
        .eq-meta-cell-lbl {
          font-size: 10px; font-weight: 700; letter-spacing: 0.8px;
          text-transform: uppercase; color: var(--text-muted);
        }
        .eq-meta-cell-val {
          font-size: 13px; font-weight: 600; color: var(--text-primary);
          font-family: var(--font-body);
        }
        .eq-meta-cell-val.muted { color: var(--text-secondary); font-weight: 500; }

        /* ── Scroll body ── */
        .eq-body {
          flex: 1; overflow-y: auto; padding: 22px 28px 24px;
          display: flex; flex-direction: column; gap: 20px;
          scrollbar-width: thin; scrollbar-color: var(--border) transparent;
        }
        .eq-body::-webkit-scrollbar { width: 4px; }
        .eq-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

        /* ── Section ── */
        .eq-section { display: flex; flex-direction: column; gap: 0; }
        .eq-section-head {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 12px;
        }
        .eq-section-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: var(--blue-dim); border: 1px solid rgba(26,55,170,0.2);
          display: flex; align-items: center; justify-content: center;
          color: var(--blue); flex-shrink: 0;
        }
        .eq-section-title {
          font-family: var(--font-display); font-size: 13px; font-weight: 700;
          color: var(--text-primary); letter-spacing: 0.1px;
        }
        .eq-section-line { flex: 1; height: 1px; background: var(--border); }

        /* ── Fields grid ── */
        .eq-fields {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; overflow: hidden;
        }
        .eq-fields-row {
          display: grid; grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid var(--border);
        }
        .eq-fields-row:last-child { border-bottom: none; }
        .eq-fields-row.single { grid-template-columns: 1fr; }
        .eq-field {
          padding: 14px 18px;
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 5px;
        }
        .eq-field:last-child { border-right: none; }
        .eq-field-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.7px;
          text-transform: uppercase; color: var(--text-muted);
        }
        .eq-field-icon { color: var(--blue); opacity: 0.7; flex-shrink: 0; }
        .eq-field-value {
          font-size: 14px; font-weight: 500; color: var(--text-primary);
          line-height: 1.5; padding-left: 22px;
        }
        .eq-field-value.muted { color: var(--text-secondary); font-weight: 400; }

        /* ── Item cards ── */
        .eq-items { display: flex; flex-direction: column; gap: 10px; }
        .eq-item {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; overflow: hidden;
        }
        .eq-item-head {
          padding: 10px 16px 9px;
          background: linear-gradient(90deg, var(--sidebar-bg), #0f1e33);
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .eq-item-num {
          font-size: 11px; font-weight: 700; letter-spacing: 0.6px;
          text-transform: uppercase; color: rgba(255,255,255,0.45);
          font-family: var(--font-body);
        }
        .eq-item-badge {
          font-size: 11px; font-weight: 600; color: rgba(26,55,170,0.8);
          background: rgba(26,55,170,0.1); border: 1px solid rgba(26,55,170,0.2);
          padding: 2px 9px; border-radius: 99px;
        }
        .eq-item-body { display: grid; grid-template-columns: repeat(4,1fr); }
        .eq-item-cell {
          padding: 14px 16px; border-right: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 4px;
        }
        .eq-item-cell:last-child { border-right: none; }
        .eq-item-cell-lbl {
          font-size: 10px; font-weight: 700; letter-spacing: 0.7px;
          text-transform: uppercase; color: var(--text-muted);
        }
        .eq-item-cell-val { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .eq-item-cell-val.accent {
          font-size: 15px; font-weight: 700; color: var(--blue);
          background: var(--blue-dim); border: 1px solid rgba(26,55,170,0.18);
          border-radius: 6px; padding: 4px 10px; display: inline-block;
          font-family: var(--font-body); line-height: 1.4;
        }
        .eq-item-cell-val.sub { color: var(--text-secondary); font-weight: 400; font-size: 13px; }

        /* ── Future layout ── */
        .eq-future { display: flex; flex-direction: column; gap: 12px; }
        .eq-future-note {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; padding: 16px 18px;
        }
        .eq-future-note-lbl {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.7px;
          text-transform: uppercase; color: var(--text-muted); margin-bottom: 7px;
        }
        .eq-future-note-val { font-size: 14px; color: var(--text-secondary); line-height: 1.65; }
        .eq-future-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .eq-future-stat {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; padding: 16px 18px;
          display: flex; flex-direction: column; gap: 6px;
          position: relative; overflow: hidden;
        }
        .eq-future-stat::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--blue), rgba(26,55,170,0.2));
        }
        .eq-future-stat-val {
          font-size: 24px; font-weight: 800; color: var(--blue);
          font-family: var(--font-display); line-height: 1;
        }
        .eq-future-stat-lbl {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.7px;
          text-transform: uppercase; color: var(--text-muted);
        }

        /* ── Footer ── */
        .eq-footer {
          flex-shrink: 0; padding: 16px 28px;
          border-top: 1px solid var(--border);
          background: var(--surface);
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .eq-footer-meta { display: flex; flex-direction: column; gap: 2px; }
        .eq-footer-label { font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text-muted); }
        .eq-footer-date { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
        .eq-gen-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 10px;
          background: linear-gradient(135deg, #1A37AA 0%, #2549cc 100%);
          color: #fff; font-family: var(--font-body); font-size: 14px; font-weight: 600;
          text-decoration: none; border: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(26,55,170,0.35), inset 0 1px 0 rgba(255,255,255,0.12);
          transition: box-shadow 0.15s, transform 0.12s;
          letter-spacing: 0.1px;
        }
        .eq-gen-btn:hover {
          box-shadow: 0 6px 24px rgba(26,55,170,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }
        .eq-gen-btn:active { transform: translateY(0); }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Backdrop */}
      <div className={`eq-backdrop ${visible ? 'eq-in' : ''}`} onClick={handleClose} />

      {/* Modal */}
      <div className={`eq-modal ${visible ? 'eq-in' : ''}`} role="dialog" aria-modal="true">

        {/* ── Header ── */}
        <div className="eq-head">
          <div className="eq-head-left">
            <div className="eq-avatar-wrap">
              <div className="eq-avatar">{initials}</div>
              <div className="eq-avatar-ring" />
            </div>
            <div className="eq-head-info">
              <div className="eq-head-label">Enquiry Detail</div>
              <div className="eq-head-name">{row.customerName}</div>
            </div>
          </div>
          <div className="eq-head-right">
            {confirmDelete ? (
              <>
                <button className="eq-del-btn confirm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Confirm Delete'}
                </button>
                <button className="eq-edit-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
              </>
            ) : (
              <button className="eq-del-btn" onClick={() => { setConfirmDelete(true); setEditing(false); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                Delete
              </button>
            )}
            <button className={`eq-edit-btn ${editing ? 'active' : ''}`} onClick={() => { setEditing(!editing); setSaveErr(''); setDraft({ ...row }); setConfirmDelete(false); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button className="eq-close" onClick={handleClose}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Quick meta strip ── */}
        <div className="eq-meta-strip">
          <div className="eq-meta-cell">
            <span className="eq-meta-cell-lbl">Mill / Company</span>
            <span className="eq-meta-cell-val">{row.millName || '—'}</span>
          </div>
          <div className="eq-meta-cell">
            <span className="eq-meta-cell-lbl">Mobile</span>
            <span className="eq-meta-cell-val muted">{row.mobile || '—'}</span>
          </div>
          <div className="eq-meta-cell">
            <span className="eq-meta-cell-lbl">Location</span>
            <span className="eq-meta-cell-val muted">{[row.location, row.state].filter(Boolean).join(', ') || '—'}</span>
          </div>
          <div className="eq-meta-cell">
            <span className="eq-meta-cell-lbl">Requirement</span>
            <span className={`eq-meta-cell-val ${isImmediate ? '' : 'muted'}`}
              style={{ color: isImmediate ? '#4ecb4b' : '#e8a020', fontWeight: 600 }}>
              {isImmediate ? 'Immediate' : 'Future'}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="eq-body">

          {/* Contact & Location */}
          <div className="eq-section">
            <div className="eq-section-head">
              <div className="eq-section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span className="eq-section-title">Contact & Location</span>
              <div className="eq-section-line" />
            </div>
            <div className="eq-fields">
              <div className="eq-fields-row">
                <div className="eq-field">
                  <span className="eq-field-label">
                    <svg className="eq-field-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 14a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.18 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.91 10.09a16 16 0 0 0 7 7l1.46-1.42a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/>
                    </svg>
                    Mobile
                  </span>
                  {editing ? <input className="eq-input" value={draft.mobile || ''} onChange={e => set('mobile', e.target.value)} /> : <span className="eq-field-value">{draft.mobile || '—'}</span>}
                </div>
                <div className="eq-field">
                  <span className="eq-field-label">
                    <svg className="eq-field-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email
                  </span>
                  {editing ? <input className="eq-input" value={draft.email || ''} onChange={e => set('email', e.target.value)} /> : <span className="eq-field-value muted">{draft.email || '—'}</span>}
                </div>
              </div>
              <div className="eq-fields-row">
                <div className="eq-field">
                  <span className="eq-field-label">
                    <svg className="eq-field-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                    </svg>
                    GST No.
                  </span>
                  {editing ? <input className="eq-input" value={draft.gst || ''} onChange={e => set('gst', e.target.value)} /> : <span className="eq-field-value muted">{draft.gst || '—'}</span>}
                </div>
                <div className="eq-field">
                  <span className="eq-field-label">
                    <svg className="eq-field-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    State
                  </span>
                  {editing ? <input className="eq-input" value={draft.state || ''} onChange={e => set('state', e.target.value)} /> : <span className="eq-field-value muted">{draft.state || '—'}</span>}
                </div>
              </div>
              <div className="eq-fields-row single">
                <div className="eq-field">
                  <span className="eq-field-label">
                    <svg className="eq-field-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    Address
                  </span>
                  {editing ? <input className="eq-input" value={draft.address || ''} onChange={e => set('address', e.target.value)} /> : <span className="eq-field-value muted">{draft.address || '—'}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Commodity & Remarks */}
          {(row.commodity || row.remarks || editing) && (
            <div className="eq-section">
              <div className="eq-section-head">
                <div className="eq-section-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                </div>
                <span className="eq-section-title">Commodity & Remarks</span>
                <div className="eq-section-line" />
              </div>
              <div className="eq-fields">
                <div className="eq-fields-row single">
                  <div className="eq-field">
                    <span className="eq-field-label">
                      <svg className="eq-field-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                      </svg>
                      Commodity
                    </span>
                    {editing ? (
                      <select className="eq-input" value={draft.commodity || ''} onChange={e => set('commodity', e.target.value)}>
                        <option value="">Select commodity</option>
                        {['Rice', 'Pulses', 'Multiproduct', 'Tuvar Dal', 'Moong Dal'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <span className="eq-field-value">{draft.commodity || '—'}</span>
                    )}
                  </div>
                </div>
                <div className="eq-fields-row single">
                  <div className="eq-field">
                    <span className="eq-field-label">
                      <svg className="eq-field-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      Remarks
                    </span>
                    {editing ? (
                      <textarea className="eq-input" rows={3} value={draft.remarks || ''} onChange={e => set('remarks', e.target.value)} style={{ resize: 'vertical', height: 'auto', minHeight: 72 }} />
                    ) : (
                      <span className="eq-field-value muted">{draft.remarks || '—'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Requirement */}
          <div className="eq-section">
            <div className="eq-section-head">
              <div className="eq-section-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <span className="eq-section-title">Requirement</span>
              <div className="eq-section-line" />
            </div>

            {isImmediate && draft.items?.length > 0 ? (
              <div className="eq-items">
                {draft.items.map((item, idx) => (
                  <div key={idx} className="eq-item">
                    <div className="eq-item-head">
                      <span className="eq-item-num">Item {idx + 1}</span>
                      {item.price && <span className="eq-item-badge">{item.price}</span>}
                    </div>
                    <div className="eq-item-body">
                      <div className="eq-item-cell">
                        <span className="eq-item-cell-lbl">Model</span>
                        {editing ? <input className="eq-input" value={item.modelNo || ''} onChange={e => setItem(idx, 'modelNo', e.target.value)} /> : <span className="eq-item-cell-val">{item.modelNo || '—'}</span>}
                      </div>
                      <div className="eq-item-cell">
                        <span className="eq-item-cell-lbl">Size</span>
                        {editing ? <input className="eq-input" value={item.size || ''} onChange={e => setItem(idx, 'size', e.target.value)} /> : <span className="eq-item-cell-val sub">{item.size || '—'}</span>}
                      </div>
                      <div className="eq-item-cell">
                        <span className="eq-item-cell-lbl">Qty</span>
                        {editing ? <input className="eq-input" value={item.qty || ''} onChange={e => setItem(idx, 'qty', e.target.value)} /> : <span className="eq-item-cell-val accent">{item.qty || '—'}</span>}
                      </div>
                      <div className="eq-item-cell">
                        <span className="eq-item-cell-lbl">Price</span>
                        <span className="eq-item-cell-val sub">{item.price || '—'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="eq-future">
                <div className="eq-future-note">
                  <div className="eq-future-note-lbl">Notes</div>
                  {editing ? <textarea className="eq-input" rows={3} value={draft.futureNote || ''} onChange={e => set('futureNote', e.target.value)} style={{ resize: 'vertical' }} /> : <div className="eq-future-note-val">{draft.futureNote || '—'}</div>}
                </div>
                <div className="eq-future-stats">
                  <div className="eq-future-stat">
                    {editing ? (
                      <><span className="eq-future-stat-lbl" style={{marginBottom:4}}>Follow-up Date</span><input className="eq-input" type="date" value={draft.followUpDate || ''} onChange={e => set('followUpDate', e.target.value)} /></>
                    ) : (
                      <><span className="eq-future-stat-val" style={{ fontSize: 16, fontWeight: 700 }}>{draft.followUpDate || '—'}</span><span className="eq-future-stat-lbl">Follow-up Date</span></>
                    )}
                  </div>
                  <div className="eq-future-stat">
                    {editing ? (
                      <><span className="eq-future-stat-lbl" style={{marginBottom:4}}>Probable Month</span><input className="eq-input" value={draft.probableMonth || ''} onChange={e => set('probableMonth', e.target.value)} /></>
                    ) : (
                      <><span className="eq-future-stat-val">{draft.probableMonth || '—'}</span><span className="eq-future-stat-lbl">Probable Month</span></>
                    )}
                  </div>
                  <div className="eq-future-stat">
                    {editing ? (
                      <><span className="eq-future-stat-lbl" style={{marginBottom:4}}>Order Chances %</span><input className="eq-input" value={draft.orderChances || ''} onChange={e => set('orderChances', e.target.value)} /></>
                    ) : (
                      <><span className="eq-future-stat-val">{draft.orderChances || '—'}<span style={{ fontSize: 14, fontWeight: 600 }}>%</span></span><span className="eq-future-stat-lbl">Order Chances</span></>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── Footer ── */}
        {saveErr && <div className="eq-save-err">⚠ {saveErr}</div>}
        <div className="eq-footer">
          <div className="eq-footer-meta">
            <span className="eq-footer-label">Created on</span>
            <span className="eq-footer-date">{fmtDate(row.createdAt)}</span>
          </div>
          {editing ? (
            <button className="eq-gen-btn" onClick={handleSave} disabled={saving}>
              {saving ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          ) : (
            <Link href="/dashboard/quotations/new" className="eq-gen-btn" onClick={handleClose}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              Generate Quotation
            </Link>
          )}
        </div>

      </div>
    </>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function EnquiryPage() {
  const router = useRouter();
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  /* filter state */
  const [fName,   setFName]   = useState('');
  const [fMobile, setFMobile] = useState('');
  const [fSource, setFSource] = useState('');
  const [fDate,   setFDate]   = useState('');
  const [open,    setOpen]    = useState(false);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const name   = `${r.customerName || ''} ${r.millName || ''}`.toLowerCase();
      const mobile = (r.mobile || '').toLowerCase();
      const source = (r.source || '').toLowerCase();
      const date   = (r.createdAt || '').slice(0, 10);
      return (
        (!fName   || name.includes(fName.toLowerCase())) &&
        (!fMobile || mobile.includes(fMobile.toLowerCase())) &&
        (!fSource || source.includes(fSource.toLowerCase())) &&
        (!fDate   || date === fDate)
      );
    });
  }, [rows, fName, fMobile, fSource, fDate]);

  const chips = [
    fName   && { key: 'name',   label: fName,   clear: () => setFName('') },
    fMobile && { key: 'mobile', label: fMobile, clear: () => setFMobile('') },
    fSource && { key: 'source', label: fSource, clear: () => setFSource('') },
    fDate   && { key: 'date',   label: fDate,   clear: () => setFDate('') },
  ].filter(Boolean);

  const hasAny = chips.length > 0;

  const closePanel = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest('.eq-filter-wrap')) closePanel();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closePanel]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closePanel]);

  useEffect(() => {
    fetch('/api/enquiry')
      .then(r => r.json())
      .then(data => {
        if (data.success) setRows(data.data);
        else setError(data.error || 'Failed to load enquiries');
      })
      .catch(() => setError('Failed to load enquiries'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <style>{`
        .eq-filter-wrap { position: relative; display: inline-flex; align-items: center; gap: 8px; }
        .qf-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 0 14px; height: 36px; border-radius: 9px;
          font-size: 13px; font-weight: 600; font-family: var(--font-body);
          cursor: pointer; transition: all 0.15s;
          border: 1.5px solid var(--border);
          background: var(--surface); color: var(--text-secondary);
          white-space: nowrap;
        }
        .qf-btn:hover { border-color: var(--blue); color: var(--blue); background: var(--blue-dim); }
        .qf-btn.qf-open { border-color: var(--blue); color: var(--blue); background: var(--blue-dim); }
        .qf-count {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 18px; height: 18px; border-radius: 99px;
          background: var(--blue); color: #fff; font-size: 10px; font-weight: 700;
          padding: 0 5px;
        }
        .qf-chips { display: inline-flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .qf-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px 3px 10px; border-radius: 99px;
          background: var(--blue-dim); border: 1px solid rgba(26,55,170,0.25);
          color: var(--blue); font-size: 11.5px; font-weight: 600; font-family: var(--font-body);
          animation: qf-chip-in 0.18s ease;
        }
        .qf-chip button {
          display: inline-flex; align-items: center; justify-content: center;
          width: 14px; height: 14px; border-radius: 50%;
          border: none; background: transparent; color: inherit;
          cursor: pointer; padding: 0; opacity: 0.7; transition: opacity 0.12s;
        }
        .qf-chip button:hover { opacity: 1; }
        @keyframes qf-chip-in { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }

        .qf-panel {
          background: var(--surface); border: 1.5px solid var(--border);
          border-top: none; padding: 20px 20px 16px;
          animation: qf-slide-down 0.18s ease;
        }
        @keyframes qf-slide-down { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .qf-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 14px; align-items: flex-start;
        }
        .qf-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 0; }
        .qf-label { font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #1e293b; }
        .qf-input-wrap { position: relative; }
        .qf-input {
          width: 100%; height: 36px; padding: 0 10px 0 32px;
          border: 1.5px solid var(--border); border-radius: 8px;
          font-size: 13px; font-family: var(--font-body); color: var(--text-primary);
          background: var(--bg); outline: none;
          transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box;
        }
        .qf-input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(26,55,170,0.1); }
        .qf-input-icon {
          position: absolute; left: 9px; top: 50%; transform: translateY(-50%);
          color: var(--text-muted); pointer-events: none;
        }
        .qf-panel-reset {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 12px; font-size: 12px; font-weight: 600;
          color: var(--text-muted); background: none; border: none; cursor: pointer;
          padding: 0; font-family: var(--font-body); transition: color 0.13s;
        }
        .qf-panel-reset:hover { color: #c0392b; }
        .qf-result-bar {
          font-size: 12px; color: var(--text-muted); padding: 8px 20px 0;
          font-family: var(--font-body);
        }
      `}</style>
      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">All Enquiries</h2>
              <p className="card-subtitle">
                {loading ? 'Loading…' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <div className="card-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {hasAny && (
                <div className="qf-chips">
                  {chips.map(c => (
                    <span key={c.key} className="qf-chip">
                      {c.label}
                      <button onClick={c.clear} aria-label="Remove filter">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="eq-filter-wrap">
                <button className={`qf-btn${open ? ' qf-open' : ''}`} onClick={() => setOpen(v => !v)}>
                  {open ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                      <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/>
                    </svg>
                  )}
                  {open ? 'Close' : 'Filter'}
                  {!open && hasAny && <span className="qf-count">{chips.length}</span>}
                </button>
              </div>
              <Link href="/enquiry" className="btn-primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New
              </Link>
            </div>
          </div>

          {open && (
            <div className="qf-panel eq-filter-wrap" style={{ width: '100%', boxSizing: 'border-box' }}>
              <div className="qf-grid">
                <div className="qf-field">
                  <label className="qf-label">Name / Company</label>
                  <div className="qf-input-wrap">
                    <svg className="qf-input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input className="qf-input" placeholder="Search name…" value={fName} onChange={e => setFName(e.target.value)} autoFocus />
                  </div>
                </div>
                <div className="qf-field">
                  <label className="qf-label">Mobile</label>
                  <div className="qf-input-wrap">
                    <svg className="qf-input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                    <input className="qf-input" placeholder="Search mobile…" value={fMobile} onChange={e => setFMobile(e.target.value)} />
                  </div>
                </div>
                <div className="qf-field">
                  <label className="qf-label">Source</label>
                  <div className="qf-input-wrap">
                    <svg className="qf-input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <input className="qf-input" placeholder="Search source…" value={fSource} onChange={e => setFSource(e.target.value)} />
                  </div>
                </div>
                <div className="qf-field">
                  <label className="qf-label">Date</label>
                  <div className="qf-input-wrap">
                    <svg className="qf-input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <input className="qf-input" type="date" value={fDate} onChange={e => setFDate(e.target.value)} style={{ paddingLeft: 32 }} />
                  </div>
                </div>
              </div>
              {hasAny && (
                <button className="qf-panel-reset" onClick={() => { setFName(''); setFMobile(''); setFSource(''); setFDate(''); }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {hasAny && !open && (
            <div className="qf-result-bar">
              Showing {filtered.length} of {rows.length} enquiries
            </div>
          )}

          <div className="table-wrapper">
            {error ? (
              <div style={{ padding: '40px 24px', color: '#c0392b', fontSize: 13 }}>⚠ {error}</div>
            ) : loading ? (
              <div style={{ padding: '56px 0', textAlign: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A37AA" strokeWidth="2.5" strokeLinecap="round"
                  style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer Name</th>
                    <th>Mill / Company</th>
                    <th>Mobile</th>
                    <th>Location</th>
                    <th>Requirement</th>
                    <th>Source</th>
                    <th>Follow-up</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '56px 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d0d8e8" strokeWidth="1.4" strokeLinecap="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#8898aa' }}>{hasAny ? 'No results match your filters' : 'No enquiries yet'}</div>
                          <div style={{ fontSize: 12.5, color: '#aab4c4' }}>{hasAny ? 'Try adjusting or clearing the filters' : 'Add your first enquiry to get started'}</div>
                          {!hasAny && (
                            <Link href="/enquiry" className="btn-primary" style={{ marginTop: 4 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                              </svg>
                              New Enquiry
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r, i) => (
                      <tr
                        key={r.id}
                        className="table-row-clickable"
                        onClick={() => router.push(`/dashboard/enquiry/${r.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="table-id">{i + 1}</td>
                        <td className="table-primary">{r.customerName || '—'}</td>
                        <td>{r.millName || '—'}</td>
                        <td>{r.mobile || '—'}</td>
                        <td>{[r.location, r.state].filter(Boolean).join(', ') || '—'}</td>
                        <td>
                          <span className={`status-pill ${r.hasRequirement ? 'status-pill--green' : 'status-pill--yellow'}`}>
                            {r.hasRequirement ? 'Immediate' : 'Future'}
                          </span>
                        </td>
                        <td className="table-muted">{r.source || '—'}</td>
                        <td className="table-muted">{r.followUpDate || '—'}</td>
                        <td className="table-muted">{fmtDate(r.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
