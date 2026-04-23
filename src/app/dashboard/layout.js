import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export const metadata = {
  title: 'CRM — Unique Sorter',
  description: 'CRM Platform for Unique Sorter And Equipment Pvt. Ltd.',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-body">
        <TopBar />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}

