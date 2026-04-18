'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PAGE_META = {
  '/dashboard':             { title: 'Dashboard',   subtitle: 'Welcome back, Admin' },
  '/enquiry':               { title: 'Enquiry',     subtitle: 'Manage your leads & enquiries' },
  '/dashboard/quotations':  { title: 'Quotations',  subtitle: 'Create and track quotations' },
  '/dashboard/settings':    { title: 'Settings',    subtitle: 'Manage your preferences' },
};

const NOTIFICATIONS = [
  { id: 1, icon: '📄', text: 'New quotation request from Ravi Enterprises', time: '2m ago', unread: true },
  { id: 2, icon: '💬', text: 'Lead status updated to Qualified', time: '1h ago', unread: true },
  { id: 3, icon: '✅', text: 'Quotation #Q-0042 was approved', time: '3h ago', unread: false },
];

export default function TopBar() {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const meta = PAGE_META[pathname] || { title: 'Dashboard', subtitle: '' };
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="navbar">
      {/* Left — page title */}
      <div className="navbar-left">
        <h1 className="navbar-title">{meta.title}</h1>
        {meta.subtitle && <span className="navbar-subtitle">{meta.subtitle}</span>}
      </div>

      {/* Right — actions */}
      <div className="navbar-right">

        {/* Date chip */}
        <div className="navbar-date">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>

        <div className="navbar-divider" />

        {/* Notifications */}
        <div className="navbar-dropdown-wrap" ref={notifRef}>
          <button
            className={`navbar-icon-btn ${notifOpen ? 'navbar-icon-btn--active' : ''}`}
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            title="Notifications"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="navbar-badge">{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="navbar-dropdown notif-dropdown">
              <div className="notif-header">
                <span className="notif-header-title">Notifications</span>
                <span className="notif-header-count">{unreadCount} new</span>
              </div>
              <div className="notif-list">
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className={`notif-item ${n.unread ? 'notif-item--unread' : ''}`}>
                    <span className="notif-item-icon">{n.icon}</span>
                    <div className="notif-item-body">
                      <p className="notif-item-text">{n.text}</p>
                      <span className="notif-item-time">{n.time}</span>
                    </div>
                    {n.unread && <span className="notif-item-dot" />}
                  </div>
                ))}
              </div>
              <div className="notif-footer">
                <button className="notif-footer-btn">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="navbar-dropdown-wrap" ref={profileRef}>
          <button
            className={`navbar-avatar-btn ${profileOpen ? 'navbar-avatar-btn--active' : ''}`}
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            title="Profile"
          >
            <div className="navbar-avatar">AS</div>
            <div className="navbar-avatar-info">
              <span className="navbar-avatar-name">Admin Staff</span>
              <span className="navbar-avatar-role">Sales Manager</span>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {profileOpen && (
            <div className="navbar-dropdown profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">AS</div>
                <div>
                  <p className="profile-dropdown-name">Admin Staff</p>
                  <p className="profile-dropdown-email">admin@uniquesorter.com</p>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <div className="profile-dropdown-menu">
                <button className="profile-menu-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  My Profile
                </button>
                <button className="profile-menu-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Settings
                </button>
              </div>
              <div className="profile-dropdown-divider" />
              <button className="profile-menu-item profile-menu-item--danger">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
