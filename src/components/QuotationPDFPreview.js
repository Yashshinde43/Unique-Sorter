'use client';

import { useEffect } from 'react';

/* ─── helpers (same as QuotationForm) ─────────────────────────── */
const fmtINR = n =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(+n || 0);

const ONES = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
  'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const TENS = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
const _2 = n => !n ? '' : n < 20 ? ONES[n] : TENS[~~(n/10)] + (n%10 ? ' '+ONES[n%10] : '');
const _3 = n => !n ? '' : n < 100 ? _2(n) : ONES[~~(n/100)]+' Hundred'+(n%100 ? ' '+_2(n%100) : '');
function toWords(a) {
  const n = Math.round(+a || 0); if (!n) return '';
  let r = n; const p = [];
  const c=~~(r/1e7); r%=1e7; const l=~~(r/1e5); r%=1e5; const t=~~(r/1e3); r%=1e3;
  if (c) p.push(_2(c)+' Crore'); if (l) p.push(_2(l)+' Lakh');
  if (t) p.push(_2(t)+' Thousand'); if (r) p.push(_3(r));
  return 'Rs. '+p.join(' ')+' Only.';
}
const fmtDate = s => {
  if (!s) return '';
  const d = new Date(s); if (isNaN(d)) return s;
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

/* ─── Print styles injected once ──────────────────────────────── */
const PRINT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&family=Roboto:wght@400;500;700&display=swap');

.qpdf-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(10,15,30,.72);
  backdrop-filter: blur(6px);
  display: flex; flex-direction: column; align-items: center;
  overflow-y: auto; padding: 28px 0 60px;
  animation: qpdf-fade .22s ease both;
}
@keyframes qpdf-fade { from { opacity:0 } to { opacity:1 } }

