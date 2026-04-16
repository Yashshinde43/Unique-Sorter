'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ─── Number helpers ──────────────────────────────────────────── */
const fmtINR = n => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(+n || 0);
const ONES = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const TENS = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
const _2 = n => !n?'':n<20?ONES[n]:TENS[~~(n/10)]+(n%10?' '+ONES[n%10]:'');
const _3 = n => !n?'':n<100?_2(n):ONES[~~(n/100)]+' Hundred'+(n%100?' '+_2(n%100):'');
function toWords(a) {
  const n=Math.round(+a||0); if(!n) return '';
  let r=n; const p=[];
  const c=~~(r/1e7);r%=1e7; const l=~~(r/1e5);r%=1e5; const t=~~(r/1e3);r%=1e3;
  if(c)p.push(_2(c)+' Crore'); if(l)p.push(_2(l)+' Lakh');
  if(t)p.push(_2(t)+' Thousand'); if(r)p.push(_3(r));
  return 'Rs. '+p.join(' ')+' Only.';
}
const todayISO = () => new Date().toISOString().split('T')[0];

const INIT = () => ({
  refNo:'', refDate:todayISO(), quotNo:'', quotDate:todayISO(),
  salutation:'Mr.', contact:'', company:'', addr1:'', addr2:'',
  city:'', state:'', mobile:'', email:'',
  qty:'01 Set.', shortName:'', descLine1:'', descLine2:'', hsn:'',
  basePrice:'', gstRate:'18',
  note:'',
  payTerms:'50% as advance & balance 12 EMI against PDCs (to be submitted during order booking) starting from the next month of billing.',
  delivery:'', leadDays:'', commodity:'', electricity:'', validity:'90',
  freight:'', warranty:'One year.',
  cancellation:'Order once confirmed & processed cannot be cancelled.',
});

