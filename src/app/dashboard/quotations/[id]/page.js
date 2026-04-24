'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { buildHTML as buildHTML1 } from '@/components/QuotationForm';
import { buildHTML as buildHTML2 } from '@/components/QuotationForm2';

const fmtINR = n => n ? '₹ ' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(+n) : '—';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Barlow+Condensed:wght@600;700&display=swap');

  .qv-root { height: 100vh; background: #a0a8b8; display: flex; flex-direction: column; overflow: hidden; }

  .qv-bar {
    position: sticky; top: 0; z-index: 100; height: 54px;
    background: #0d1828; border-bottom: 1px solid rgba(255,255,255,.07);
    display: flex; align-items: center; gap: 12px; padding: 0 20px;
    flex-shrink: 0;
  }
  .qv-bar-back {
    display: flex; align-items: center; gap: 6px;
    color: rgba(255,255,255,.38); font-size: 12px; font-weight: 500;
    font-family: 'DM Sans', sans-serif; text-decoration: none; letter-spacing: .2px;
    transition: color .15s; cursor: pointer; background: none; border: none; padding: 0;
  }
  .qv-bar-back:hover { color: rgba(255,255,255,.8); }
  .qv-bar-dot { width: 1px; height: 22px; background: rgba(255,255,255,.1); }
  .qv-bar-title {
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
    color: rgba(255,255,255,.4); letter-spacing: .2px;
  }
  .qv-bar-name {
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
    color: #fff; letter-spacing: .1px;
  }
  .qv-bar-sep { color: rgba(255,255,255,.2); font-size: 12px; }
  .qv-bar-space { flex: 1; }
  .qv-bar-chip {
    background: rgba(26,55,170,.35); border: 1px solid rgba(26,55,170,.5);
    border-radius: 5px; padding: 2px 8px; font-size: 10.5px; font-weight: 600;
    color: #7ea8ff; letter-spacing: .3px; font-family: 'Barlow Condensed', sans-serif;
  }

  /* share dropdown */
  .qv-share-wrap { position: relative; }
  .qv-share-btn {
    height: 30px; padding: 0 14px; border-radius: 6px;
    border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.07);
    color: rgba(255,255,255,.75); font-size: 12px; font-family: 'DM Sans', sans-serif;
    font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;
    transition: all .15s;
  }
  .qv-share-btn:hover { border-color: rgba(255,255,255,.35); background: rgba(255,255,255,.12); color: #fff; }
  .qv-share-dropdown {
    position: fixed;
    background: #fff; border: 1px solid #e0e8f2; border-radius: 12px; padding: 6px;
    box-shadow: 0 12px 40px rgba(13,24,40,.22), 0 2px 8px rgba(13,24,40,.08);
    min-width: 200px; z-index: 9999;
    animation: qv-drop-in .18s cubic-bezier(.34,1.3,.64,1) both;
  }
  @keyframes qv-drop-in {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .qv-share-item {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 9px 12px; border-radius: 8px;
    border: none; background: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    color: #0d1828; text-align: left; transition: background .12s;
  }
  .qv-share-item:hover { background: #f4f7fd; }
  .qv-share-icon {
    width: 28px; height: 28px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .qv-share-sep { height: 1px; background: #f0f3f8; margin: 4px 6px; }

  .qv-close-btn {
    height: 30px; padding: 0 14px; border-radius: 6px;
    border: 1px solid rgba(255,255,255,.12); background: transparent;
    color: rgba(255,255,255,.5); font-size: 12px; font-family: 'DM Sans', sans-serif;
    font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px;
    transition: all .15s;
  }
  .qv-close-btn:hover { border-color: rgba(255,255,255,.3); color: #fff; }

  .qv-iframe-wrap {
    flex: 1; overflow: auto; background: #a0a8b8;
    display: flex; justify-content: center; padding: 24px 16px 48px;
  }
  .qv-iframe-wrap iframe {
    border: none; width: 860px; height: 1200px;
    flex-shrink: 0; background: #fff;
    box-shadow: 0 8px 48px rgba(0,0,0,.35);
  }

  /* ── Audit panel ── */
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@600;700;800&display=swap');

  .qv-audit-panel {
    flex-shrink: 0; background: #07111e;
    border-left: 1px solid rgba(99,140,255,.12);
    display: flex; flex-direction: column; overflow: hidden;
    transition: width .3s cubic-bezier(.4,0,.2,1);
    position: relative;
  }
  .qv-audit-panel.open   { width: 320px; }
  .qv-audit-panel.closed { width: 40px; }

  /* ── Collapsed tab ── */
  .qv-audit-tab {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 14px;
    cursor: pointer; transition: background .15s;
    z-index: 2;
  }
  .qv-audit-tab:hover { background: rgba(99,140,255,.06); }
  .qv-audit-panel.open .qv-audit-tab { pointer-events: none; opacity: 0; transition: opacity .15s; }
  .qv-audit-tab-label {
    writing-mode: vertical-rl; text-orientation: mixed;
    transform: rotate(180deg);
    font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: rgba(255,255,255,.7); white-space: nowrap;
  }
  .qv-audit-tab-count {
    width: 20px; height: 20px; border-radius: 50%;
    background: rgba(99,140,255,.2); border: 1px solid rgba(99,140,255,.45);
    font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 600;
    color: #fff; display: flex; align-items: center; justify-content: center;
  }

  /* ── Open panel header ── */
  .qv-audit-head {
    padding: 0 18px; height: 52px; flex-shrink: 0;
    border-bottom: 1px solid rgba(99,140,255,.1);
    display: flex; align-items: center; justify-content: space-between;
    opacity: 0; pointer-events: none;
    transition: opacity .2s .05s;
  }
  .qv-audit-panel.open .qv-audit-head { opacity: 1; pointer-events: auto; }
  .qv-audit-head-left { display: flex; align-items: center; gap: 10px; }
  .qv-audit-title {
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    color: rgba(255,255,255,.9); letter-spacing: 1.5px; text-transform: uppercase;
  }
  .qv-audit-count-pill {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 600;
    color: #fff; background: rgba(99,140,255,.2);
    border: 1px solid rgba(99,140,255,.4); border-radius: 20px; padding: 1px 8px;
  }
  .qv-audit-collapse-btn {
    background: none; border: none; cursor: pointer; padding: 4px;
    color: rgba(255,255,255,.2); transition: color .15s;
    display: flex; align-items: center;
  }
  .qv-audit-collapse-btn:hover { color: rgba(255,255,255,.6); }

  /* ── Scroll area ── */
  .qv-audit-scroll {
    flex: 1; overflow-y: auto; padding: 18px 16px 32px;
    opacity: 0; pointer-events: none;
    transition: opacity .2s .05s;
    scrollbar-width: thin; scrollbar-color: rgba(99,140,255,.2) transparent;
  }
  .qv-audit-panel.open .qv-audit-scroll { opacity: 1; pointer-events: auto; }
  .qv-audit-scroll::-webkit-scrollbar { width: 4px; }
  .qv-audit-scroll::-webkit-scrollbar-thumb { background: rgba(99,140,255,.2); border-radius: 4px; }

  .qv-audit-empty {
    text-align: center; padding: 48px 0 32px;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    color: rgba(255,255,255,.45); line-height: 1.8;
  }
  .qv-audit-empty-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px;
  }

  /* ── Date divider ── */
  .qv-date-divider {
    display: flex; align-items: center; gap: 10px;
    margin: 22px 0 14px; padding: 0 2px;
  }
  .qv-date-divider:first-child { margin-top: 4px; }
  .qv-date-divider-line { flex: 1; height: 1px; background: rgba(99,140,255,.1); }
  .qv-date-divider-chip {
    font-family: 'IBM Plex Mono', monospace; font-size: 9.5px; font-weight: 600;
    color: #fff; letter-spacing: .5px;
    background: rgba(99,140,255,.18); border: 1px solid rgba(99,140,255,.35);
    border-radius: 20px; padding: 2px 10px; white-space: nowrap;
  }

  /* ── Entry card ── */
  .qv-entry-card {
    background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px; padding: 12px 13px 11px;
    margin-bottom: 8px; position: relative;
    overflow: hidden;
    animation: qv-card-in .25s cubic-bezier(.4,0,.2,1) both;
  }
  .qv-entry-card:last-child { margin-bottom: 0; }
  .qv-entry-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: linear-gradient(180deg, #638cff 0%, rgba(99,140,255,.3) 100%);
    border-radius: 3px 0 0 3px;
  }
  .qv-entry-card:nth-child(n+3)::before {
    background: linear-gradient(180deg, rgba(99,140,255,.4) 0%, rgba(99,140,255,.1) 100%);
  }
  @keyframes qv-card-in {
    from { opacity: 0; transform: translateX(8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .qv-entry-time {
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 500;
    color: #fff; letter-spacing: .3px;
    margin-bottom: 9px; display: flex; align-items: center; gap: 6px;
  }
  .qv-entry-time-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #638cff; flex-shrink: 0;
    box-shadow: 0 0 6px rgba(99,140,255,.7);
  }
  .qv-entry-card:nth-child(n+3) .qv-entry-time-dot {
    background: rgba(99,140,255,.4);
    box-shadow: none;
  }
  .qv-entry-card:nth-child(n+3) .qv-entry-time { color: rgba(255,255,255,.7); }
  .qv-entry-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .qv-entry-tag {
    font-family: 'DM Sans', sans-serif; font-size: 10.5px; font-weight: 600;
    color: rgba(255,255,255,.85); background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.15); border-radius: 5px; padding: 2px 8px;
    transition: border-color .12s, color .12s;
  }
  .qv-entry-card:hover .qv-entry-tag {
    border-color: rgba(99,140,255,.4); color: #fff;
  }

  .qv-body { flex: 1; display: flex; overflow: hidden; }

  @keyframes qv-spin { to { transform: rotate(360deg); } }

  /* ==========================================================
     RESPONSIVE STYLES - Mobile First
     ========================================================== */

  /* Mobile base styles */
  .qv-root {
    height: 100vh;
    background: #a0a8b8;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .qv-bar {
    height: auto;
    min-height: 56px;
    padding: 10px 12px;
    gap: 8px;
    flex-wrap: wrap;
  }

  .qv-bar-back {
    font-size: 11px;
    gap: 4px;
  }

  .qv-bar-dot {
    display: none;
  }

  .qv-bar-title {
    display: none;
  }

  .qv-bar-name {
    font-size: 12px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 120px;
  }

  .qv-bar-sep {
    display: none;
  }

  .qv-bar-space {
    display: none;
  }

  .qv-bar-chip {
    display: none;
  }

  /* Share and Close buttons */
  .qv-share-btn,
  .qv-close-btn {
    height: 36px;
    padding: 0 12px;
    font-size: 11px;
    flex-shrink: 0;
  }

  .qv-share-btn span,
  .qv-close-btn span {
    display: none;
  }

  /* Iframe wrapper */
  .qv-iframe-wrap {
    flex: 1;
    overflow: auto;
    background: #a0a8b8;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 12px 8px;
    -webkit-overflow-scrolling: touch;
  }

  .qv-iframe-wrap iframe {
    border: none;
    width: 860px;
    flex-shrink: 0;
    background: #fff;
    box-shadow: 0 4px 24px rgba(0,0,0,.2);
    zoom: var(--iframe-scale, 1);
  }

  /* Audit panel - hidden by default on mobile */
  .qv-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    flex-direction: column;
  }

  .qv-audit-panel {
    flex-shrink: 0;
    background: #07111e;
    border-top: 1px solid rgba(99,140,255,.12);
    border-left: none;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
    height: 48px;
    transition: height .3s cubic-bezier(.4,0,.2,1);
  }

  .qv-audit-panel.open {
    width: 100%;
    height: 40vh;
    min-height: 240px;
    max-height: 420px;
  }

  .qv-audit-panel.closed {
    width: 100%;
    height: 48px;
  }

  /* Collapsed tab - horizontal on mobile */
  .qv-audit-tab {
    position: relative;
    inset: auto;
    flex-direction: row;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    height: 48px;
  }

  .qv-audit-panel.open .qv-audit-tab {
    display: none;
  }

  .qv-audit-tab-label {
    writing-mode: horizontal-tb;
    transform: none;
    font-size: 12px;
  }

  /* Audit panel header */
  .qv-audit-head {
    padding: 0 14px;
    height: 48px;
    flex-shrink: 0;
    border-bottom: 1px solid rgba(99,140,255,.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .qv-audit-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    opacity: 1;
    pointer-events: auto;
  }

  .qv-audit-panel.closed .qv-audit-scroll {
    opacity: 0;
    pointer-events: none;
    height: 0;
  }

  /* Entry cards */
  .qv-entry-card {
    padding: 10px 12px;
  }

  .qv-entry-time {
    font-size: 10px;
    margin-bottom: 6px;
  }

  .qv-entry-tag {
    font-size: 10px;
    padding: 2px 6px;
  }


  /* Loading spinner */
  .qv-loading {
    position: fixed;
    inset: 0;
    background: rgba(13,24,40,.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    z-index: 9999;
  }

  /* Tablet (768px and up) */
  @media (min-width: 768px) {
    .qv-bar {
      height: 54px;
      min-height: auto;
      padding: 0 20px;
      gap: 12px;
      flex-wrap: nowrap;
    }

    .qv-bar-back {
      font-size: 12px;
      gap: 6px;
    }

    .qv-bar-dot {
      display: block;
    }

    .qv-bar-title {
      display: block;
    }

    .qv-bar-name {
      font-size: 13px;
      flex: none;
      max-width: none;
    }

    .qv-bar-sep {
      display: inline;
    }

    .qv-bar-space {
      display: block;
    }

    .qv-bar-chip {
      display: block;
    }

    .qv-share-btn,
    .qv-close-btn {
      height: 30px;
      padding: 0 14px;
      font-size: 12px;
    }

    .qv-share-btn span,
    .qv-close-btn span {
      display: inline;
    }

    .qv-iframe-wrap {
      padding: 24px 16px 48px;
    }

    .qv-iframe-wrap iframe {
      box-shadow: 0 8px 48px rgba(0,0,0,.35);
    }

    /* Audit panel on the right */
    .qv-body {
      flex-direction: row;
    }

    .qv-audit-panel {
      border-top: none;
      border-left: 1px solid rgba(99,140,255,.12);
      width: auto;
      height: auto;
    }

    .qv-audit-panel.open {
      width: 320px;
      height: auto;
    }

    .qv-audit-panel.closed {
      width: 40px;
      height: auto;
    }

    .qv-audit-tab {
      position: absolute;
      inset: 0;
      flex-direction: column;
      justify-content: center;
      gap: 14px;
      padding: 0;
    }

    .qv-audit-tab-label {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      font-size: 10px;
    }

    .qv-audit-scroll {
      padding: 18px 16px 32px;
      opacity: 0;
      pointer-events: none;
    }

    .qv-audit-panel.open .qv-audit-scroll {
      opacity: 1;
      pointer-events: auto;
    }

  }

  /* Extra small mobile */
  @media (max-width: 360px) {
    .qv-bar {
      min-height: 52px;
      padding: 8px 10px;
    }

    .qv-bar-name {
      max-width: 100px;
    }

    .qv-iframe-wrap {
      padding: 8px 4px;
    }
  }
`;

export default function QuotationViewPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [record, setRecord]     = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const shareBtnRef = useRef(null);
  const [auditLog, setAuditLog] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditOpen, setAuditOpen] = useState(true);
  const iframeWrapRef = useRef(null);

  // Zoom iframe to fit available width on mobile
  useEffect(() => {
    const applyScale = () => {
      if (!iframeWrapRef.current) return;
      const available = iframeWrapRef.current.clientWidth - 16; // subtract padding
      const scale = available < 860 ? Math.max(0.28, available / 860) : 1;
      iframeWrapRef.current.style.setProperty('--iframe-scale', scale);
    };
    applyScale();
    window.addEventListener('resize', applyScale);
    return () => window.removeEventListener('resize', applyScale);
  }, [record]);

  useEffect(() => {
    // Extract enquiryId from composite doc ID (e.g. "abc123_1page" → "abc123")
    const enquiryId = id.includes('_') ? id.split('_').slice(0, -1).join('_') : null;
    if (enquiryId) {
      setAuditLoading(true);
      fetch(`/api/enquiry/${enquiryId}/auditLog`)
        .then(r => r.json())
        .then(d => { if (d.success) setAuditLog(d.data || []); })
        .catch(() => {})
        .finally(() => setAuditLoading(false));
    }
  }, [id]);

  useEffect(() => {
    fetch(`/api/quotations/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) setRecord(d.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return (
    <div className="qv-root">
      <style>{CSS}</style>
      <div className="qv-bar">
        <button className="qv-bar-back" onClick={() => router.push('/dashboard/quotations')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          All Quotations
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 700, color: '#fff' }}>Quotation not found</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,.5)' }}>ID: {id}</div>
      </div>
    </div>
  );

  if (!record) return (
    <div className="qv-root">
      <style>{CSS}</style>
      <div className="qv-bar" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'qv-spin 0.8s linear infinite' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <style>{`@keyframes qv-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  const base = Math.round(parseFloat(record.basePrice) || 0);
  const html = record.quotationType === 'detailed'
    ? buildHTML2(record)
    : buildHTML1(record, { base, gstAmt: record.gstAmt || 0, total: record.total || 0 });

  const shareText = () => [
    `Dear ${record.salutation} ${record.contact},`,
    ``,
    `Please find the quotation from Unique Sorter & Equipments Pvt. Ltd.`,
    ``,
    `Quotation No: ${record.quotNo || '—'}`,
    `Product: ${record.descLine1 || record.model || '—'}`,
    `Quantity: ${record.qty}`,
    `Total Amount (incl. GST): ${record.total ? fmtINR(record.total) : '—'}`,
    ``,
    `For queries: raipur@uniquesorter.in | www.uniquesorter.in`,
  ].join('\n');

  const handleShareWhatsApp = () => {
    const phone = record.mobile?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone ? '91' + phone : ''}?text=${encodeURIComponent(shareText())}`, '_blank');
    setShowShare(false);
  };

  const handleShareGmail = () => {
    const subject = encodeURIComponent(`Quotation ${record.quotNo || ''} — Unique Sorter & Equipments Pvt. Ltd.`);
    const to = record.email ? encodeURIComponent(record.email) : '';
    window.open(`https://mail.google.com/mail/?view=cm&to=${to}&su=${subject}&body=${encodeURIComponent(shareText())}`, '_blank');
    setShowShare(false);
  };

  const handleDownload = async () => {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rawStyle = doc.querySelector('style')?.textContent || '';
    const cleanStyle = rawStyle.replace(/\bbody\s*\{[^}]*\}/gs, '').replace(/\bhtml\s*\{[^}]*\}/gs, '');
    const page = doc.querySelector('.page');
    if (!page) return;
    const stampB64 = await fetch('/stamp.png').then(r => r.blob()).then(blob => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); }));
    const stampImg = page.querySelector('img[alt="Company Stamp"]');
    if (stampImg) stampImg.src = stampB64;
    const styleEl = document.createElement('style');
    styleEl.textContent = cleanStyle;
    document.head.appendChild(styleEl);
    const shell = document.createElement('div');
    shell.style.cssText = 'position:fixed;top:0;left:-9999px;width:794px;overflow:visible;z-index:-1;';
    shell.appendChild(page);
    document.body.appendChild(shell);
    await document.fonts.ready;
    await Promise.all(Array.from(shell.querySelectorAll('img')).map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })));
    await new Promise(r => setTimeout(r, 200));
    const filename = `Quotation${record.quotNo ? `_${record.quotNo.replace(/\//g, '-')}` : ''}.pdf`;
    try {
      const canvas = await html2canvas(page, { scale: 2, useCORS: true, logging: false, width: 794, windowWidth: 794, scrollX: 0, scrollY: 0 });
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const imgH = pdfW * (canvas.height / canvas.width);
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, pdfW, Math.min(imgH, pdf.internal.pageSize.getHeight()));
      pdf.save(filename);
    } finally {
      document.body.removeChild(shell);
      document.head.removeChild(styleEl);
    }
    setShowShare(false);
  };

  return (
    <div className="qv-root">
      <style>{CSS}</style>

      <div className="qv-bar">
        <button className="qv-bar-back" onClick={() => router.push('/dashboard/quotations')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          All Quotations
        </button>
        <div className="qv-bar-dot" />
        <span className="qv-bar-title">Quotation</span>
        {record.quotNo && <><span className="qv-bar-sep">·</span><span className="qv-bar-name">{record.quotNo}</span></>}
        {record.contact && <><span className="qv-bar-sep">·</span><span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{record.salutation} {record.contact}</span></>}
        {record.quotationType === '1page'    && <span className="qv-bar-chip">1-PAGE</span>}
        {record.quotationType === 'detailed' && <span className="qv-bar-chip" style={{ background: 'rgba(82,186,79,.25)', borderColor: 'rgba(82,186,79,.5)', color: '#7edd7b' }}>DETAILED · 6 PG</span>}
        <div className="qv-bar-space" />

        {/* Edit enquiry button */}
        {record.enquiryId && (
          <button
            style={{ height: 30, padding: '0 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,.18)', background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.75)', fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.35)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.18)'; e.currentTarget.style.color = 'rgba(255,255,255,.75)'; }}
            onClick={() => router.push(`/dashboard/enquiry/${record.enquiryId}`)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
            </svg>
            Edit Enquiry
          </button>
        )}

        {/* Share dropdown */}
        <div className="qv-share-wrap">
          <button className="qv-share-btn" ref={shareBtnRef} onClick={() => {
            if (!showShare && shareBtnRef.current) {
              const r = shareBtnRef.current.getBoundingClientRect();
              const dropW = 212;
              const left = Math.min(r.right - dropW, window.innerWidth - dropW - 8);
              setDropdownPos({ top: r.bottom + 8, left: Math.max(8, left) });
            }
            setShowShare(s => !s);
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {showShare && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setShowShare(false)} />
              <div className="qv-share-dropdown" style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, right: 'auto' }}>
                <button className="qv-share-item" onClick={handleShareWhatsApp}>
                  <span className="qv-share-icon" style={{ background: '#e8f8ee' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M11.998 2C6.476 2 2 6.476 2 11.998c0 1.76.456 3.411 1.253 4.845L2 22l5.299-1.24A9.966 9.966 0 0 0 11.998 22C17.52 22 22 17.524 22 11.998 22 6.476 17.52 2 11.998 2z" fill="none" stroke="#25D366" strokeWidth="0"/>
                    </svg>
                  </span>
                  Share on WhatsApp
                </button>
                <button className="qv-share-item" onClick={handleShareGmail}>
                  <span className="qv-share-icon" style={{ background: '#fdecea' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/></svg>
                  </span>
                  Send via Gmail
                </button>
                <div className="qv-share-sep" />
                <button className="qv-share-item" onClick={handleDownload}>
                  <span className="qv-share-icon" style={{ background: '#eef1fb' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A37AA" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </span>
                  Download PDF
                </button>
              </div>
            </>
          )}
        </div>

        <button className="qv-close-btn" onClick={() => router.push('/dashboard/quotations')}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Close
        </button>
      </div>

      <div className="qv-body">
        <div ref={iframeWrapRef} className="qv-iframe-wrap">
          <iframe
            srcDoc={html}
            title="Quotation"
            style={{ height: record.quotationType === 'detailed' ? 8400 : 1400 }}
          />
        </div>

        {/* Audit log panel */}
        <div className={`qv-audit-panel ${auditOpen ? 'open' : 'closed'}`}>

          {/* Collapsed tab — visible only when closed */}
          <div className="qv-audit-tab" onClick={() => setAuditOpen(true)}>
            <span className="qv-audit-tab-label">History</span>
            <span className="qv-audit-tab-count">{auditLog.length}</span>
          </div>

          {/* Open header */}
          <div className="qv-audit-head">
            <div className="qv-audit-head-left">
              <span className="qv-audit-title">Change History</span>
              <span className="qv-audit-count-pill">{auditLog.length}</span>
            </div>
            <button className="qv-audit-collapse-btn" onClick={() => setAuditOpen(false)} title="Collapse">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <div className="qv-audit-scroll">
            {auditLoading ? (
              <div className="qv-audit-empty">
                <div className="qv-audit-empty-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(99,140,255,.4)" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'qv-spin 0.9s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </div>
                Loading audit log…
              </div>
            ) : auditLog.length === 0 ? (
              <div className="qv-audit-empty">
                <div className="qv-audit-empty-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>
                  </svg>
                </div>
                No edits recorded yet.<br/>Changes will appear here<br/>after the first save.
              </div>
            ) : (() => {
              // Group entries by date
              let lastDate = null;
              const items = [];
              auditLog.forEach((entry, idx) => {
                const ts = entry.timestamp ? new Date(entry.timestamp) : null;
                const dateKey = ts ? ts.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                if (dateKey !== lastDate) {
                  lastDate = dateKey;
                  items.push(<div key={`d-${idx}`} className="qv-date-divider"><div className="qv-date-divider-line"/><span className="qv-date-divider-chip">{dateKey}</span><div className="qv-date-divider-line"/></div>);
                }
                const timeStr = ts ? ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
                items.push(
                  <div key={entry.id} className="qv-entry-card" style={{ animationDelay: `${idx * 40}ms` }}>
                    <div className="qv-entry-time">
                      <span className="qv-entry-time-dot"/>
                      {timeStr}
                    </div>
                    <div className="qv-entry-tags">
                      {(entry.fields || []).map((label, i) => (
                        <span key={i} className="qv-entry-tag">{label}</span>
                      ))}
                    </div>
                  </div>
                );
              });
              return items;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
