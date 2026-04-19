'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const fmtINR = n => n ? '₹ ' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(+n) : '—';
const fmtDate = iso => { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); };

const CSS = `
  .ql-row { cursor: pointer; transition: background .12s; }
  .ql-row:hover td { background: #f4f7fd; }
  .ql-row td:first-child { border-left: 3px solid transparent; transition: border-color .12s; }
  .ql-row:hover td:first-child { border-left-color: #1A37AA; }
  .ql-badge { display:inline-flex;align-items:center;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.3px;text-transform:uppercase; }
  .ql-badge-1page    { background:rgba(26,55,170,.1);color:#1A37AA; }
  .ql-badge-detailed { background:rgba(82,186,79,.12);color:#2e8c2b; }
  @keyframes ql-spin { to { transform: rotate(360deg); } }
`;

export default function QuotationsPage() {
  const router = useRouter();
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quotations')
      .then(r => r.json())
      .then(d => { if (d.success) setRows(d.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <style>{CSS}</style>
      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">All Quotations</h2>
              <p className="card-subtitle">
                {loading ? 'Loading…' : `${rows.length} record${rows.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quote ID</th>
                  <th>Type</th>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Model</th>
                  <th>Amount (incl. GST)</th>
                  <th>Date</th>
                  <th>Validity</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px 0' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A37AA" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ql-spin 0.8s linear infinite', display: 'inline-block' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '64px 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d0d8e8" strokeWidth="1.4" strokeLinecap="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#8898aa' }}>No quotations yet</div>
                        <div style={{ fontSize: 12.5, color: '#aab4c4' }}>Quotations generated from enquiries will appear here</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map(r => (
                    <tr
                      key={r.id}
                      className="ql-row"
                      onClick={() => router.push(`/dashboard/quotations/${r.id}`)}
                      title="Click to open quotation"
                    >
                      <td style={{ fontWeight: 600, color: '#1A37AA', fontSize: 13 }}>{r.quotNo || r.refNo || '—'}</td>
                      <td>
                        {r.quotationType === 'detailed'
                          ? <span className="ql-badge ql-badge-detailed">Detailed</span>
                          : <span className="ql-badge ql-badge-1page">1-Page</span>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.company || '—'}</div>
                        {r.city && <div style={{ fontSize: 11.5, color: '#8898aa' }}>{r.city}{r.state ? `, ${r.state}` : ''}</div>}
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{r.salutation} {r.contact || '—'}</div>
                        {r.mobile && <div style={{ fontSize: 11.5, color: '#8898aa' }}>{r.mobile}</div>}
                      </td>
                      <td style={{ fontSize: 12.5 }}>{r.model || r.descLine1 || '—'}</td>
                      <td style={{ fontWeight: 700, fontSize: 13, color: '#1a2a1a' }}>{fmtINR(r.total)}</td>
                      <td style={{ fontSize: 12.5, color: '#556' }}>{fmtDate(r.quotDate || r.savedAt || r.createdAt)}</td>
                      <td style={{ fontSize: 12.5, color: '#556' }}>{r.validity ? `${r.validity} days` : r.quotationValidity ? `${r.quotationValidity} days` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
