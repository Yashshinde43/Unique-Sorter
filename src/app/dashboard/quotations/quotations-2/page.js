import TopBar from '@/components/TopBar';
import Link from 'next/link';

export default function Quotations2Page() {
  return (
    <div className="page-wrapper">
      <TopBar title="Quotations 2" subtitle="Alternative quotation management interface" />

      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Quotations 2 - All Records</h2>
              <p className="card-subtitle">Alternative view for managing quotations</p>
            </div>
            <div className="card-actions">
              <Link href="/dashboard/quotations/quotations-2/new" className="btn-primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
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
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Product / Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Valid Until</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '56px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d0d8e8" strokeWidth="1.4" strokeLinecap="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#8898aa' }}>Quotations 2 interface ready</div>
                      <div style={{ fontSize: 12.5, color: '#aab4c4' }}>Manage your quotations in this alternative view</div>
                      <Link href="/dashboard/quotations/quotations-2/new" className="btn-primary" style={{ marginTop: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        New Quotation
                      </Link>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}