'use client';

import { usePathname } from 'next/navigation';

const PAGE_LABELS = {
  '/dashboard':            { name: 'Dashboard',  icon: '📊' },
  '/dashboard/enquiry':    { name: 'Enquiry',    icon: '💬' },
  '/dashboard/quotations': { name: 'Quotations', icon: '📄' },
  '/dashboard/settings':   { name: 'Settings',   icon: '⚙️' },
};

export default function WorkInProgress() {
  const pathname = usePathname();
  const base = '/' + pathname.split('/').slice(1, 4).join('/');
  const meta = PAGE_LABELS[base] || { name: 'This page', icon: '🔧' };

  return (
    <div className="wip-wrapper">
      {/* Animated background grid */}
      <div className="wip-grid" aria-hidden="true" />

      <div className="wip-card">
        {/* Icon */}
        <div className="wip-icon-wrap">
          <div className="wip-icon-ring" />
          <div className="wip-icon-ring wip-icon-ring--2" />
          <span className="wip-icon">{meta.icon}</span>
        </div>

        {/* Badge */}
        <div className="wip-badge">
          <span className="wip-badge-dot" />
          In Development
        </div>

        <h2 className="wip-title">{meta.name}</h2>
        <p className="wip-desc">
          We're building something great here. This section will be live soon — check back shortly.
        </p>

        {/* Progress bar */}
        <div className="wip-progress-wrap">
          <div className="wip-progress-label">
            <span>Build progress</span>
            <span>Coming soon</span>
          </div>
          <div className="wip-progress-track">
            <div className="wip-progress-fill" />
          </div>
        </div>

        {/* Feature hints */}
        <div className="wip-features">
          {FEATURE_HINTS[base]?.map((f, i) => (
            <div key={i} className="wip-feature-item">
              <span className="wip-feature-icon">{f.icon}</span>
              <span className="wip-feature-text">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FEATURE_HINTS = {
  '/dashboard': [
    { icon: '📈', text: 'Real-time sales analytics' },
    { icon: '💼', text: 'Quotation & order tracking' },
    { icon: '👥', text: 'Team performance metrics' },
  ],
  '/dashboard/enquiry': [
    { icon: '📥', text: 'Capture & manage inbound enquiries' },
    { icon: '🔄', text: 'Track status from new to converted' },
    { icon: '📊', text: 'Enquiry analytics & reports' },
  ],
  '/dashboard/quotations': [
    { icon: '📝', text: 'Create professional PDF quotations' },
    { icon: '🔗', text: 'Link quotations to enquiries' },
    { icon: '📬', text: 'Send & track quote approvals' },
  ],
  '/dashboard/settings': [
    { icon: '👤', text: 'Manage profile & account details' },
    { icon: '🔔', text: 'Configure notification preferences' },
    { icon: '🏢', text: 'Company branding & information' },
  ],
};
