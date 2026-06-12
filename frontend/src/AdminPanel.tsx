import { useState, useEffect } from 'react';

function Svg({ d, size = 20, color = 'currentColor', fill = false }: { d: string; size?: number; color?: string; fill?: boolean }) {
  return (
    <svg width={size} height={size} fill={fill ? color : 'none'} stroke={fill ? 'none' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  );
}

export function AdminPanel({ API_URL }: { API_URL: string }) {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [threats, setThreats] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      const tok = localStorage.getItem('token');
      if (!tok) { setError('Not logged in'); return; }

      try {
        const [statsRes, usersRes, threatsRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${tok}` } }),
          fetch(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${tok}` } }),
          fetch(`${API_URL}/api/admin/threats`, { headers: { Authorization: `Bearer ${tok}` } })
        ]);

        if (statsRes.status === 403) throw new Error('You do not have admin privileges');
        if (!statsRes.ok) throw new Error('Failed to fetch admin data');

        setStats(await statsRes.json());
        setUsers(await usersRes.json());
        setThreats(await threatsRes.json());
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchAdminData();
  }, [API_URL]);

  if (error) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(239,68,68,.1)', padding: '20px 40px', borderRadius: 16, border: '1px solid rgba(239,68,68,.3)', color: '#f87171' }}>
          <Svg d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={40} />
          <h2 style={{ marginTop: 16, color: 'white' }}>Access Denied</h2>
          <p>{error}</p>
          <button onClick={() => window.location.href = '/'} style={{ marginTop: 20, padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Return Home</button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div style={{ padding: 100, textAlign: 'center', color: '#64748b' }}>Loading Admin Panel...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, margin: 0 }}>Admin Portal</h1>
          <p style={{ color: '#94a3b8', fontSize: 15, margin: '8px 0 0 0' }}>System overview and moderation</p>
        </div>
        <button onClick={() => window.location.href = '/'} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer' }}>
          Exit Admin
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        <div style={{ background: 'rgba(8,14,26,.6)', border: '1px solid rgba(96,165,250,.2)', borderRadius: 16, padding: 24 }}>
          <div style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Total Users</div>
          <div style={{ color: '#60a5fa', fontSize: 36, fontWeight: 900 }}>{stats.total_users}</div>
        </div>
        <div style={{ background: 'rgba(8,14,26,.6)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 16, padding: 24 }}>
          <div style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Total URLs</div>
          <div style={{ color: '#34d399', fontSize: 36, fontWeight: 900 }}>{stats.total_urls}</div>
        </div>
        <div style={{ background: 'rgba(8,14,26,.6)', border: '1px solid rgba(192,132,252,.2)', borderRadius: 16, padding: 24 }}>
          <div style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Total Clicks</div>
          <div style={{ color: '#c084fc', fontSize: 36, fontWeight: 900 }}>{stats.total_clicks}</div>
        </div>
        <div style={{ background: 'rgba(8,14,26,.6)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 16, padding: 24 }}>
          <div style={{ color: '#94a3b8', fontSize: 13, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Blocked Threats</div>
          <div style={{ color: '#f87171', fontSize: 36, fontWeight: 900 }}>{stats.blocked_threats}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'rgba(8,14,26,.6)', border: '1px solid #1a2e46', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a2e46', fontWeight: 700, color: 'white' }}>Recent Users</div>
          <div style={{ padding: 20 }}>
            {users.map(u => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 500 }}>{u.name}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{u.email}</div>
                </div>
                <div style={{ color: u.role === 'admin' ? '#fbbf24' : '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                  {u.role}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(8,14,26,.6)', border: '1px solid #1a2e46', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a2e46', fontWeight: 700, color: 'white' }}>Blocked Threats Log</div>
          <div style={{ padding: 20 }}>
            {threats.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: 13 }}>No threats blocked yet.</div>
            ) : threats.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300, color: '#f87171', fontSize: 13 }}>
                  {t.url}
                </div>
                <div style={{ color: '#64748b', fontSize: 12 }}>
                  {new Date(t.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
