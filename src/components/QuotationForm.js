'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

/* ─── Number / date helpers ───────────────────────────────────── */
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
const fmtDate = iso => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ─── Product catalogue ───────────────────────────────────────── */
const MODELS = [
  {
    label: 'USEPL-4V PINNACLE',
    shortName: 'Sorter\nMachine',
    descLine1: 'Color sorting Machine (USEPL-4V) PINNACLE',
    descLine2: 'With AI (Advance intelligent Algorithm)',
    hsn: '84371000',
    price: '',
  },
  {
    label: 'USEPL-6V PINNACLE',
    shortName: 'Sorter\nMachine',
    descLine1: 'Color sorting Machine (USEPL-6V) PINNACLE',
    descLine2: 'With AI (Advance intelligent Algorithm)',
    hsn: '84371000',
    price: '',
  },
  {
    label: 'USEPL-8V PINNACLE',
    shortName: 'Sorter\nMachine',
    descLine1: 'Color sorting Machine (USEPL-8V) PINNACLE',
    descLine2: 'With AI (Advance intelligent Algorithm)',
    hsn: '84371000',
    price: '3135593',
  },
];

const INIT = () => ({
  refNo:'USEPL/Q-D/2026/005/R0', refDate:todayISO(), quotNo:'USE/DNR- 15112501/R0', quotDate:todayISO(),
  salutation:'Mr.', contact:'', company:'', addr1:'', addr2:'',
  city:'', state:'', mobile:'', email:'',
  model:'', qty:'', shortName:'', descLine1:'', descLine2:'', hsn:'',
  basePrice:'', gstRate:'18',
  note:'',
  payTerms:'',
  delivery:'', leadDays:'', commodity:'', electricity:'', validity:'',
  freight:'', warranty:'One year.',
  cancellation:'Order once confirmed & processed cannot be cancelled.',
});

