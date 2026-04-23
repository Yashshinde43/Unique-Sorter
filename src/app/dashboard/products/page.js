export const metadata = {
  title: 'Products — Unique Sorter',
  description: 'Product Catalogue',
};

export default function Page() {
  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div className="card coming-soon-card">
          <div className="coming-soon-icon">🚧</div>
          <h2 className="coming-soon-title">Products</h2>
          <p className="coming-soon-text">This section is under construction. Check back soon.</p>
        </div>
      </div>
    </div>
  );
}
