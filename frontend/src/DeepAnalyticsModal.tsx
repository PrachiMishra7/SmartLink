import { useState, useEffect } from 'react';

function Svg({ d, size = 20, color = 'currentColor' }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  );
}

export function DeepAnalyticsModal({ url, close, API_URL }: { url: any, close: () => void, API_URL: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tok = localStorage.getItem('token');
    fetch(`${API_URL}/api/urls/user/urls/${url.id}/analytics`, {
      headers: tok ? { Authorization: `Bearer ${tok}` } : {}
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [url.id, API_URL]);

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(4,8,15,.8)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="modal-content" style={{ background: '#0a1120', width: '100%', maxWidth: 700, borderRadius: 24, border: '1px solid #1a2e46', padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={close} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
          <Svg d="M6 18L18 6M6 6l12 12" size={20} />
        </button>
        
        <h3 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Analytics for /{url.short_code}</h3>
        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 32 }}>Deep insights and performance metrics for this specific link.</p>
        
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading analytics...</div>
        ) : !data || data.total_clicks === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
             <Svg d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" size={40} color="rgba(255,255,255,0.1)" />
             <div style={{ marginTop: 16 }}>No clicks recorded yet. Share your link to see data!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Devices */}
            <div style={{ background: 'rgba(8,14,26,.6)', border: '1px solid #1a2e46', borderRadius: 16, padding: 20 }}>
              <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Devices</div>
              {data.devices.map((d: any) => (
                <div key={d.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'white', marginBottom: 6 }}>
                    <span>{d.name}</span>
                    <span>{d.value}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(2, (d.value / data.total_clicks) * 100)}%`, background: '#3b82f6', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Browsers */}
            <div style={{ background: 'rgba(8,14,26,.6)', border: '1px solid #1a2e46', borderRadius: 16, padding: 20 }}>
              <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Browsers</div>
              {data.browsers.map((b: any) => (
                <div key={b.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'white', marginBottom: 6 }}>
                    <span>{b.name}</span>
                    <span>{b.value}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(2, (b.value / data.total_clicks) * 100)}%`, background: '#10b981', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Countries */}
            <div style={{ gridColumn: '1 / -1', background: 'rgba(8,14,26,.6)', border: '1px solid #1a2e46', borderRadius: 16, padding: 20 }}>
              <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Countries</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                {data.countries.map((c: any) => (
                  <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'white', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <span>{c.name}</span>
                    <span style={{ color: '#94a3b8' }}>{c.value} clicks</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
