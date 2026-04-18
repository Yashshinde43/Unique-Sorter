const STATS = [
  {
    label: 'Total Quotations',
    value: '0',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    color: '#1A37AA',
  },
  {
    label: 'Active Leads',
    value: '0',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: '#52ba4f',
  },
  {
    label: 'Orders This Month',
    value: '0',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    color: '#E8A020',
  },
  {
    label: 'Revenue (₹)',
    value: '—',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    color: '#1A37AA',
  },
];

export default function DashboardPage() {
  return (
    <div className="page-wrapper">
      <div className="page-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon" style={{ '--icon-color': stat.color }}>
                  {stat.icon}
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Row */}
        <div className="dashboard-grid">
          {/* Recent Quotations */}
          <div className="card card--wide">
            <div className="card-header">
              <div>
                <h2 className="card-title">Recent Quotations</h2>
                <p className="card-subtitle">Last 5 quotations created</p>
              </div>
              <a href="/dashboard/quotations" className="card-link">View all →</a>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#aab4c4', fontSize: 13 }}>
                      No quotations yet. <a href="/dashboard/quotations/new" style={{ color: '#1A37AA', textDecoration: 'none', fontWeight: 600 }}>Create one →</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales Pipeline */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Sales Pipeline</h2>
                <p className="card-subtitle">Current funnel status</p>
              </div>
            </div>
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#aab4c4', fontSize: 13 }}>
              No pipeline data yet.
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3 className="quick-actions-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            {[
              { label: 'New Quotation', href: '/dashboard/quotations/new', icon: '📄', desc: 'Create a new client quotation' },
              { label: 'Add Enquiry', href: '/dashboard/enquiry', icon: '👤', desc: 'Register a new sales lead' },
              { label: 'Add Product', href: '/dashboard/products', icon: '📦', desc: 'Add product to catalogue' },
              { label: 'View Reports', href: '/dashboard/reports', icon: '📊', desc: 'Analyse sales performance' },
            ].map((action) => (
              <a key={action.label} href={action.href} className="quick-action-card">
                <span className="quick-action-icon">{action.icon}</span>
                <div>
                  <span className="quick-action-label">{action.label}</span>
                  <span className="quick-action-desc">{action.desc}</span>
                </div>
                <svg className="quick-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
