import TopBar from '@/components/TopBar';

export default function Page() {
  return (
    <div className="page-wrapper">
      <TopBar title="Reports" subtitle="Coming soon" />
      <div className="page-content">
        <div className="card coming-soon-card">
          <div className="coming-soon-icon">🚧</div>
          <h2 className="coming-soon-title">reports page</h2>
          <p className="coming-soon-text">This section is under construction. Check back soon.</p>
        </div>
      </div>
    </div>
  );
}
