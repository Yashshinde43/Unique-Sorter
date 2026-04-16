import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'CRM — Unique Sorter',
  description: 'CRM Platform for Unique Sorter And Equipment Pvt. Ltd.',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
