import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = {
  title: 'CRM — Unique Sorter',
  description: 'CRM Platform for Unique Sorter And Equipment Pvt. Ltd.',
};

export default function DashboardLayout({ children }) {
  return (
    <div className={`dashboard-shell ${inter.variable} ${poppins.variable}`}>
      <Sidebar />
      <div className="dashboard-body dashboard-fonts">
        <TopBar />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
}
