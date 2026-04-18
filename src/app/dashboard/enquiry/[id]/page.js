'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const REGIONS = ['North India','South India','East India','West India','Central India','Export / International'];
const SIZES   = ['Small','Medium','Large','Custom'];
const SOURCES = ['Cold Call','Reference','Exhibition','Online / Website','Social Media','Other'];

const fmtDate = iso => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Barlow+Condensed:wght@400;500;600;700;800&display=swap');

  .eqd-root { min-height: 100vh; background: #eef0f5; font-family: 'DM Sans', sans-serif; }

  .eqd-content { max-width: 860px; margin: 0 auto; padding: 36px 32px 80px; }

  /* ── Page head ── */
  .eqd-page-head {
    margin-bottom: 32px; padding-bottom: 24px;
    border-bottom: 2px solid rgba(13,24,40,.08);
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .eqd-page-head-title { font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 700; color: #0d1828; letter-spacing: -.3px; }
  .eqd-page-head-sub { font-family: 'Inter', sans-serif; font-size: 13px; color: #6b7a90; margin-top: 4px; }
  .eqd-page-head-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

  /* ── Buttons ── */
  .eqd-btn {
    height: 36px; padding: 0 16px; border-radius: 8px;
    border: 1px solid #d8dfe8; background: #fff;
    color: #4a5568; font-size: 13px; font-family: 'DM Sans', sans-serif;
    font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    transition: all .15s; text-decoration: none;
  }
  .eqd-btn:hover { border-color: #b0bbc9; color: #0d1828; }
  .eqd-btn--primary {
    border: none; background: #1A37AA; color: #fff; font-weight: 600;
    box-shadow: 0 2px 10px rgba(26,55,170,.35);
  }
  .eqd-btn--primary:hover { background: #1e42cc; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(26,55,170,.45); color: #fff; }
  .eqd-btn--danger { border-color: rgba(224,85,85,.4); color: #c0392b; background: rgba(224,85,85,.06); }
  .eqd-btn--danger:hover { background: rgba(224,85,85,.12); border-color: rgba(224,85,85,.6); color: #c0392b; }
  .eqd-btn--danger-confirm { border: none; background: #c0392b; color: #fff; }
  .eqd-btn--danger-confirm:hover { background: #a93226; color: #fff; transform: none; }
  .eqd-btn--edit-active { background: rgba(26,55,170,.08); border-color: rgba(26,55,170,.35); color: #1A37AA; }

  /* ── Section dividers ── */
  .eqd-divider { display: flex; align-items: center; gap: 14px; margin: 36px 0 20px; }
  .eqd-divider:first-child { margin-top: 0; }
  .eqd-divider-num {
    width: 24px; height: 24px; border-radius: 50%;
    background: #1A37AA; color: #fff;
    font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .eqd-divider-label { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; color: #0d1828; letter-spacing: .1px; white-space: nowrap; }
  .eqd-divider-line { flex: 1; height: 1px; background: rgba(13,24,40,.1); }

  /* ── Grid ── */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .full { grid-column: 1 / -1; }
  .mt { margin-top: 16px; }

  /* ── Field ── */
  .eqd-f { display: flex; flex-direction: column; gap: 5px; }
  .eqd-lbl { font-size: 11px; font-weight: 600; color: #4a5568; letter-spacing: .3px; }
  .eqd-val {
    font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    color: #0d1828; font-weight: 500; padding: 10px 13px;
    background: #f4f6fa; border: 1.5px solid #e8edf4;
    border-radius: 8px; line-height: 1.5; min-height: 42px;
  }
  .eqd-val.muted { color: #6b7a90; font-weight: 400; }
  .eqd-val.empty { color: #b0bbc9; font-style: italic; font-weight: 400; }

  /* ── Inputs (edit mode) ── */
  .eqd-in, .eqd-sel, .eqd-ta {
    width: 100%; border: 1.5px solid #d8dfe8; border-radius: 8px;
    padding: 10px 13px; font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    color: #0d1828; background: #fff; line-height: 1.5;
    transition: border-color .18s, box-shadow .18s; outline: none;
  }
  .eqd-in::placeholder, .eqd-ta::placeholder { color: #b0bbc9; }
  .eqd-in:focus, .eqd-sel:focus, .eqd-ta:focus { border-color: #1A37AA; box-shadow: 0 0 0 3px rgba(26,55,170,.1); }
  .eqd-sel {
    appearance: none; cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%238898aa' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
  }
  .eqd-ta { resize: vertical; min-height: 80px; }

  /* ── Requirement status badge ── */
  .eqd-req-badge {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 18px; border-radius: 10px; font-size: 13.5px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; width: fit-content;
  }
  .eqd-req-badge.immediate { background: rgba(82,186,79,.08); border: 1.5px solid rgba(82,186,79,.5); color: #2e8c2b; }
  .eqd-req-badge.future { background: rgba(232,160,32,.1); border: 1.5px solid rgba(232,160,32,.4); color: #b07d10; }

  /* ── Toggle (edit mode) ── */
  .eqd-toggle { display: flex; gap: 10px; margin-top: 4px; }
  .eqd-toggle-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 24px; border-radius: 10px; font-size: 13.5px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    border: 1.5px solid #d8dfe8; background: #fff; color: #4a5568; transition: all .18s;
  }
  .eqd-toggle-btn:hover { border-color: #b0bbc9; color: #0d1828; }
  .eqd-toggle-btn--yes { background: rgba(82,186,79,.08); border-color: rgba(82,186,79,.5); color: #2e8c2b; }
  .eqd-toggle-btn--no  { background: rgba(224,85,85,.07); border-color: rgba(224,85,85,.4); color: #c0392b; }

  /* ── Item cards ── */
  .eqd-items { display: flex; flex-direction: column; gap: 14px; margin-top: 8px; }
  .eqd-item { border: 1.5px solid #e0e8f0; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px rgba(13,24,40,.04); }
  .eqd-item-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 9px 16px; background: #0d1828; border-bottom: 1px solid rgba(255,255,255,.07);
  }
  .eqd-item-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11.5px; font-weight: 700; color: rgba(255,255,255,.7); text-transform: uppercase; letter-spacing: .8px; }
  .eqd-item-body { padding: 16px; }

  /* ── Future section ── */
  .eqd-future-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; background: rgba(232,160,32,.1);
    border: 1px solid rgba(232,160,32,.35); border-radius: 8px;
    font-size: 12px; font-weight: 600; color: #b07d10; margin-bottom: 14px;
  }

  /* ── Footer ── */
  .eqd-footer {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    margin-top: 36px; padding-top: 24px; border-top: 2px solid rgba(13,24,40,.08);
    flex-wrap: wrap;
  }
  .eqd-footer-meta { font-size: 12.5px; color: #8898aa; }
  .eqd-footer-meta strong { color: #4a5568; font-weight: 600; }
  .eqd-footer-actions { display: flex; align-items: center; gap: 10px; }
  .eqd-err { font-size: 12px; color: #c0392b; font-weight: 500; }

  @keyframes eqd-spin { to { transform: rotate(360deg); } }

  /* ── Confirm popup ── */
  .eqd-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(10, 18, 30, 0.45);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    opacity: 0; animation: eqd-fade-in 0.2s ease forwards;
  }
  @keyframes eqd-fade-in { to { opacity: 1; } }

  .eqd-popup {
    background: #fff;
    border-radius: 20px;
    border: 1px solid #e0e8f2;
    box-shadow: 0 24px 64px rgba(13, 24, 40, 0.18), 0 4px 16px rgba(13, 24, 40, 0.08);
    width: 100%; max-width: 440px;
    overflow: hidden;
    transform: translateY(16px) scale(0.97);
    animation: eqd-pop-in 0.25s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
  }
  @keyframes eqd-pop-in { to { transform: translateY(0) scale(1); } }

  .eqd-popup-head {
    background: #111c2d;
    background-image: linear-gradient(135deg, #0d1829 0%, #111c2d 60%, #0e1f38 100%);
    padding: 24px 28px 20px;
    position: relative; overflow: hidden;
  }
  .eqd-popup-head::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(26,55,170,0.5), rgba(26,55,170,0.2), transparent);
  }
  .eqd-popup-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg, #1A37AA, #2549cc);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(26,55,170,0.45);
    margin-bottom: 14px;
  }
  .eqd-popup-title {
    font-family: 'Inter', sans-serif; font-size: 17px; font-weight: 700;
    color: #fff; letter-spacing: -0.2px; line-height: 1.3;
  }
  .eqd-popup-subtitle {
    font-size: 12.5px; color: rgba(255,255,255,0.45);
    margin-top: 3px; font-family: 'DM Sans', sans-serif;
  }

  .eqd-popup-body { padding: 22px 28px; }

  .eqd-popup-summary {
    background: #f4f7fd;
    border: 1.5px solid #e0e8f4;
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 18px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .eqd-popup-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .eqd-popup-row-lbl {
    font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
    text-transform: uppercase; color: #8898aa;
    flex-shrink: 0;
  }
  .eqd-popup-row-val {
    font-size: 13px; font-weight: 600; color: #0d1828;
    text-align: right;
  }
  .eqd-popup-row-val.blue { color: #1A37AA; }

  .eqd-popup-actions { display: flex; gap: 10px; }
  .eqd-popup-cancel {
    flex: 1; height: 42px; border-radius: 10px;
    border: 1.5px solid #d8dfe8; background: #fff;
    color: #4a5568; font-size: 13.5px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.15s;
  }
  .eqd-popup-cancel:hover { border-color: #b0bbc9; color: #0d1828; background: #f8f9fc; }
  .eqd-popup-confirm {
    flex: 2; height: 42px; border-radius: 10px;
    border: none; background: linear-gradient(135deg, #1A37AA, #2549cc);
    color: #fff; font-size: 13.5px; font-weight: 700;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 14px rgba(26,55,170,0.35), inset 0 1px 0 rgba(255,255,255,0.12);
    transition: box-shadow 0.15s, transform 0.12s;
  }
  .eqd-popup-confirm:hover { box-shadow: 0 6px 20px rgba(26,55,170,0.45); transform: translateY(-1px); }
  .eqd-popup-confirm:active { transform: translateY(0); }

  @media (max-width: 640px) {
    .eqd-content { padding: 20px 16px 60px; }
    .g2, .g3 { grid-template-columns: 1fr; }
    .eqd-page-head { flex-direction: column; align-items: flex-start; }
  }
`;

function Divider({ num, label }) {
  return (
    <div className="eqd-divider">
      <span className="eqd-divider-num">{num}</span>
      <span className="eqd-divider-label">{label}</span>
      <span className="eqd-divider-line" />
    </div>
  );
}

function Field({ label, cls, children }) {
  return (
    <div className={`eqd-f${cls ? ` ${cls}` : ''}`}>
      <label className="eqd-lbl">{label}</label>
      {children}
    </div>
  );
}

function Val({ v, muted }) {
  if (!v) return <div className="eqd-val empty">—</div>;
  return <div className={`eqd-val${muted ? ' muted' : ''}`}>{v}</div>;
}

export default function EnquiryDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  const [row,     setRow]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchErr,setFetchErr]= useState('');

  const [editing, setEditing]   = useState(false);
  const [draft,   setDraft]     = useState({});
  const [saving,  setSaving]    = useState(false);
  const [saveErr, setSaveErr]   = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [showGenConfirm, setShowGenConfirm] = useState(false);

  useEffect(() => {
    fetch(`/api/enquiry/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setRow(d.data); setDraft(d.data); } else setFetchErr(d.error || 'Not found'); })
      .catch(() => setFetchErr('Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const setItem = (idx, k, v) => setDraft(d => {
    const items = [...(d.items || [])];
    items[idx] = { ...items[idx], [k]: v };
    return { ...d, items };
  });

  const handleSave = async () => {
    setSaving(true); setSaveErr('');
    try {
      const res  = await fetch(`/api/enquiry/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      setRow({ ...draft }); setEditing(false);
    } catch (e) { setSaveErr(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res  = await fetch(`/api/enquiry/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Delete failed');
      router.push('/dashboard/enquiry');
    } catch (e) { setSaveErr(e.message); setConfirmDel(false); }
    finally { setDeleting(false); }
  };

  const cancelEdit = () => { setEditing(false); setDraft({ ...row }); setSaveErr(''); };

  /* ── Loading / error ── */
  if (loading) return (
    <div className="page-wrapper">
      <style>{CSS}</style>
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A37AA" strokeWidth="2.5" strokeLinecap="round"
          style={{ animation: 'eqd-spin 0.8s linear infinite', display: 'inline-block' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <style>{`@keyframes eqd-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (fetchErr) return (
    <div className="page-wrapper">
      <style>{CSS}</style>
      <div className="eqd-content">
        <p style={{ color: '#c0392b', fontSize: 14 }}>⚠ {fetchErr}</p>
        <Link href="/dashboard/enquiry" style={{ color: '#1A37AA', fontSize: 13, marginTop: 12, display: 'inline-block' }}>← Back to enquiries</Link>
      </div>
    </div>
  );

  const isImmediate = draft.hasRequirement === true;

  return (
    <div className="page-wrapper">
      <style>{CSS}</style>
      <div className="eqd-root">
        <div className="eqd-content">

          {/* ── Page head ── */}
          <div className="eqd-page-head">
            <div>
              <div className="eqd-page-head-title">{row.customerName}</div>
              <div className="eqd-page-head-sub">{row.millName || 'Enquiry Detail'} &nbsp;·&nbsp; Added {fmtDate(row.createdAt)}</div>
            </div>
            <div className="eqd-page-head-actions">
              <Link href="/dashboard/enquiry" className="eqd-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Back
              </Link>

              {confirmDel ? (
                <>
                  <button className="eqd-btn eqd-btn--danger-confirm" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Confirm Delete'}
                  </button>
                  <button className="eqd-btn" onClick={() => setConfirmDel(false)}>Cancel</button>
                </>
              ) : (
                <button className="eqd-btn eqd-btn--danger" onClick={() => { setConfirmDel(true); setEditing(false); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                  </svg>
                  Delete
                </button>
              )}

              {editing ? (
                <button className="eqd-btn" onClick={cancelEdit}>Cancel</button>
              ) : (
                <button className="eqd-btn eqd-btn--edit-active" onClick={() => { setEditing(true); setConfirmDel(false); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* ── Section 1: Customer ── */}
          <Divider num="1" label="Customer Information" />
          <div className="g2">
            <Field label="Customer Name">
              {editing ? <input className="eqd-in" value={draft.customerName || ''} onChange={e => set('customerName', e.target.value)} /> : <Val v={draft.customerName} />}
            </Field>
            <Field label="Mill / Company Name">
              {editing ? <input className="eqd-in" value={draft.millName || ''} onChange={e => set('millName', e.target.value)} /> : <Val v={draft.millName} muted />}
            </Field>
            <Field label="Mobile No.">
              {editing ? <input className="eqd-in" value={draft.mobile || ''} onChange={e => set('mobile', e.target.value)} /> : <Val v={draft.mobile} />}
            </Field>
            <Field label="Email Address">
              {editing ? <input className="eqd-in" value={draft.email || ''} onChange={e => set('email', e.target.value)} /> : <Val v={draft.email} muted />}
            </Field>
            <Field label="GST No.">
              {editing ? <input className="eqd-in" value={draft.gst || ''} onChange={e => set('gst', e.target.value.toUpperCase())} maxLength={15} /> : <Val v={draft.gst} muted />}
            </Field>
            <Field label="Lead Source">
              {editing ? (
                <select className="eqd-sel" value={draft.source || ''} onChange={e => set('source', e.target.value)}>
                  <option value="">Select source</option>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : <Val v={draft.source} muted />}
            </Field>
          </div>

          {/* ── Section 2: Location ── */}
          <Divider num="2" label="Location Details" />
          <div className="g2">
            <Field label="City / Location">
              {editing ? <input className="eqd-in" value={draft.location || ''} onChange={e => set('location', e.target.value)} /> : <Val v={draft.location} />}
            </Field>
            <Field label="State">
              {editing ? <input className="eqd-in" value={draft.state || ''} onChange={e => set('state', e.target.value)} /> : <Val v={draft.state} muted />}
            </Field>
            <Field label="Full Address" cls="full">
              {editing ? <textarea className="eqd-ta" rows={3} value={draft.address || ''} onChange={e => set('address', e.target.value)} /> : <Val v={draft.address} muted />}
            </Field>
          </div>

          {/* ── Section 3: Requirement ── */}
          <Divider num="3" label="Requirement" />

          <Field label="Requirement Type">
            {editing ? (
              <div className="eqd-toggle">
                <button type="button" className={`eqd-toggle-btn${draft.hasRequirement === true ? ' eqd-toggle-btn--yes' : ''}`} onClick={() => set('hasRequirement', true)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Yes — Immediate
                </button>
                <button type="button" className={`eqd-toggle-btn${draft.hasRequirement === false ? ' eqd-toggle-btn--no' : ''}`} onClick={() => set('hasRequirement', false)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  No — Future
                </button>
              </div>
            ) : (
              <div className={`eqd-req-badge ${isImmediate ? 'immediate' : 'future'}`}>
                {isImmediate ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Yes — Immediate</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>No — Future</>
                )}
              </div>
            )}
          </Field>

          {/* Immediate items */}
          {isImmediate && draft.items?.length > 0 && (
            <div className="eqd-items">
              {draft.items.map((item, idx) => (
                <div key={idx} className="eqd-item">
                  <div className="eqd-item-head">
                    <span className="eqd-item-label">Item {idx + 1}</span>
                  </div>
                  <div className="eqd-item-body">
                    <div className="g2">
                      <Field label="Model No.">
                        {editing ? <input className="eqd-in" value={item.modelNo || ''} onChange={e => setItem(idx, 'modelNo', e.target.value)} /> : <Val v={item.modelNo} />}
                      </Field>
                      <Field label="Size">
                        {editing ? (
                          <select className="eqd-sel" value={item.size || ''} onChange={e => setItem(idx, 'size', e.target.value)}>
                            <option value="">Select size</option>
                            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : <Val v={item.size} muted />}
                      </Field>
                      <Field label="Quantity">
                        {editing ? <input className="eqd-in" value={item.qty || ''} onChange={e => setItem(idx, 'qty', e.target.value)} /> : <Val v={item.qty} />}
                      </Field>
                      <Field label="Price Region">
                        {editing ? (
                          <select className="eqd-sel" value={item.priceRegion || ''} onChange={e => setItem(idx, 'priceRegion', e.target.value)}>
                            <option value="">Select region</option>
                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : <Val v={item.priceRegion} muted />}
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Future fields */}
          {!isImmediate && (
            <div style={{ marginTop: 16 }}>
              <div className="eqd-future-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Future Requirement
              </div>
              <div className="g2">
                <Field label="Requirement Update / Notes" cls="full">
                  {editing ? <textarea className="eqd-ta" rows={4} value={draft.futureNote || ''} onChange={e => set('futureNote', e.target.value)} /> : <Val v={draft.futureNote} muted />}
                </Field>
                <Field label="Next Follow-up Date">
                  {editing ? <input className="eqd-in" type="date" value={draft.followUpDate || ''} onChange={e => set('followUpDate', e.target.value)} /> : <Val v={draft.followUpDate} />}
                </Field>
                <Field label="Probable Month of Order">
                  {editing ? <input className="eqd-in" placeholder="e.g. June 2025" value={draft.probableMonth || ''} onChange={e => set('probableMonth', e.target.value)} /> : <Val v={draft.probableMonth} muted />}
                </Field>
                <Field label="% Chances of Order">
                  {editing ? <input className="eqd-in" placeholder="e.g. 70%" value={draft.orderChances || ''} onChange={e => set('orderChances', e.target.value)} /> : <Val v={draft.orderChances ? `${draft.orderChances}%` : null} muted />}
                </Field>
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="eqd-footer">
            <div className="eqd-footer-meta">
              Added on <strong>{fmtDate(row.createdAt)}</strong>
              {saveErr && <span className="eqd-err" style={{ marginLeft: 16 }}>⚠ {saveErr}</span>}
            </div>
            <div className="eqd-footer-actions">
              {editing ? (
                <button className="eqd-btn eqd-btn--primary" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'eqd-spin 0.8s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              ) : (
                <button className="eqd-btn eqd-btn--primary" onClick={() => setShowGenConfirm(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  Generate Quotation
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Generate Quotation Confirmation ── */}
      {showGenConfirm && (
        <div className="eqd-overlay" onClick={e => { if (e.target === e.currentTarget) setShowGenConfirm(false); }}>
          <div className="eqd-popup">
            <div className="eqd-popup-body">
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: '#0d1828', marginBottom: 6 }}>Generate Quotation?</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#6b7a90', marginBottom: 20 }}>Are you sure you want to generate a quotation for <strong style={{ color: '#0d1828' }}>{row.customerName}</strong>?</p>
              <div className="eqd-popup-actions">
                <button className="eqd-popup-cancel" onClick={() => setShowGenConfirm(false)}>No, Cancel</button>
                <Link href="/dashboard/quotations/new" className="eqd-popup-confirm" style={{ textDecoration: 'none' }}>Yes, Generate</Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
