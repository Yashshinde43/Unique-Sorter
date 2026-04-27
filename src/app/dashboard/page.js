'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/rbac';

export default function DashboardPage() {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
          <div className="card" style={{ padding: '48px 64px', textAlign: 'center' }}>
            <div style={{
              width: 48,
              height: 48,
              border: '4px solid rgba(26,55,170,0.1)',
              borderTop: '4px solid #1A37AA',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isAdminUser = isAdmin(userRole);

  return (
    <div className="page-wrapper">
      <div className="page-content" style={{ padding: '24px 0' }}>
        {/* Welcome Section */}
        <div className="card" style={{ padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: isAdminUser ? 'rgba(26,55,170,0.1)' : 'rgba(82,186,79,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}>
              {isAdminUser ? '👑' : '👤'}
            </div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                fontSize: '24px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}>
                Welcome back, {user?.name || 'User'}
              </h1>
              <p style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                You're logged in as <strong>{isAdminUser ? 'Administrator' : 'User'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Role-based Content */}
        {isAdminUser ? (
          /* Admin Dashboard */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
              <h3 style={{
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                Analytics
              </h3>
              <p style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                View detailed reports and analytics about your business performance.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
              <h3 style={{
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                User Management
              </h3>
              <p style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                Manage user accounts, roles, and permissions from the settings page.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <h3 style={{
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                Enquiries & Quotations
              </h3>
              <p style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                Create, edit, and manage customer enquiries and quotations.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙️</div>
              <h3 style={{
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                Settings
              </h3>
              <p style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                Configure system settings and manage platform preferences.
              </p>
            </div>
          </div>
        ) : (
          /* User Dashboard - Limited Access */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ padding: '24px', opacity: 0.7 }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔒</div>
              <h3 style={{
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                View Only Access
              </h3>
              <p style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                You have view-only access to the dashboard. Contact an administrator for additional permissions.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📢</div>
              <h3 style={{
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                Announcements
              </h3>
              <p style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}>
                Stay updated with the latest announcements and notifications from the team.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