/* ─── Build the quotation HTML from form state ────────────────── */
function buildHTML(f, { base, gstAmt, total }) {
  const addrParts = [f.addr1, f.addr2].filter(Boolean);
  const cityState = [f.city, f.state ? `[${f.state}]` : ''].filter(Boolean).join(', ');
  const leadText = f.leadDays
    ? `<span class="gn">${esc(f.leadDays)}</span> Days from receipt of confirmed purchase order with 50% advance.`
    : 'As per mutual agreement.';
  const elec = f.electricity || '220 V Frequency- 50Hz.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Quotation — Unique Sorter &amp; Equipments Pvt. Ltd.</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #a0a8b8;
    font-family: Arial, Helvetica, sans-serif;
    padding: 32px 16px 60px;
    display: flex;
    justify-content: center;
  }

  /* ── A4 Paper ── */
  .page {
    width: 794px;
    min-height: 1123px;
    background: #fff;
    padding: 24px 36px 36px;
    box-shadow: 0 8px 48px rgba(0,0,0,.35);
    font-size: 10.5pt;
    color: #000;
    line-height: 1.45;
  }

  /* ══ LETTERHEAD ══ */
  .lh {
    display: flex;
    align-items: stretch;
    gap: 0;
    margin-bottom: 5px;
  }

  .logo-cell {
    width: 130px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 8px;
    background: #fff;
  }
  .logo-cell img {
    width: 114px;   /* 130 - 16px padding */
    height: 142px;  /* maintaining 112x140 aspect ratio, slightly adjusted */
    object-fit: contain;
    display: block;
  }

  .co-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .co-name {
    background: #52ba4f;
    padding: 4px 8px 4px;
    text-align: center;
    flex-shrink: 0;
  }
  .co-name span {
    color: #fff;
    font-weight: 900;
    font-size: 15.5pt;
    letter-spacing: .35px;
    font-family: Arial, Helvetica, sans-serif;
    white-space: nowrap;
  }
  .co-addr {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 9.5pt;
    line-height: 1.72;
    padding: 18px 10px 17px;
    color: #111;
  }


  .ref-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 2px 5px;
    font-size: 10.5pt;
    margin-bottom: 10px;
  }
  .quot-title {
    font-size: 18pt;
    font-weight: 900;
    text-decoration: underline;
    letter-spacing: 3px;
    text-align: center;
  }

  .two-col {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 10px;
    padding-top: 2px;
  }
  .client-blk { flex: 1; line-height: 1.7; }
  .client-blk .attn { font-weight: 700; margin-bottom: 4px; font-size: 10.5pt; }
  .client-blk .company { font-weight: 700; text-decoration: underline; font-size: 10.5pt; }
  .quot-meta { text-align: left; line-height: 2; font-size: 10.5pt; flex-shrink: 0; }

  .yl { padding: 0 1px; }
  .gn { padding: 0 1px; }

  .qt {
    width: 100%;
    border-collapse: collapse;
    font-size: 10.5pt;
    border: 1px solid #999;
    margin-bottom: 4px;
  }
  .qt thead tr { border-top: 2px solid #222; border-bottom: 2px solid #222; }
  .qt th {
    padding: 7px 8px;
    font-weight: 700;
    font-size: 11pt;
    background: #fff;
  }
  .qt td { padding: 7px 8px; vertical-align: top; }
  .th-qty  { text-align: center; border-right: 1px solid #bbb; width: 10%; }
  .th-desc { text-align: center; border-right: 1px solid #bbb; width: 66%; }
  .th-price{ text-align: right;  width: 24%; }
  .td-qty  { text-align: center; border-right: 1px solid #ccc; width: 10%; padding-top: 9px; }
  .td-model{ border-right: 1px solid #ccc; width: 13%; font-weight: 600; font-size: 10pt; padding-top: 9px; white-space: pre-line; }
  .td-desc { border-right: 1px solid #ccc; width: 53%; }
  .td-price{ text-align: right; width: 24%; font-weight: 600; font-size: 11pt; letter-spacing: .2px; }
  .td-gst-lbl { text-align: right; padding: 5px 8px; border-right: 1px solid #ccc; }
  .td-gst-val { text-align: right; padding: 5px 8px; }
  .td-total {
    text-align: right; padding: 5px 8px 8px;
    font-weight: 900; font-size: 12.5pt;
    border-top: 1.5px solid #000; letter-spacing: .2px;
  }
  .item-row td { border-bottom: 1px solid #e0e0e0; }

  .amt-words {
    font-style: italic; font-weight: 700; font-size: 10.5pt;
    padding: 6px 0 8px; border-bottom: 1px solid #ccc;
    margin-bottom: 9px;
  }

  .doc-note { font-size: 10.5pt; margin-bottom: 10px; line-height: 1.6; }

  .terms { font-size: 10.5pt; margin-bottom: 12px; }
  .term {
    display: flex; align-items: flex-start;
    gap: 0; margin-bottom: 3px; line-height: 1.6;
  }
  .term-lbl { width: 148px; flex-shrink: 0; }
  .term-val  { flex: 1; }

  .stamp-row { margin-bottom: 4px; }


  .for-row {
    display: flex; justify-content: space-between;
    font-size: 10.5pt; font-weight: 500; margin-bottom: 10px;
  }

  .usd-note { font-size: 10pt; margin-bottom: 10px; line-height: 1.6; }

  .doc-footer {
    text-align: center; font-size: 10.5pt; color: #555;
    padding-top: 8px; border-top: 1px solid #ddd;
  }

  @media print {
    body { background: white; padding: 0; }
    .page { box-shadow: none; width: 100%; min-height: auto; }
    @page { size: A4; margin: 6mm 8mm; }
  }
</style>
</head>
<body>

<div class="page">

  <!-- LETTERHEAD -->
  <div class="lh">
    <div class="logo-cell">
      <img src="/image.png" alt="Unique Sorter &amp; Equipments Pvt. Ltd."/>
    </div>
    <div class="co-info">
      <div class="co-name">
        <span>UNIQUE SORTER &amp; EQUIPMENTS PVT. LTD.</span>
      </div>
      <div class="co-addr">
        <div>H. No.: C-77, Sector-1, Hemu Kalyani Ward-35, Devendra Nagar, Raipur (Chhattisgarh) 492009</div>
        <div>Ph.: 0771 - 4001442, 3566497</div>
        <div>CIN No.: U51909CT2021PTC011465 &nbsp;|&nbsp; GST No. 22AACCU8116G1ZL</div>
        <div>Web: <a href="https://www.uniquesorter.in" target="_blank" style="color:#1A37AA;text-decoration:none;">www.uniquesorter.in</a> &nbsp;|&nbsp; Email: <a href="mailto:raipur@uniquesorter.in" style="color:#1A37AA;text-decoration:none;">raipur@uniquesorter.in</a></div>
      </div>
    </div>
  </div>

  <div style="height:0;border-top:2px solid #444;margin:6px 0 0;"></div>

  <!-- REF / QUOTATION / DATE -->
  <div class="ref-row">
    <div>Ref No. <strong>${esc(f.refNo) || '—'}</strong></div>
    <div class="quot-title">QUOTATION</div>
    <div>Date: <strong>${fmtDate(f.refDate) || '—'}</strong></div>
  </div>

  <!-- CLIENT + QUOT META -->
  <div class="two-col">

    <div class="client-blk">
      <div class="attn">Kind Attention: ${esc(f.salutation)} <span class="yl">${esc(f.contact) || '—'}</span></div>
      <div class="company"><span class="yl">M/s ${esc(f.company) || '—'}</span></div>
      ${addrParts.map(a => `<div><span class="yl">${esc(a)}</span></div>`).join('')}
      ${cityState ? `<div><span class="yl">${esc(cityState)}</span></div>` : ''}
      ${f.mobile ? `<div><span class="yl">MOB: ${esc(f.mobile)}</span></div>` : ''}
      <div>E-mail: <span class="yl">${f.email ? esc(f.email) : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}</span></div>
    </div>

    <div class="quot-meta">
      <div>QUOTATION# <strong>${esc(f.quotNo) || '—'}</strong></div>
      <div>DATE- <strong>${fmtDate(f.quotDate) || '—'}</strong></div>
    </div>

  </div>

  <!-- ITEMS TABLE -->
  <table class="qt">
    <colgroup>
      <col style="width:10%"/>
      <col style="width:13%"/>
      <col style="width:53%"/>
      <col style="width:24%"/>
    </colgroup>
    <thead>
      <tr>
        <th class="th-qty">Qty</th>
        <th class="th-desc" colspan="2">Model Description</th>
        <th class="th-price">Unit Price INR</th>
      </tr>
    </thead>
    <tbody>

      <tr class="item-row">
        <td class="td-qty"><span class="yl">${esc(f.qty) || '—'}</span></td>
        <td class="td-model"><span class="gn">${esc(f.shortName) || '—'}</span></td>
        <td class="td-desc">
          ${f.descLine1 ? `<div><span class="gn">${esc(f.descLine1)}</span></div>` : ''}
          ${f.descLine2 ? `<div><span class="gn">${esc(f.descLine2)}</span></div>` : ''}
          ${f.hsn ? `<div style="margin-top:3px">[HSN CODE-<span class="gn">${esc(f.hsn)}</span>]</div>` : ''}
        </td>
        <td class="td-price"><span class="gn">${base ? fmtINR(base) : '—'}</span></td>
      </tr>

      <tr>
        <td style="border-right:1px solid #ccc; padding:5px 8px"></td>
        <td style="border-right:1px solid #ccc; padding:5px 8px"></td>
        <td class="td-gst-lbl">GST @ ${esc(f.gstRate)}%</td>
        <td class="td-gst-val">${base ? fmtINR(gstAmt) : '—'}</td>
      </tr>

      <tr>
        <td style="border-right:1px solid #ccc; padding:2px 8px"></td>
        <td style="border-right:1px solid #ccc; padding:2px 8px"></td>
        <td style="border-right:1px solid #ccc; padding:2px 8px"></td>
        <td class="td-total">${base ? fmtINR(total) : '—'}</td>
      </tr>

    </tbody>
  </table>

  <!-- AMOUNT IN WORDS -->
  <div class="amt-words">
    [Amount in words- <span class="yl">${base ? toWords(total) : '—'}</span>]
  </div>

  <!-- NOTE -->
  ${f.note ? `<div class="doc-note"><strong>Note –</strong> ${esc(f.note)}</div>` : ''}

  <!-- TERMS -->
  <div class="terms">

    <div class="term">
      <span class="term-lbl">Payment terms:</span>
      <span class="term-val"><span class="yl">${esc(f.payTerms)}</span></span>
    </div>

    <div class="term">
      <span class="term-lbl">Point of delivery:</span>
      <span class="term-val"><span class="yl">${esc(f.delivery) || '—'}</span></span>
    </div>

    <div class="term">
      <span class="term-lbl">Date of dispatch:</span>
      <span class="term-val">${leadText}</span>
    </div>

    <div class="term">
      <span class="term-lbl">Commodity:</span>
      <span class="term-val"><span class="yl">${esc(f.commodity) || '—'}</span></span>
    </div>

    <div class="term">
      <span class="term-lbl">Electricity Supply:</span>
      <span class="term-val">${esc(elec)}</span>
    </div>

    <div class="term">
      <span class="term-lbl">Validity:</span>
      <span class="term-val"><span class="yl">${esc(f.validity)}</span> Days.</span>
    </div>

    <div class="term">
      <span class="term-lbl">Taxes &amp; Duties:</span>
      <span class="term-val">GST@ ${esc(f.gstRate)}% as mentioned above</span>
    </div>

    <div class="term">
      <span class="term-lbl">Freight:</span>
      <span class="term-val"><span class="gn">${esc(f.freight) || '—'}</span></span>
    </div>

    <div class="term">
      <span class="term-lbl">Warranty:</span>
      <span class="term-val">${esc(f.warranty)}</span>
    </div>

    <div class="term">
      <span class="term-lbl">Cancellation:</span>
      <span class="term-val">${esc(f.cancellation)}</span>
    </div>

    <div class="term">
      <span class="term-lbl">Payment in favor of:</span>
      <span class="term-val">UNIQUE SORTER &amp; EQUIPMENTS PVT LTD</span>
    </div>

    <div class="term">
      <span class="term-lbl">Bank Details:</span>
      <span class="term-val">A/c No- 004784600001921, IFSC Code-YESB0000047 Bank-YES BANK, Branch-CIVIL LINES, RAIPUR [C.G.]</span>
    </div>

  </div>

  <!-- STAMP -->
  <div class="stamp-row">
    <img src="/stamp.png" alt="Company Stamp" style="width: 300px; height: auto; object-fit: contain;"/>
  </div>

  <hr class="rule-half"/>

  <div class="for-row">
    <span>For, Unique Sorter &amp; Equipments Pvt. Ltd:</span>
    <span>Accepted by Customer:</span>
  </div>

  <div class="usd-note">
    &nbsp;NOTE :-Variation in USD rate will be considered from the date of Quotation to order finalization.
  </div>

  <div class="doc-footer">This is Computer Generated Quotation</div>

</div>

</body>
</html>`;
}

/* ─── Styles ──────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Barlow+Condensed:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .qf-root {
    min-height: 100vh;
    background: #eef0f5;
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
    font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 700;
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
  .qf-bar-btn-save {
    height: 30px; padding: 0 16px; border-radius: 6px;
    border: none; background: #52ba4f; color: #fff;
    font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    box-shadow: 0 2px 10px rgba(82,186,79,.4); transition: all .15s;
  }
  .qf-bar-btn-save:hover { background: #47a844; transform: translateY(-1px); }
  .qf-toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    background: #1a2a1a; color: #7edd7b; border: 1px solid #3a6b38;
    border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600;
    display: flex; align-items: center; gap: 8px; z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,.35);
    animation: qf-toast-in .2s ease both;
  }
  @keyframes qf-toast-in { from{opacity:0;transform:translate(-50%,12px)} to{opacity:1;transform:translate(-50%,0)} }

  /* ── Page content ── */
  .qf-content { max-width: 1080px; margin: 0 auto; padding: 36px 32px 80px; }

  .qf-page-head {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid rgba(13,24,40,.08);
    display: flex; align-items: flex-end; justify-content: space-between;
  }
  .qf-page-head h1 {
    font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 700;
    color: #0d1828; letter-spacing: -.3px; line-height: 1.25;
  }
  .qf-page-head p { font-family: 'Inter', sans-serif; font-size: 13px; color: #6b7a90; margin-top: 4px; font-weight: 400; }
  .qf-page-head-meta {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
    color: #9aa5b8; text-transform: uppercase;
  }

  /* ── Section blocks (replacing card) ── */
  .qf-section {
    margin-bottom: 0;
    animation: qf-rise .35s cubic-bezier(.22,.68,0,1.05) both;
  }
  @keyframes qf-rise {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .qf-divider {
    display: flex; align-items: center; gap: 14px;
    margin: 36px 0 20px;
  }
  .qf-divider:first-child { margin-top: 0; }
  .qf-divider-num {
    width: 24px; height: 24px; border-radius: 50%;
    background: #1A37AA; color: #fff;
    font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; letter-spacing: 0;
  }
  .qf-divider-label {
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
    color: #0d1828; letter-spacing: .1px;
    white-space: nowrap;
  }
  .qf-divider-line { flex: 1; height: 1px; background: rgba(13,24,40,.1); }

  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .g4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
  .full { grid-column: 1 / -1; }
  .mt { margin-top: 16px; }

  .qf-f { display: flex; flex-direction: column; gap: 5px; }
  .qf-lbl {
    font-size: 11px; font-weight: 600; color: #4a5568;
    letter-spacing: .3px;
    display: flex; align-items: center; gap: 4px;
  }
  .req { color: #e05555; }

  .qf-in, .qf-sel, .qf-ta {
    width: 100%; border: 1.5px solid #d8dfe8; border-radius: 8px;
    padding: 10px 13px; font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    color: #0d1828; background: #fff; line-height: 1.5;
    transition: border-color .18s, box-shadow .18s, background .18s;
  }
  .qf-in::placeholder, .qf-ta::placeholder { color: #b0bbc9; }
  .qf-in:hover, .qf-sel:hover, .qf-ta:hover { border-color: #b0bbc9; }
  .qf-in:focus, .qf-sel:focus, .qf-ta:focus {
    border-color: #1A37AA;
    box-shadow: 0 0 0 3px rgba(26,55,170,.09);
    outline: none;
    background: #fafbff;
  }
  .qf-ta { resize: vertical; min-height: 76px; }
  .qf-sel {
    cursor: pointer; appearance: none; padding-right: 34px;
    background-image: url("data:image/svg+xml,%3Csvg width='11' height='7' viewBox='0 0 11 7' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5.5 5.5L10 1' stroke='%236b7a90' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center;
  }
  .qf-in.readonly {
    background: #f2f4f8; color: #7a8899; cursor: default;
    border-color: #e0e5ed; border-style: dashed;
  }
  .qf-in.readonly:hover, .qf-in.readonly:focus {
    border-color: #e0e5ed; box-shadow: none; background: #f2f4f8;
  }

  .qf-combo { display: flex; gap: 8px; }
  .qf-combo .qf-sel { width: 80px; flex-shrink: 0; }
  .qf-combo .qf-in  { flex: 1; }

  .qf-pricing-panel {
    background: #0d1828;
    border-radius: 12px;
    padding: 22px 28px;
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
  .qf-pricing-left { display: flex; flex-direction: column; gap: 10px; padding-right: 28px; border-right: 1px solid rgba(255,255,255,.08); }
  .qf-pricing-right { display: flex; flex-direction: column; justify-content: center; padding-left: 28px; }
  .qf-pricing-row { display: flex; justify-content: space-between; align-items: center; }
  .qf-pricing-lbl { font-size: 12px; color: rgba(255,255,255,.45); }
  .qf-pricing-val { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 600; color: rgba(255,255,255,.75); letter-spacing: .3px; }
  .qf-pricing-sep { height: 1px; background: rgba(255,255,255,.07); margin: 4px 0; }
  .qf-total-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .qf-total-amount { font-family: 'Barlow Condensed', sans-serif; font-size: 34px; font-weight: 800; color: #fff; letter-spacing: .5px; line-height: 1; }
  .qf-total-words { font-size: 11px; color: rgba(255,255,255,.35); font-style: italic; margin-top: 7px; line-height: 1.5; }

  /* ── Separator between form sections ── */
  .qf-section-sep {
    height: 1px; background: rgba(13,24,40,.07);
    margin: 36px 0 0;
  }

  .qf-footer {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid rgba(13,24,40,.08);
    display: flex; justify-content: flex-end; gap: 10px; align-items: center;
  }
  .qf-footer-reset {
    height: 42px; padding: 0 20px; border-radius: 8px;
    border: 1.5px solid #d0d8e4; background: transparent;
    color: #6b7a90; font-size: 13px; font-family: 'DM Sans', sans-serif;
    font-weight: 500; cursor: pointer; transition: all .15s;
  }
  .qf-footer-reset:hover { border-color: #b0bbc9; color: #0d1828; background: rgba(13,24,40,.03); }
  .qf-footer-preview {
    height: 42px; padding: 0 22px; border-radius: 8px;
    border: 1.5px solid #1A37AA; background: transparent;
    color: #1A37AA; font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all .18s;
  }
  .qf-footer-preview:hover { background: rgba(26,55,170,.06); }
  .qf-footer-save {
    height: 42px; padding: 0 28px; border-radius: 8px;
    border: none; background: #1A37AA; color: #fff;
    font-size: 13.5px; font-family: 'DM Sans', sans-serif; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px;
    box-shadow: 0 2px 12px rgba(26,55,170,.45); transition: all .18s;
    letter-spacing: .1px;
  }
  .qf-footer-save:hover { background: #1e42cc; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(26,55,170,.5); }

  /* ── Preview modal ── */
  .qf-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(10,16,32,.72);
    backdrop-filter: blur(4px);
    display: flex; flex-direction: column;
    animation: qf-fade-in .18s ease both;
  }
  @keyframes qf-fade-in {
    from { opacity: 0; } to { opacity: 1; }
  }
  .qf-modal-bar {
    flex-shrink: 0;
    height: 54px;
    background: #0d1828;
    border-bottom: 1px solid rgba(255,255,255,.08);
    display: flex; align-items: center; gap: 12px; padding: 0 20px;
  }
  .qf-modal-title {
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
    color: #fff; letter-spacing: .2px; flex: 1;
  }
  .qf-modal-close {
    height: 30px; padding: 0 14px; border-radius: 6px;
    border: 1px solid rgba(255,255,255,.12); background: transparent;
    color: rgba(255,255,255,.5); font-size: 12px; font-family: 'DM Sans', sans-serif;
    font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px;
    transition: all .15s;
  }
  .qf-modal-close:hover { border-color: rgba(255,255,255,.3); color: #fff; }
  .qf-modal-download {
    height: 30px; padding: 0 16px; border-radius: 6px;
    border: none; background: #52ba4f; color: #fff;
    font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 6px;
    box-shadow: 0 2px 10px rgba(82,186,79,.4); transition: all .15s;
  }
  .qf-modal-download:hover { background: #47a844; transform: translateY(-1px); }
  .qf-modal-iframe-wrap {
    flex: 1; overflow: auto;
    background: #a0a8b8;
    display: flex; justify-content: center;
    padding: 24px 16px 40px;
  }
  .qf-modal-iframe-wrap iframe {
    border: none;
    width: 860px;
    height: 1200px;
    flex-shrink: 0;
    background: #fff;
    box-shadow: 0 8px 48px rgba(0,0,0,.35);
  }
`;

/* ─── Tiny helpers ────────────────────────────────────────────── */
function Div({ label, n }) {
  return (
    <div className="qf-divider">
      <span className="qf-divider-num">{n}</span>
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
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved]             = useState(false);
  const iframeRef = useRef(null);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    const base    = parseFloat(f.basePrice) || 0;
    const gstRate = parseFloat(f.gstRate)   || 0;
    const gstAmt  = base * gstRate / 100;
    const total   = base + gstAmt;
    const record  = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      ...f,
      gstAmt,
      total,
    };
    const existing = JSON.parse(localStorage.getItem('usepl_quotations') || '[]');
    localStorage.setItem('usepl_quotations', JSON.stringify([record, ...existing]));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleModelSelect = e => {
    const label = e.target.value;
    const m = MODELS.find(x => x.label === label);
    if (m) {
      setF(p => ({ ...p, model: label, shortName: m.shortName, descLine1: m.descLine1, descLine2: m.descLine2, hsn: m.hsn, basePrice: m.price }));
    } else {
      setF(p => ({ ...p, model: '', shortName: '', descLine1: '', descLine2: '', hsn: '', basePrice: '' }));
    }
  };

  const base    = parseFloat(f.basePrice) || 0;
  const gstRate = parseFloat(f.gstRate) || 0;
  const gstAmt  = base * gstRate / 100;
  const total   = base + gstAmt;

  const calc = { base, gstAmt, total };

  const openPreview = () => setShowPreview(true);

  const handleDownload = async () => {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    // Parse the full quotation HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(buildHTML(f, calc), 'text/html');

    // Extract CSS, drop body/html rules that would break the main page layout
    const rawStyle = doc.querySelector('style')?.textContent || '';
    const cleanStyle = rawStyle
      .replace(/\bbody\s*\{[^}]*\}/gs, '')
      .replace(/\bhtml\s*\{[^}]*\}/gs, '');

    const page = doc.querySelector('.page');
    if (!page) return;

    // Convert stamp.png to base64 so html2canvas can render it off-screen
    const stampB64 = await fetch('/stamp.png')
      .then(r => r.blob())
      .then(blob => new Promise(res => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(blob);
      }));
    const stampImg = page.querySelector('img[alt="Company Stamp"]');
    if (stampImg) stampImg.src = stampB64;

    // Inject CSS into main document so html2canvas sees computed styles
    const styleEl = document.createElement('style');
    styleEl.textContent = cleanStyle;
    document.head.appendChild(styleEl);

    // Place .page off-screen in the main document (not inside an iframe)
    const shell = document.createElement('div');
    shell.style.cssText = 'position:fixed;top:0;left:-9999px;width:794px;overflow:visible;z-index:-1;';
    shell.appendChild(page);
    document.body.appendChild(shell);

    // Wait for fonts, images & a paint cycle
    await document.fonts.ready;
    await Promise.all(
      Array.from(shell.querySelectorAll('img')).map(img =>
        img.complete ? Promise.resolve() : new Promise(res => { img.onload = res; img.onerror = res; })
      )
    );
    await new Promise(r => setTimeout(r, 200));

    // Collect link positions relative to .page before canvas capture
    const pageRect = page.getBoundingClientRect();
    const linkData = Array.from(page.querySelectorAll('a[href]')).map(a => {
      const r = a.getBoundingClientRect();
      return {
        x: r.left - pageRect.left,
        y: r.top  - pageRect.top,
        w: r.width,
        h: r.height,
        url: a.href,
      };
    });

    const filename = `Quotation${f.quotNo ? `_${f.quotNo.replace(/\//g, '-')}` : ''}.pdf`;

    try {
      // Capture the entire .page as one canvas — no page splitting
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // A4: 210mm × 297mm — .page is already exactly this ratio (794:1123 ≈ 1:√2)
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pdfW = pdf.internal.pageSize.getWidth();   // 210
      const pdfH = pdf.internal.pageSize.getHeight();  // 297

      // Fit the captured image to full A4, proportionally
      const imgH = pdfW * (canvas.height / canvas.width);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, Math.min(imgH, pdfH));

      // Stamp invisible clickable link annotations at exact scaled coordinates
      const scaleX = pdfW / page.offsetWidth;
      const scaleY = Math.min(imgH, pdfH) / page.offsetHeight;
      linkData.forEach(({ x, y, w, h, url }) => {
        pdf.link(x * scaleX, y * scaleY, w * scaleX, h * scaleY, { url });
      });

      pdf.save(filename);
    } finally {
      document.body.removeChild(shell);
      document.head.removeChild(styleEl);
    }
  };

  return (
    <div className="qf-root">
      <style>{CSS}</style>

      {/* ── SAVE TOAST ── */}
      {saved && (
        <div className="qf-toast">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Quotation saved successfully
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {showPreview && (
        <div className="qf-overlay">
          <div className="qf-modal-bar">
            <span className="qf-modal-title">
              Quotation Preview
              {f.quotNo && ` — ${f.quotNo}`}
            </span>
            <button className="qf-modal-download" onClick={handleDownload}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </button>
            <button className="qf-modal-close" onClick={() => setShowPreview(false)}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Close
            </button>
          </div>
          <div className="qf-modal-iframe-wrap">
            <iframe
              ref={iframeRef}
              srcDoc={buildHTML(f, calc)}
              title="Quotation Preview"
            />
          </div>
        </div>
      )}

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
        <button className="qf-bar-btn" onClick={openPreview}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview
        </button>
        <button className="qf-bar-btn-save" onClick={handleSave}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save
        </button>
        <button className="qf-bar-btn-primary" onClick={openPreview}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download PDF
        </button>
      </div>

      <div className="qf-content">

        <div className="qf-page-head">
          <div>
            <h1>Create Quotation</h1>
            <p>Fill in the details below to generate a client quotation.</p>
          </div>
          <span className="qf-page-head-meta">Unique Sorter &amp; Equipments</span>
        </div>

        <div className="qf-section">

          {/* ── QUOTATION REFERENCE ── */}
          <Div label="Quotation Reference" n={1}/>
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
          <Div label="Client Details" n={2}/>
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
          <Div label="Product Details" n={3}/>
          <div className="g2">
            <F label="Select Model" required>
              <select className="qf-sel" value={f.model} onChange={handleModelSelect}>
                <option value="">— Choose a model —</option>
                {MODELS.map(m => (
                  <option key={m.label} value={m.label}>{m.label}</option>
                ))}
              </select>
            </F>
            <F label="Quantity" required>
              <input className="qf-in" value={f.qty} onChange={e => set('qty', e.target.value)} placeholder="01 Set."/>
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
          <div className="g3 mt">
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
          <div className="mt">
            <F label="Note / Exclusions" full>
              <textarea className="qf-ta" value={f.note} onChange={e => set('note', e.target.value)} placeholder="Items not included in supply — e.g. Compressor, Dryer, Receiver Tank, Air Filters…"/>
            </F>
          </div>

          {/* ── PRICING & GST ── */}
          <Div label="Pricing & GST" n={4}/>
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
          <Div label="Terms & Conditions" n={5}/>
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
            <button className="qf-footer-preview" onClick={openPreview}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview
            </button>
            <button className="qf-footer-save" style={{background:'#52ba4f',boxShadow:'0 2px 12px rgba(82,186,79,.4)'}} onClick={handleSave}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save Quotation
            </button>
            <button className="qf-footer-save" onClick={openPreview}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PDF
            </button>
          </div>

        </div>{/* section */}

      </div>{/* content */}
    </div>
  );
}