.qpdf-toolbar {
  position: sticky; top: 0; z-index: 10;
  width: 794px; max-width: 100%;
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; margin-bottom: 16px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  backdrop-filter: blur(12px);
}
.qpdf-tb-title {
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,.8); flex: 1; letter-spacing: .1px;
}
.qpdf-tb-close {
  width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.07);
  color: rgba(255,255,255,.55); cursor: pointer; font-size: 18px; line-height: 34px;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.qpdf-tb-close:hover { background: rgba(255,80,80,.25); border-color: rgba(255,80,80,.4); color: #fff; }
.qpdf-tb-print {
  height: 34px; padding: 0 18px; border-radius: 8px;
  border: none; background: #1A37AA; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 7px;
  box-shadow: 0 2px 12px rgba(26,55,170,.5); transition: all .15s;
}
.qpdf-tb-print:hover { background: #1e42cc; transform: translateY(-1px); box-shadow: 0 5px 18px rgba(26,55,170,.55); }

/* ══ A4 PAPER SHEET ═══════════════════════════════════════════════ */
.qpdf-paper {
  width: 794px; min-height: 1123px;
  background: #fff;
  box-shadow: 0 8px 60px rgba(0,0,0,.55);
  border-radius: 3px;
  padding: 30px 36px 36px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10.5px; color: #111;
  line-height: 1.45;
}

/* ── Company header ── */
.qpdf-header {
  display: flex; align-items: flex-start; gap: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #1A37AA;
}
.qpdf-logo { width: 88px; flex-shrink: 0; object-fit: contain; }
.qpdf-co-block { flex: 1; }
.qpdf-co-name {
  font-size: 19px; font-weight: 900; color: #1A37AA;
  letter-spacing: .5px; text-transform: uppercase;
  line-height: 1.1; margin-bottom: 5px;
}
.qpdf-co-addr { font-size: 9.5px; color: #333; line-height: 1.6; }
.qpdf-co-ids { font-size: 9px; color: #444; margin-top: 2px; }
.qpdf-co-web { font-size: 9px; color: #444; }

/* ── Ref / Title row ── */
.qpdf-ref-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 10px; margin-bottom: 4px;
}
.qpdf-ref-text { font-size: 9.5px; }
.qpdf-date-text { font-size: 9.5px; }
.qpdf-title-row { text-align: center; margin: 6px 0 10px; }
.qpdf-title {
  font-size: 16px; font-weight: 700;
  text-decoration: underline; text-underline-offset: 3px;
  letter-spacing: 1px;
}

/* ── Client + quotation# ── */
.qpdf-client-row { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 12px; }
.qpdf-client-block { flex: 1; }
.qpdf-client-attn { font-weight: 700; font-size: 10px; margin-bottom: 5px; }
.qpdf-client-detail {
  background: #FFFF9E;
  display: inline-block;
  padding: 1px 2px;
  font-weight: 700; font-size: 9.5px;
}
.qpdf-client-addr { font-size: 9.5px; }
.qpdf-client-addr .hl { background: #FFFF9E; display: inline; }
.qpdf-qno-block { text-align: right; font-size: 9.5px; line-height: 1.7; }

/* ── Product table ── */
.qpdf-table {
  width: 100%; border-collapse: collapse;
  margin-bottom: 4px; font-size: 9.5px;
}
.qpdf-table th {
  background: #1A37AA; color: #fff;
  padding: 6px 10px; font-weight: 700; font-size: 9.5px;
  border: 1px solid #1A37AA;
}
.qpdf-table th:first-child { width: 70px; }
.qpdf-table th:last-child  { width: 110px; text-align: right; }
.qpdf-table td {
  padding: 7px 10px; border: 1px solid #ccc; vertical-align: top;
}
.qpdf-table td:last-child { text-align: right; font-weight: 600; }
.qpdf-td-model { font-size: 9px; color: #666; font-weight: 400; }
.qpdf-desc-bold { font-weight: 700; }
.qpdf-desc-model { font-weight: 700; color: #1A37AA; background: #e8efff; padding: 0 2px; }
.qpdf-desc-pinnacle { font-weight: 900; }

/* ── GST / Total rows ── */
.qpdf-gst-row td { border-top: none; border-bottom: none; }
.qpdf-total-row td { border-top: 1px solid #aaa; }
.qpdf-total-row td:last-child { font-size: 11px; font-weight: 700; }

/* ── Amount in words ── */
.qpdf-awords {
  font-size: 9.5px; font-style: italic; font-weight: 700;
  text-decoration: underline; text-underline-offset: 2px;
  margin: 8px 0 10px;
}

/* ── Note ── */
.qpdf-note { font-size: 9px; margin-bottom: 12px; line-height: 1.55; }
.qpdf-note strong { font-weight: 700; }

/* ── Terms table ── */
.qpdf-terms {
  width: 100%; font-size: 9.2px; border-collapse: collapse;
  margin-bottom: 14px;
}
.qpdf-terms tr td { padding: 2.5px 4px; vertical-align: top; }
.qpdf-terms tr td:first-child { width: 130px; font-weight: 500; white-space: nowrap; }
.qpdf-terms tr td:nth-child(2) { width: 10px; text-align: center; }
.qpdf-hl { background: #FFFF9E; display: inline; }
.qpdf-hl-strong { background: #FFFF9E; font-weight: 700; display: inline; }

/* ── Signature ── */
.qpdf-sig-row {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-top: 14px; padding-top: 10px;
  border-top: 1px solid #ccc;
}
.qpdf-sig-block { font-size: 9px; }
.qpdf-sig-name { font-weight: 700; font-size: 9.5px; margin-top: 3px; }
.qpdf-sig-stamp {
  width: 90px; height: 90px;
  border: 1.5px solid #1A37AA;
  border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 7px; color: #1A37AA; font-weight: 700; text-align: center;
  line-height: 1.4; padding: 6px;
  margin-bottom: 4px;
}
.qpdf-sig-line { width: 180px; border-bottom: 1px solid #555; margin: 28px 0 6px; }

/* ── Footer ── */
.qpdf-footer {
  margin-top: 10px; padding-top: 8px;
  border-top: 1px solid #ccc;
  font-size: 8.5px; color: #555;
}
.qpdf-footer-note { margin-bottom: 4px; }
.qpdf-footer-cg { text-align: center; font-size: 8.5px; color: #777; margin-top: 6px; }

/* ══ PRINT MEDIA ════════════════════════════════════════════════ */
@media print {
  body > *:not(#qpdf-printroot) { display: none !important; }
  #qpdf-printroot { position: static !important; padding: 0 !important; background: none !important; backdrop-filter: none !important; }
  .qpdf-toolbar { display: none !important; }
  .qpdf-paper {
    width: 100%; min-height: 0; box-shadow: none; border-radius: 0;
    padding: 12mm 14mm 12mm;
  }
  @page { size: A4; margin: 0; }
}
`;

/* ════════════════════════════════════════════════════════════════ */
export default function QuotationPDFPreview({ data, onClose }) {
  /* Inject print CSS once */
  useEffect(() => {
    const id = 'qpdf-styles';
    if (!document.getElementById(id)) {
      const s = document.createElement('style'); s.id = id; s.textContent = PRINT_CSS;
      document.head.appendChild(s);
    }
    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const base    = parseFloat(data.basePrice) || 0;
  const gstRate = parseFloat(data.gstRate) || 18;
  const gstAmt  = base * gstRate / 100;
  const total   = base + gstAmt;

  const handlePrint = () => window.print();

  const handleOverlayClick = e => { if (e.target === e.currentTarget) onClose(); };

  const clientName  = [data.salutation, data.contact].filter(Boolean).join(' ');
  const addrLines   = [data.addr1, data.addr2, data.city, data.state ? `[${data.state}]` : ''].filter(Boolean);

  return (
    <div className="qpdf-overlay" id="qpdf-printroot" onClick={handleOverlayClick}>

      {/* Toolbar */}
      <div className="qpdf-toolbar" onClick={e => e.stopPropagation()}>
        <span className="qpdf-tb-title">PDF Preview — {data.quotNo || 'Quotation'}</span>
        <button className="qpdf-tb-print" onClick={handlePrint}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print / Save as PDF
        </button>
        <button className="qpdf-tb-close" onClick={onClose}>✕</button>
      </div>

      {/* A4 Paper */}
      <div className="qpdf-paper" onClick={e => e.stopPropagation()}>

        {/* ── COMPANY HEADER ── */}
        <div className="qpdf-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Unique Sorter Logo" className="qpdf-logo" />
          <div className="qpdf-co-block">
            <div className="qpdf-co-name">Unique Sorter &amp; Equipments Pvt. Ltd.</div>
            <div className="qpdf-co-addr">
              H. No.: C-77, Sector-1, Hemu Kalyani Ward-35, Devendra Nagar, Raipur (Chhattisgarh) 492009<br/>
              Ph.:0771 - 4001442, 3566497,
            </div>
            <div className="qpdf-co-ids">
              CIN No.: U51909CT2021PTC011465,&nbsp; GST No.22AACCU8116G1ZL
            </div>
            <div className="qpdf-co-web">
              Web : www.uniquesorter.in&nbsp;, Email: raipur@uniquesorter.in
            </div>
          </div>
        </div>

        {/* ── REF / DATE / TITLE ── */}
        <div className="qpdf-ref-row">
          <span className="qpdf-ref-text">Ref No. {data.refNo || 'USEPL/Q-D/2026/—/R0'}</span>
          <span className="qpdf-date-text">Date: {fmtDate(data.refDate)}</span>
        </div>
        <div className="qpdf-title-row">
          <span className="qpdf-title">QUOTATION</span>
        </div>

        {/* ── CLIENT + QUOTATION# ── */}
        <div className="qpdf-client-row">
          <div className="qpdf-client-block">
            {clientName && (
              <div className="qpdf-client-attn">Kind Attention: {clientName}</div>
            )}
            <div className="qpdf-client-addr">
              {data.company && <div><span className="qpdf-client-detail">{data.company.startsWith('M/s') ? data.company : `M/s ${data.company}`}</span></div>}
              {addrLines.map((l, i) => (
                <div key={i}><span className="hl">{l}</span></div>
              ))}
              {data.mobile && <div><span className="hl">MOB: {data.mobile}</span></div>}
              {data.email !== undefined && <div><span className="hl">E-mail: {data.email}</span></div>}
            </div>
          </div>
          <div className="qpdf-qno-block">
            {data.quotNo && <div>QUOTATION# {data.quotNo}</div>}
            {data.quotDate && <div>DATE- {fmtDate(data.quotDate)}</div>}
          </div>
        </div>

        {/* ── PRODUCT TABLE ── */}
        <table className="qpdf-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Qty</th>
              <th style={{ textAlign: 'left' }}>Model Description</th>
              <th style={{ textAlign: 'right' }}>Unit Price INR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                {data.qty || '01 Set.'}<br/>
                {data.shortName && <span className="qpdf-td-model">{data.shortName}</span>}
              </td>
              <td>
                {data.descLine1 && (
                  <div>
                    {/* Highlight model code in description */}
                    {renderDesc(data.descLine1)}
                  </div>
                )}
                {data.descLine2 && <div>{data.descLine2}</div>}
                {data.hsn && <div>[HSN CODE-{data.hsn}]</div>}
              </td>
              <td>
                {base > 0 && (
                  <span style={{ background: '#FFFF9E', padding: '0 2px' }}>{fmtINR(base)}</span>
                )}
              </td>
            </tr>
            {/* GST row */}
            <tr className="qpdf-gst-row">
              <td style={{ border: 'none' }}></td>
              <td style={{ border: '1px solid #ccc', textAlign: 'right', paddingRight: 10 }}>
                GST @ {gstRate}%
              </td>
              <td style={{ border: '1px solid #ccc' }}>{gstAmt > 0 ? fmtINR(gstAmt) : ''}</td>
            </tr>
            {/* Total row */}
            <tr className="qpdf-total-row">
              <td style={{ border: '1px solid #ccc' }}></td>
              <td style={{ border: '1px solid #ccc' }}></td>
              <td style={{ border: '1px solid #ccc', fontWeight: 700, fontSize: 11 }}>
                {total > 0 ? fmtINR(total) : ''}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── AMOUNT IN WORDS ── */}
        {total > 0 && (
          <div className="qpdf-awords">
            [Amount in words- <span style={{ background: '#FFFF9E' }}>{toWords(total)}</span>]
          </div>
        )}

        {/* ── NOTE ── */}
        {data.note && (
          <div className="qpdf-note">
            <strong>Note –</strong> {data.note}
          </div>
        )}

        {/* ── TERMS ── */}
        <table className="qpdf-terms">
          <tbody>
            {data.payTerms && (
              <tr>
                <td>Payment terms:</td><td>:</td>
                <td><span className="qpdf-hl">{data.payTerms}</span></td>
              </tr>
            )}
            {data.delivery && (
              <tr>
                <td>Point of delivery:</td><td>:</td>
                <td><span className="qpdf-hl">{data.delivery}</span></td>
              </tr>
            )}
            {data.leadDays && (
              <tr>
                <td>Date of dispatch:</td><td>:</td>
                <td>
                  <span className="qpdf-hl">{data.leadDays}</span>{' '}
                  Days from receipt of confirmed purchase order with 50% advance.
                </td>
              </tr>
            )}
            {data.commodity && (
              <tr>
                <td>Commodity:</td><td>:</td>
                <td><span className="qpdf-hl-strong">{data.commodity}</span></td>
              </tr>
            )}
            {data.electricity && (
              <tr>
                <td>Electricity Supply:</td><td>:</td>
                <td>{data.electricity}</td>
              </tr>
            )}
            {data.validity && (
              <tr>
                <td>Validity:</td><td>:</td>
                <td><span className="qpdf-hl">{data.validity}</span> Days.</td>
              </tr>
            )}
            <tr>
              <td>Taxes &amp; Duties:</td><td>:</td>
              <td>GST@ {gstRate}% as mentioned above</td>
            </tr>
            {data.freight && (
              <tr>
                <td>Freight:</td><td>:</td>
                <td><span className="qpdf-hl">{data.freight}</span></td>
              </tr>
            )}
            {data.warranty && (
              <tr>
                <td>Warranty:</td><td>:</td>
                <td>{data.warranty}</td>
              </tr>
            )}
            {data.cancellation && (
              <tr>
                <td>Cancellation:</td><td>:</td>
                <td>{data.cancellation}</td>
              </tr>
            )}
            <tr>
              <td>Payment in favor of:</td><td>:</td>
              <td>UNIQUE SORTER &amp; EQUIPMENTS PVT LTD</td>
            </tr>
            <tr>
              <td>Bank Details:</td><td>:</td>
              <td>
                A/c No- 004784600001921, IFSC Code-YESB0000047 Bank-<br/>
                YES BANK, Branch-CIVIL LINES, RAIPUR [C.G.]
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── SIGNATURE ROW ── */}
        <div className="qpdf-sig-row">
          <div className="qpdf-sig-block">
            {/* Stamp */}
            <div className="qpdf-sig-stamp">
              <div style={{ fontSize: 6.5, marginBottom: 2 }}>Unique Sorter</div>
              <div style={{ fontSize: 6.5 }}>&amp; Equipments</div>
              <div style={{ fontSize: 6 }}>Pvt. Ltd.</div>
              <div style={{ fontSize: 5.5, marginTop: 2 }}>Raipur, Chhattisgarh</div>
              <div style={{ fontSize: 5.5 }}>492009</div>
            </div>
            <div className="qpdf-sig-name">For, Unique Sorter &amp; Equipments Pvt. Ltd.</div>
          </div>
          <div className="qpdf-sig-block" style={{ textAlign: 'right' }}>
            <div className="qpdf-sig-line" style={{ marginLeft: 'auto' }}></div>
            <div>Accepted by Customer:</div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="qpdf-footer">
          <div className="qpdf-footer-note">
            NOTE :-Variation in USD rate will be considered from the date of Quotation to order finalization.
          </div>
          <div className="qpdf-footer-cg">This is Computer Generated Quotation</div>
        </div>

      </div>{/* /paper */}
    </div>
  );
}

/* Renders description line highlighting model codes in brackets */
function renderDesc(text) {
  // Bold the part inside () brackets (model code like USEPL-8V)
  const parts = text.split(/(\(USEPL[^)]*\)|\bPINNACLE\b|\bAI\b)/g);
  return parts.map((p, i) => {
    if (/^\(USEPL/.test(p)) return <span key={i} style={{ fontWeight: 700, background: '#e8efff', padding: '0 2px' }}>{p}</span>;
    if (p === 'PINNACLE') return <span key={i} style={{ fontWeight: 900 }}>{p}</span>;
    if (p === 'AI') return <span key={i} style={{ fontWeight: 700 }}>{p}</span>;
    return p;
  });
}