/* ─── Styles ──────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Barlow+Condensed:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .qf-root {
    min-height: 100vh;
    background: #eef0f5;
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(26,55,170,.07) 0%, transparent 60%);
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Top bar ── */
  .qf-bar {
    position: sticky; top: 0; z-index: 100;
    height: 52px;
    background: #0d1828;
    border-bottom: 1px solid rgba(255,255,255,.06);
    display: flex; align-items: center; gap: 12px; padding: 0 24px;
  }
  .qf-bar-back {
    display: flex; align-items: center; gap: 6px;
    color: rgba(255,255,255,.38); font-size: 12px; font-weight: 500;
    text-decoration: none; letter-spacing: .2px;
    transition: color .15s;
  }
  .qf-bar-back:hover { color: rgba(255,255,255,.8); }
  .qf-bar-dot { width: 1px; height: 22px; background: rgba(255,255,255,.1); }
  .qf-bar-title {
    font-family: 'Syne', sans-serif; font-size: 13.5px; font-weight: 700;
    color: #fff; letter-spacing: .2px;
  }
  .qf-bar-chip {
    background: rgba(26,55,170,.35); border: 1px solid rgba(26,55,170,.5);
    border-radius: 5px; padding: 2px 8px; font-size: 10.5px; font-weight: 600;
    color: #7ea8ff; letter-spacing: .3px; font-family: 'Barlow Condensed', sans-serif;
  }
  .qf-bar-space { flex: 1; }
  .qf-bar-btn {
    height: 30px; padding: 0 14px; border-radius: 6px;
    border: 1px solid rgba(255,255,255,.12); background: transparent;
    color: rgba(255,255,255,.45); font-size: 12px; font-family: 'DM Sans', sans-serif;
    font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px;
    transition: all .15s; letter-spacing: .1px;
  }
  .qf-bar-btn:hover { border-color: rgba(255,255,255,.28); color: rgba(255,255,255,.8); }
  .qf-bar-btn-primary {
    height: 30px; padding: 0 16px; border-radius: 6px;
    border: none; background: #1A37AA; color: #fff;
    font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    box-shadow: 0 2px 10px rgba(26,55,170,.5); transition: all .15s;
  }
  .qf-bar-btn-primary:hover { background: #1e42cc; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,55,170,.55); }

  /* ── Page content ── */
  .qf-content { max-width: 900px; margin: 0 auto; padding: 32px 20px 80px; }

  .qf-page-head { margin-bottom: 24px; }
  .qf-page-head h1 {
    font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800;
    color: #0d1828; letter-spacing: -.3px; line-height: 1.2;
  }
  .qf-page-head p { font-size: 13px; color: #8898aa; margin-top: 4px; }

  /* ── The single card ── */
  .qf-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow:
      0 1px 2px rgba(15,25,50,.04),
      0 4px 16px rgba(15,25,50,.06),
      0 20px 60px rgba(15,25,50,.05);
    overflow: hidden;
    animation: qf-rise .4s cubic-bezier(.22,.68,0,1.1) both;
  }
  @keyframes qf-rise {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Card top accent bar */
  .qf-card-accent {
    height: 4px;
    background: linear-gradient(90deg, #1A37AA 0%, #4169e1 50%, #52ba4f 100%);
  }

  .qf-card-body { padding: 32px 36px 36px; }

  /* ── Section divider (inline, not a separate card) ── */
  .qf-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 28px 0 20px;
  }
  .qf-divider-label {
    font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700;
    color: #1A37AA; text-transform: uppercase; letter-spacing: 1.4px;
    white-space: nowrap;
  }
  .qf-divider-line { flex: 1; height: 1px; background: #e8ecf5; }

  /* ── Grid layouts ── */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .g4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
  .full { grid-column: 1 / -1; }
  .mt { margin-top: 16px; }

  /* ── Field ── */
  .qf-f { display: flex; flex-direction: column; gap: 6px; }
  .qf-lbl {
    font-size: 10px; font-weight: 700; color: #9aa5b8;
    text-transform: uppercase; letter-spacing: .7px;
    display: flex; align-items: center; gap: 4px;
  }
  .req { color: #e05555; }

  /* ── Inputs ── */
  .qf-in, .qf-sel, .qf-ta {
    width: 100%; border: 1.5px solid #e8ecf5; border-radius: 9px;
    padding: 10px 13px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #0d1828; background: #fff; line-height: 1.5;
    transition: border-color .18s, box-shadow .18s, background .18s;
  }
  .qf-in::placeholder, .qf-ta::placeholder { color: #c2cad8; }
  .qf-in:hover, .qf-sel:hover, .qf-ta:hover { border-color: #c5cfe0; }
  .qf-in:focus, .qf-sel:focus, .qf-ta:focus {
    border-color: #1A37AA;
    box-shadow: 0 0 0 3px rgba(26,55,170,.09);
    outline: none;
    background: #fafbff;
  }
  .qf-ta { resize: vertical; min-height: 76px; }
  .qf-sel {
    cursor: pointer; appearance: none; padding-right: 34px;
    background-image: url("data:image/svg+xml,%3Csvg width='11' height='7' viewBox='0 0 11 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5.5 5.5L10 1' stroke='%239aa5b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
  }
  .qf-in.readonly {
    background: #f7f9fc; color: #8898aa; cursor: default;
    border-color: #edf0f7; border-style: dashed;
  }
  .qf-in.readonly:hover, .qf-in.readonly:focus {
    border-color: #edf0f7; box-shadow: none; background: #f7f9fc;
  }

  /* salutation + name combo */
  .qf-combo { display: flex; gap: 8px; }
  .qf-combo .qf-sel { width: 78px; flex-shrink: 0; }
  .qf-combo .qf-in  { flex: 1; }

  /* ── Pricing panel ── */
  .qf-pricing-panel {
    background: #0d1828;
    border-radius: 12px;
    padding: 20px 22px;
    margin-top: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    position: relative;
    overflow: hidden;
  }
  .qf-pricing-panel::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 80% at 100% 50%, rgba(26,55,170,.25) 0%, transparent 70%);
    pointer-events: none;
  }
  .qf-pricing-left { display: flex; flex-direction: column; gap: 10px; padding-right: 22px; border-right: 1px solid rgba(255,255,255,.08); }
  .qf-pricing-right { display: flex; flex-direction: column; justify-content: center; padding-left: 22px; }
  .qf-pricing-row { display: flex; justify-content: space-between; align-items: center; }
  .qf-pricing-lbl { font-size: 11.5px; color: rgba(255,255,255,.45); }
  .qf-pricing-val { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 600; color: rgba(255,255,255,.75); letter-spacing: .3px; }
  .qf-pricing-sep { height: 1px; background: rgba(255,255,255,.07); margin: 4px 0; }
  .qf-total-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .qf-total-amount { font-family: 'Barlow Condensed', sans-serif; font-size: 34px; font-weight: 800; color: #fff; letter-spacing: .5px; line-height: 1; }
  .qf-total-words { font-size: 11px; color: rgba(255,255,255,.35); font-style: italic; margin-top: 7px; line-height: 1.5; }

  /* ── Footer actions ── */
  .qf-footer { margin-top: 32px; display: flex; justify-content: flex-end; gap: 10px; align-items: center; }
  .qf-footer-reset {
    height: 42px; padding: 0 20px; border-radius: 9px;
    border: 1.5px solid #e2e8f0; background: transparent;
    color: #8898aa; font-size: 13px; font-family: 'DM Sans', sans-serif;
    font-weight: 500; cursor: pointer; transition: all .15s;
  }
  .qf-footer-reset:hover { border-color: #c5cfe0; color: #0d1828; }
  .qf-footer-save {
    height: 42px; padding: 0 28px; border-radius: 9px;
    border: none; background: #1A37AA; color: #fff;
    font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px;
    box-shadow: 0 2px 12px rgba(26,55,170,.45); transition: all .18s;
    letter-spacing: .1px;
  }
  .qf-footer-save:hover { background: #1e42cc; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,55,170,.5); }
`;

/* ─── Tiny helpers ────────────────────────────────────────────── */
function Div({ label }) {
  return (
    <div className="qf-divider">
      <span className="qf-divider-label">{label}</span>
      <span className="qf-divider-line"/>
    </div>
  );
}
function F({ label, full, required, children }) {
  return (
    <div className={`qf-f${full ? ' full' : ''}`}>
      <label className="qf-lbl">{label}{required && <span className="req">*</span>}</label>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
export default function QuotationForm() {
  const [f, setF] = useState(INIT());
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const base    = parseFloat(f.basePrice) || 0;
  const gstRate = parseFloat(f.gstRate) || 0;
  const gstAmt  = base * gstRate / 100;
  const total   = base + gstAmt;

  return (
    <div className="qf-root">
      <style>{CSS}</style>

      {/* TOP BAR */}
      <div className="qf-bar">
        <Link href="/dashboard" className="qf-bar-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Dashboard
        </Link>
        <div className="qf-bar-dot"/>
        <span className="qf-bar-title">New Quotation</span>
        {f.quotNo && <span className="qf-bar-chip">{f.quotNo}</span>}
        <div className="qf-bar-space"/>
        <button className="qf-bar-btn" onClick={() => setF(INIT())}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          Reset
        </button>
        <button className="qf-bar-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview
        </button>
        <button className="qf-bar-btn-primary">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Quotation
        </button>
      </div>

      <div className="qf-content">

        <div className="qf-page-head">
          <h1>Create Quotation</h1>
          <p>Fill in the details below to generate a client quotation.</p>
        </div>

        {/* ── THE SINGLE CARD ── */}
        <div className="qf-card">
          <div className="qf-card-accent"/>
          <div className="qf-card-body">

            {/* ── QUOTATION REFERENCE ── */}
            <Div label="Quotation Reference"/>
            <div className="g4">
              <F label="Ref Number" required>
                <input className="qf-in" value={f.refNo} onChange={e => set('refNo', e.target.value)} placeholder="USEPL/Q-D/2026/001/R0"/>
              </F>
              <F label="Ref Date" required>
                <input className="qf-in" type="date" value={f.refDate} onChange={e => set('refDate', e.target.value)}/>
              </F>
              <F label="Quotation Number" required>
                <input className="qf-in" value={f.quotNo} onChange={e => set('quotNo', e.target.value)} placeholder="USE/DNR-001/R0"/>
              </F>
              <F label="Quotation Date" required>
                <input className="qf-in" type="date" value={f.quotDate} onChange={e => set('quotDate', e.target.value)}/>
              </F>
            </div>

            {/* ── CLIENT DETAILS ── */}
            <Div label="Client Details"/>
            <div className="g2">
              <F label="Contact Person" required>
                <div className="qf-combo">
                  <select className="qf-sel" value={f.salutation} onChange={e => set('salutation', e.target.value)}>
                    <option>Mr.</option><option>Ms.</option><option>Mrs.</option>
                    <option>Dr.</option><option>Er.</option>
                  </select>
                  <input className="qf-in" value={f.contact} onChange={e => set('contact', e.target.value)} placeholder="Full name"/>
                </div>
              </F>
              <F label="Company Name (M/s)" required>
                <input className="qf-in" value={f.company} onChange={e => set('company', e.target.value)} placeholder="Ganapati Agro"/>
              </F>
            </div>
            <div className="mt">
              <F label="Address Line 1" full>
                <input className="qf-in" value={f.addr1} onChange={e => set('addr1', e.target.value)} placeholder="Street / Village / Colony"/>
              </F>
            </div>
            <div className="g3 mt">
              <F label="Address Line 2">
                <input className="qf-in" value={f.addr2} onChange={e => set('addr2', e.target.value)} placeholder="Taluka / Block (optional)"/>
              </F>
              <F label="City / District">
                <input className="qf-in" value={f.city} onChange={e => set('city', e.target.value)} placeholder="Kalahandi"/>
              </F>
              <F label="State">
                <input className="qf-in" value={f.state} onChange={e => set('state', e.target.value)} placeholder="ODISHA"/>
              </F>
            </div>
            <div className="g2 mt">
              <F label="Mobile" required>
                <input className="qf-in" value={f.mobile} onChange={e => set('mobile', e.target.value)} placeholder="9178222555"/>
              </F>
              <F label="Email">
                <input className="qf-in" type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="client@example.com"/>
              </F>
            </div>

            {/* ── PRODUCT DETAILS ── */}
            <Div label="Product Details"/>
            <div className="g4">
              <F label="Quantity" required>
                <input className="qf-in" value={f.qty} onChange={e => set('qty', e.target.value)} placeholder="01 Set."/>
              </F>
              <F label="Model Short Name" required>
                <input className="qf-in" value={f.shortName} onChange={e => set('shortName', e.target.value)} placeholder="Sorter Machine"/>
              </F>
              <F label="HSN Code" required>
                <input className="qf-in" value={f.hsn} onChange={e => set('hsn', e.target.value)} placeholder="84371000"/>
              </F>
              <F label="Base Price (₹)" required>
                <input className="qf-in" type="number" value={f.basePrice} onChange={e => set('basePrice', e.target.value)} placeholder="3135593"/>
              </F>
            </div>
            <div className="g2 mt">
              <F label="Description Line 1" required>
                <input className="qf-in" value={f.descLine1} onChange={e => set('descLine1', e.target.value)} placeholder="Color sorting Machine (USEPL-8V) PINNACLE"/>
              </F>
              <F label="Description Line 2">
                <input className="qf-in" value={f.descLine2} onChange={e => set('descLine2', e.target.value)} placeholder="With AI (Advance intelligent Algorithm)"/>
              </F>
            </div>
            <div className="mt">
              <F label="Note / Exclusions" full>
                <textarea className="qf-ta" value={f.note} onChange={e => set('note', e.target.value)} placeholder="Items not included in supply — e.g. Compressor, Dryer, Receiver Tank, Air Filters…"/>
              </F>
            </div>

            {/* ── PRICING & GST ── */}
            <Div label="Pricing & GST"/>
            <div className="g3">
              <F label="GST Rate" required>
                <select className="qf-sel" value={f.gstRate} onChange={e => set('gstRate', e.target.value)}>
                  <option value="0">0% — Exempt</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </F>
              <F label="GST Amount (₹)">
                <input className="qf-in readonly" readOnly value={base ? fmtINR(gstAmt) : ''} placeholder="Auto-calculated"/>
              </F>
              <F label="Total Amount (₹)">
                <input className="qf-in readonly" readOnly value={base ? fmtINR(total) : ''} placeholder="Auto-calculated"/>
              </F>
            </div>

            {base > 0 && (
              <div className="qf-pricing-panel">
                <div className="qf-pricing-left">
                  <div className="qf-pricing-row">
                    <span className="qf-pricing-lbl">Base Price (excl. GST)</span>
                    <span className="qf-pricing-val">₹ {fmtINR(base)}</span>
                  </div>
                  <div className="qf-pricing-sep"/>
                  <div className="qf-pricing-row">
                    <span className="qf-pricing-lbl">GST @ {gstRate}%</span>
                    <span className="qf-pricing-val">₹ {fmtINR(gstAmt)}</span>
                  </div>
                  <div className="qf-pricing-sep"/>
                  <div className="qf-pricing-row">
                    <span className="qf-pricing-lbl">Total Payable</span>
                    <span className="qf-pricing-val" style={{ color: '#fff', fontSize: 17 }}>₹ {fmtINR(total)}</span>
                  </div>
                </div>
                <div className="qf-pricing-right">
                  <div className="qf-total-label">Amount in Words</div>
                  <div className="qf-total-amount">₹{fmtINR(total)}</div>
                  <div className="qf-total-words">{toWords(total)}</div>
                </div>
              </div>
            )}

            {/* ── TERMS & CONDITIONS ── */}
            <Div label="Terms & Conditions"/>
            <F label="Payment Terms" full required>
              <textarea className="qf-ta" value={f.payTerms} onChange={e => set('payTerms', e.target.value)}/>
            </F>
            <div className="g2 mt">
              <F label="Point of Delivery" required>
                <input className="qf-in" value={f.delivery} onChange={e => set('delivery', e.target.value)} placeholder="e.g. Sanyasikundamal [ODISHA]"/>
              </F>
              <F label="Dispatch Lead Time">
                <input className="qf-in" value={f.leadDays} onChange={e => set('leadDays', e.target.value)} placeholder="5-6 Days"/>
              </F>
            </div>
            <div className="g3 mt">
              <F label="Commodity" required>
                <input className="qf-in" value={f.commodity} onChange={e => set('commodity', e.target.value)} placeholder="RICE"/>
              </F>
              <F label="Validity (Days)" required>
                <input className="qf-in" value={f.validity} onChange={e => set('validity', e.target.value)} placeholder="90"/>
              </F>
              <F label="Electricity Supply">
                <input className="qf-in" value={f.electricity} onChange={e => set('electricity', e.target.value)} placeholder="220 V Frequency- 50Hz."/>
              </F>
            </div>
            <div className="g3 mt">
              <F label="Freight">
                <input className="qf-in" value={f.freight} onChange={e => set('freight', e.target.value)} placeholder="Extra at actual from Raipur"/>
              </F>
              <F label="Warranty">
                <input className="qf-in" value={f.warranty} onChange={e => set('warranty', e.target.value)} placeholder="One year."/>
              </F>
              <F label="Cancellation Policy">
                <input className="qf-in" value={f.cancellation} onChange={e => set('cancellation', e.target.value)}/>
              </F>
            </div>
            <div className="g2 mt">
              <F label="Payment in Favour Of">
                <input className="qf-in readonly" readOnly value="UNIQUE SORTER & EQUIPMENTS PVT LTD"/>
              </F>
              <F label="Bank Details">
                <input className="qf-in readonly" readOnly value="A/c No- 004784600001921 | IFSC: YESB0000047 | YES BANK, Civil Lines, Raipur"/>
              </F>
            </div>

            {/* ── FOOTER ACTIONS ── */}
            <div className="qf-footer">
              <button className="qf-footer-reset" onClick={() => setF(INIT())}>Reset Form</button>
              <button className="qf-footer-save">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save Quotation
              </button>
            </div>

          </div>{/* card body */}
        </div>{/* card */}

      </div>{/* content */}
    </div>
  );
}
