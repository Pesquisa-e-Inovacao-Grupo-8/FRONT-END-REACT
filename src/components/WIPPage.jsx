export default function WIPPage({ title }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      gap: '20px',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: '#fff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', margin: '0 0 10px 0' }}>🚧</h1>
        <h2 style={{ fontSize: '32px', margin: '0 0 10px 0', color: '#667eea' }}>
          {title}
        </h2>
        <p style={{ fontSize: '18px', color: '#cbd5e1', margin: 0 }}>
          Em desenvolvimento...
        </p>
      </div>
    </div>
  );
}
