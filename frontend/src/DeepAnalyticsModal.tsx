import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:8000');

function Svg({ d, size = 20, color = 'currentColor', fill = false }: { d: string; size?: number; color?: string; fill?: boolean }) {
  return (
    <svg width={size} height={size} fill={fill ? color : 'none'} stroke={fill ? 'none' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  );
}

function Spinner() {
  return <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>Loading analytics...</div>;
}

export function DeepAnalyticsModal({ url, close, API_URL: apiBase }: { url: { id: number; short_code: string }; close: () => void; API_URL?: string }) {
  const base = apiBase || API_URL;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (!tok) {
      setData({});
      return;
    }
    fetch(`${base}/api/urls/user/urls/${url.id}/analytics`, { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({}));
  }, [base, url.id]);

  return (
    <div className="modal-bg a-in" onClick={e => e.target === e.currentTarget && close()}>
      <div className="card a-scale" style={{ width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(192,132,252,.12)', border: '1px solid rgba(192,132,252,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d8b4fe' }}>
              <Svg d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" size={22} />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>Link Analytics</div>
              <div style={{ color: '#64748b', fontSize: 12 }}>Performance for smartlink.to/{url.short_code}</div>
            </div>
          </div>

          {!data ? <Spinner /> : (
            <>
              <div className="dashboard-grid" style={{ marginBottom: 24 }}>
                {[
                  { label: 'Total Clicks', value: data.total_clicks ?? 0, color: '#4ade80' },
                  { label: 'Devices', value: Object.keys(data.devices || {}).length, color: '#60a5fa' },
                  { label: 'Browsers', value: Object.keys(data.browsers || {}).length, color: '#fbbf24' },
                ].map(stat => (
                  <div key={stat.label} className="dashboard-panel" style={{ padding: 18 }}>
                    <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{stat.label}</div>
                    <div style={{ color: stat.color, fontSize: 30, fontWeight: 900 }}>{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="dashboard-panel" style={{ padding: 20 }}>
                <div style={{ color: '#fff', fontWeight: 800, marginBottom: 8 }}>What’s included</div>
                <div style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: 14 }}>
                  This panel surfaces click totals, device mix, browser breakdowns, country distribution, and the recent trend for this specific link.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
