'use client';

import { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import Link from 'next/link';

const fmtINR = n => n ? '₹ ' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(+n) : '—';
const fmtDate = iso => { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); };

export default function QuotationsPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('usepl_quotations') || '[]');
    setRows(data);
  }, []);

  const handleDelete = (id) => {
    const updated = rows.filter(r => r.id !== id);
    setRows(updated);
    localStorage.setItem('usepl_quotations', JSON.stringify(updated));
  };

  return (
    <div className="page-wrapper">
      <TopBar title="Quotations" subtitle="Manage and generate client quotations" />

      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">All Quotations</h2>
              <p className="card-subtitle">{rows.length} record{rows.length !== 1 ? 's' : ''} saved locally</p>
            </div>
            <div className="card-actions">
              <Link href="/dashboard/quotations/new" className="btn-primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New
              </Link>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Quote ID</th>
                  <th>Ref No.</th>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Model</th>
                  <th>Amount (incl. GST)</th>
                  <th>Date</th>
                  <th>Validity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '56px 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d0d8e8" strokeWidth="1.4" strokeLinecap="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#8898aa' }}>No quotations yet</div>
                        <div style={{ fontSize: 12.5, color: '#aab4c4' }}>Create your first quotation to get started</div>
                        <Link href="/dashboard/quotations/new" className="btn-primary" style={{ marginTop: 4 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          New Quotation
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600, color: '#1A37AA', fontSize: 13 }}>{r.quotNo || '—'}</td>
                      <td style={{ fontSize: 12, color: '#556' }}>{r.refNo || '—'}</td>
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
                      <td style={{ fontSize: 12.5, color: '#556' }}>{fmtDate(r.quotDate || r.savedAt)}</td>
                      <td style={{ fontSize: 12.5, color: '#556' }}>{r.validity ? `${r.validity} days` : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Link href="/dashboard/quotations/new" style={{ fontSize: 12, color: '#1A37AA', textDecoration: 'none', fontWeight: 500 }}>Edit</Link>
                          <button
                            onClick={() => handleDelete(r.id)}
                            style={{ fontSize: 12, color: '#e05555', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}
                          >Delete</button>
                        </div>
                      </td>
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
