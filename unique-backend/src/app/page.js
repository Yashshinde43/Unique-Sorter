export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Unique Sorter API</h1>
      <p style={{ color: '#666' }}>Backend API for Unique Sorter CRM. All endpoints are under <code>/api/v1/</code></p>
      <p><a href="/api/v1/health">Health Check</a></p>
    </div>
  );
}
