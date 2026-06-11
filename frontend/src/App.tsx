import React, { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/* ──────────────────────────────────────────────────────────────
   TINY HELPERS
────────────────────────────────────────────────────────────── */
const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0);

function Svg({ d, size = 20, color = 'currentColor', fill = false }:
  { d: string; size?: number; color?: string; fill?: boolean }) {
  return (
    <svg width={size} height={size} fill={fill ? color : 'none'} stroke={fill ? 'none' : color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  );
}

function Spinner() {
  return (
    <svg style={{ animation: 'spin 1s linear infinite', width: 20, height: 20 }}
      fill="none" viewBox="0 0 24 24">
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: .25 }} />
      <path fill="currentColor" style={{ opacity: .75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   TOAST
────────────────────────────────────────────────────────────── */
function Toast({ msg, ok, close }: { msg: string; ok: boolean; close: () => void }) {
  useEffect(() => { const t = setTimeout(close, 2800); return () => clearTimeout(t); }, [close]);
  return (
    <div className="a-scale" style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 500,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 20px', borderRadius: 16,
      background: 'rgba(12,21,38,.97)',
      border: `1px solid ${ok ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.35)'}`,
      color: ok ? '#4ade80' : '#f87171',
      fontSize: 14, fontWeight: 600,
      boxShadow: '0 16px 48px rgba(0,0,0,.6)',
    }}>
      <Svg d={ok
        ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        : 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} size={18} />
      {msg}
      <button onClick={close} style={{ marginLeft: 4, opacity: .5, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', lineHeight: 1 }}>
        <Svg d="M6 18L18 6M6 6l12 12" size={14} />
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   MODAL WRAPPER
────────────────────────────────────────────────────────────── */
function Modal({ close, children, wide = false }: { close: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn);
  }, [close]);
  return (
    <div className="modal-bg a-in" onClick={e => e.target === e.currentTarget && close()}>
      <div className="card a-scale" style={{
        width: '100%', maxWidth: wide ? 780 : 460,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,.75)',
      }}>
        <div style={{ position: 'absolute', inset: '0 0 auto', height: 1, background: 'linear-gradient(90deg,transparent,rgba(34,197,94,.5),transparent)' }} />
        <button onClick={close} style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10,
          width: 32, height: 32, borderRadius: 10, border: 'none',
          background: 'rgba(255,255,255,.06)', color: '#64748b', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
        }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,.12)'; (e.target as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,.06)'; (e.target as HTMLElement).style.color = '#64748b'; }}>
          <Svg d="M6 18L18 6M6 6l12 12" size={15} />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   AUTH MODAL
────────────────────────────────────────────────────────────── */
function AuthModal({ mode, close, switchMode, onSuccess }:
  { mode: 'login' | 'signup'; close: () => void; switchMode: () => void; onSuccess: (u: any, urls: any[]) => void }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      if (mode === 'signup') {
        const r = await fetch(`${API_URL}/api/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pw, name }) });
        if (!r.ok) { const d = await r.json(); throw new Error(d.detail || 'Signup failed'); }
        switchMode();
      } else {
        const form = new URLSearchParams();
        form.append('username', email); form.append('password', pw);
        const r = await fetch(`${API_URL}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form.toString() });
        if (!r.ok) throw new Error('Invalid email or password');
        const d = await r.json();
        localStorage.setItem('token', d.access_token);
        const [me, us] = await Promise.all([
          fetch(`${API_URL}/api/me`, { headers: { Authorization: `Bearer ${d.access_token}` } }).then(r => r.json()),
          fetch(`${API_URL}/api/urls/user/urls`, { headers: { Authorization: `Bearer ${d.access_token}` } }).then(r => r.json()),
        ]);
        onSuccess(me, Array.isArray(us) ? us : []);
        close();
      }
    } catch (ex: any) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <Modal close={close}>
      <div style={{ padding: '36px 32px 32px' }}>
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#22c55e" />
            <path d="M19 4.5L10 16.5h7l-3 11L25 15.5h-7l1-11z" fill="white" />
          </svg>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</div>
            <div style={{ color: '#3d5270', fontSize: 12, marginTop: 1 }}>SmartLink — {mode === 'login' ? 'sign in to continue' : 'free to get started'}</div>
          </div>
        </div>

        {err && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', fontSize: 13 }}>
            {err}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <input className="url-input" style={{ background: 'rgba(8,14,26,.8)', border: '1px solid #1a2e46', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, outline: 'none', transition: 'border-color .2s', fontFamily: 'Inter,sans-serif' }}
              type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)}
              onFocus={e => (e.target.style.borderColor = 'rgba(34,197,94,.5)')}
              onBlur={e => (e.target.style.borderColor = '#1a2e46')} />
          )}
          <input style={{ background: 'rgba(8,14,26,.8)', border: '1px solid #1a2e46', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, outline: 'none', transition: 'border-color .2s', fontFamily: 'Inter,sans-serif', width: '100%' }}
            type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)}
            onFocus={e => (e.target.style.borderColor = 'rgba(34,197,94,.5)')}
            onBlur={e => (e.target.style.borderColor = '#1a2e46')} />
          <input style={{ background: 'rgba(8,14,26,.8)', border: '1px solid #1a2e46', borderRadius: 12, padding: '12px 16px', color: 'white', fontSize: 14, outline: 'none', transition: 'border-color .2s', fontFamily: 'Inter,sans-serif', width: '100%' }}
            type="password" placeholder="Password" required value={pw} onChange={e => setPw(e.target.value)}
            onFocus={e => (e.target.style.borderColor = 'rgba(34,197,94,.5)')}
            onBlur={e => (e.target.style.borderColor = '#1a2e46')} />
          <button type="submit" disabled={busy} className="btn-primary" style={{ marginTop: 4, width: '100%' }}>
            {busy ? <Spinner /> : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#3d5270' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
          <button onClick={switchMode} style={{ background: 'none', border: 'none', color: '#22c55e', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </Modal>
  );
}

/* ──────────────────────────────────────────────────────────────
   ANALYTICS MODAL
────────────────────────────────────────────────────────────── */
function AnalyticsModal({ close }: { close: () => void }) {
  const [vis, setVis] = useState(false);
  const [data, setData] = useState<any>(null);
  
  useEffect(() => { 
    setTimeout(() => setVis(true), 120); 
    const tok = localStorage.getItem('token');
    if (tok) {
      fetch(`${API_URL}/api/user/analytics`, { headers: { Authorization: `Bearer ${tok}` } })
        .then(r => r.json())
        .then(d => setData(d))
        .catch(() => setData({}));
    } else {
      setData({});
    }
  }, []);

  if (!data) return <Modal close={close}><div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div></Modal>;

  const W = 680, H = 130;
  const barData = data.daily_clicks || [0, 0, 0, 0, 0, 0, 0];
  const days = data.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxBar = Math.max(1, ...barData);
  const pts = barData.map((v: number, i: number) => ({ x: (i / (barData.length - 1)) * W, y: H - (v / maxBar) * H }));
  const pathD = pts.map((p: any, i: number) => i === 0 ? `M ${p.x} ${p.y}` : `C ${pts[i-1].x+36} ${pts[i-1].y} ${p.x-36} ${p.y} ${p.x} ${p.y}`).join(' ');
  const fillD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

  const stats = [
    { label: 'Total Clicks', value: fmt(data.total_clicks || 0), color: '#4ade80', bg: 'rgba(34,197,94,.08)', border: 'rgba(34,197,94,.2)' },
    { label: 'Unique Visitors', value: fmt(data.unique_visitors || 0), color: '#60a5fa', bg: 'rgba(96,165,250,.08)', border: 'rgba(96,165,250,.2)' },
    { label: 'Top Country', value: data.geo?.[0]?.label || 'N/A', color: '#c084fc', bg: 'rgba(192,132,252,.08)', border: 'rgba(192,132,252,.2)' },
    { label: 'Avg CTR', value: data.total_clicks ? '100%' : '0%', color: '#fbbf24', bg: 'rgba(251,191,36,.08)', border: 'rgba(251,191,36,.2)' },
  ];
  const geo = data.geo || [];
  const geoTotal = Math.max(1, geo.reduce((a: number, g: any) => a + g.count, 0));
  const colors = ['#22c55e', '#4ade80', '#86efac'];

  const devs = data.devices || [];
  const devsTotal = Math.max(1, devs.reduce((a: number, d: any) => a + d.count, 0));

  const browsers = data.browsers || [];
  const browsersTotal = Math.max(1, browsers.reduce((a: number, b: any) => a + b.count, 0));

  return (
    <Modal close={close} wide>
      <div style={{ padding: '36px 32px 32px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
            <Svg d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" size={22} />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>Deep Analytics</div>
            <div style={{ color: '#3d5270', fontSize: 12, marginTop: 2 }}>Real-time statistics for your short links</div>
          </div>
        </div>

        {/* 4-stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: '16px 14px' }}>
              <div style={{ fontSize: 11, color: '#3d5270', fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* SVG chart */}
        <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: 13 }}>Click Velocity — Last 7 Days</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 8, padding: '4px 10px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />Live
            </div>
          </div>
          <svg viewBox={`0 0 ${W} ${H + 12}`} style={{ width: '100%', height: 155 }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity=".2" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={fillD} fill="url(#chartGrad)" />
            <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" className="a-line" />
            {pts.map((p: any, i: number) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="#0c1526" stroke="#22c55e" strokeWidth="2.5" />)}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {days.map((d: string) => <span key={d} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#253850', fontWeight: 600 }}>{d}</span>)}
          </div>
        </div>

        {/* Geo + Devices */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Geo */}
          <div className="card" style={{ padding: '20px 20px' }}>
            <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, marginBottom: 16 }}>Geographic Distribution</div>
            {geo.length === 0 && <div style={{ color: '#3d5270', fontSize: 12 }}>No geographic data available</div>}
            {geo.map((g: any, i: number) => (
              <div key={g.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i%colors.length], display: 'inline-block' }} />{g.label}
                  </span>
                  <span style={{ color: 'white', fontWeight: 700 }}>{Math.round((g.count/geoTotal)*100)}%</span>
                </div>
                <div className="pbar">
                  <div className="pbar-fill" style={{ width: vis ? `${(g.count/geoTotal)*100}%` : '0%', background: colors[i%colors.length] }} />
                </div>
              </div>
            ))}
          </div>
          {/* Devices & Browsers */}
          <div className="card" style={{ padding: '20px 20px' }}>
            <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Devices</div>
            {devs.length === 0 && <div style={{ color: '#3d5270', fontSize: 12, marginBottom: 18 }}>No device data</div>}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, overflowX: 'auto' }}>
              {devs.map((d: any) => (
                <div key={d.label} style={{ flex: 1, minWidth: 60, background: 'rgba(8,14,26,.8)', border: '1px solid #1a2e46', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#3d5270', marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{Math.round((d.count/devsTotal)*100)}%</div>
                </div>
              ))}
            </div>
            <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Top Browsers</div>
            {browsers.length === 0 && <div style={{ color: '#3d5270', fontSize: 12 }}>No browser data</div>}
            {browsers.map((b: any) => (
              <div key={b.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: '#94a3b8' }}>{b.label}</span><span style={{ color: 'white', fontWeight: 700 }}>{Math.round((b.count/browsersTotal)*100)}%</span>
                </div>
                <div className="pbar"><div className="pbar-fill" style={{ width: vis ? `${(b.count/browsersTotal)*100}%` : '0%' }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ──────────────────────────────────────────────────────────────
   THREAT MODAL
────────────────────────────────────────────────────────────── */
function ThreatModal({ close }: { close: () => void }) {
  const [p, setP] = useState(0);
  const done = p >= 100;
  useEffect(() => { const iv = setInterval(() => setP(x => { if (x >= 100) { clearInterval(iv); return 100; } return x + 2; }), 55); return () => clearInterval(iv); }, []);
  const steps = [
    { l: 'Phishing database', done: p >= 28 },
    { l: 'Malware signatures', done: p >= 56 },
    { l: 'Spam networks', done: p >= 78 },
    { l: 'SSL certificate', done: p >= 96 },
  ];
  return (
    <Modal close={close}>
      <div style={{ padding: '36px 32px 32px', textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: done ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.08)',
          border: `1px solid ${done ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.25)'}`,
          color: done ? '#22c55e' : '#f87171',
          transition: 'all .6s',
          boxShadow: done ? '0 0 40px rgba(34,197,94,.2)' : 'none',
        }}>
          {done
            ? <Svg d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={34} />
            : <svg width={30} height={30} fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"
              style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>}
        </div>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
          {done ? '✅ All Clear!' : 'Scanning URL...'}
        </div>
        <div style={{ color: '#3d5270', fontSize: 13, lineHeight: 1.7, marginBottom: 24, padding: '0 16px' }}>
          {done
            ? 'No threats detected. SmartLink actively protects all users against phishing, malware, and spam in real time.'
            : 'Checking your URL against 90+ global threat databases in real time...'}
        </div>
        <div className="pbar" style={{ marginBottom: 24 }}>
          <div className="pbar-fill" style={{ width: `${p}%`, background: done ? 'linear-gradient(90deg,#16a34a,#4ade80)' : 'linear-gradient(90deg,#dc2626,#f87171)' }} />
        </div>
        <div style={{ textAlign: 'left' }}>
          {steps.map(s => (
            <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: 13, color: s.done ? '#4ade80' : '#253850', transition: 'color .4s' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${s.done ? 'rgba(34,197,94,.4)' : '#1a2e46'}`,
                background: s.done ? 'rgba(34,197,94,.12)' : 'transparent',
                transition: 'all .4s',
              }}>
                {s.done && <Svg d="M5 13l4 4L19 7" size={11} color="#4ade80" />}
              </div>
              {s.l}
            </div>
          ))}
        </div>
        {done && (
          <button onClick={close} className="btn-primary" style={{ width: '100%', marginTop: 20 }}>Close</button>
        )}
      </div>
    </Modal>
  );
}

/* ──────────────────────────────────────────────────────────────
   MAIN APP
────────────────────────────────────────────────────────────── */
export default function App() {
  /* state */
  const [rawUrl, setRawUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [useAi, setUseAi] = useState(false);
  const [alias, setAlias] = useState('');
  const [pw, setPw] = useState('');
  const [exp, setExp] = useState('');
  const [showAdv, setShowAdv] = useState(false);
  const [aiHighlight, setAiHighlight] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [urls, setUrls] = useState<any[]>([]);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showAuth, setShowAuth] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showThreat, setShowThreat] = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const notify = (msg: string, ok = true) => setToast({ msg, ok });
  const openAuth = (m: 'login' | 'signup' = 'login') => { setAuthMode(m); setShowAuth(true); };

  /* auto-login */
  useEffect(() => {
    const tok = localStorage.getItem('token'); if (!tok) return;
    Promise.all([
      fetch(`${API_URL}/api/me`, { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
      fetch(`${API_URL}/api/urls/user/urls`, { headers: { Authorization: `Bearer ${tok}` } }).then(r => r.json()),
    ]).then(([me, us]) => { if (me?.email) { setUser(me); setUrls(Array.isArray(us) ? us : []); } })
      .catch(() => localStorage.removeItem('token'));
  }, []);

  /* shorten */
  const shorten = async () => {
    if (!rawUrl.trim()) return;
    setBusy(true); setShortUrl(null);
    try {
      const tok = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (tok) headers.Authorization = `Bearer ${tok}`;
      const body: any = { original_url: rawUrl, use_ai: useAi };
      if (alias) body.custom_alias = alias;
      if (pw) body.password = pw;
      if (exp) body.expiry_date = new Date(exp).toISOString();
      const r = await fetch(`${API_URL}/api/urls/shorten`, { method: 'POST', headers, body: JSON.stringify(body) });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.detail || 'Failed to shorten URL'); }
      const d = await r.json();
      setShortUrl(`${API_URL}/${d.short_code}`);
      setAlias(''); setPw(''); setExp('');
      if (user) setUrls(prev => [d, ...prev]);
      notify('Short link created! 🎉');
    } catch (ex: any) { notify(ex.message, false); } finally { setBusy(false); }
  };

  const copy = async (u: string) => {
    await navigator.clipboard.writeText(u);
    setCopied(true); notify('Copied to clipboard!');
    setTimeout(() => setCopied(false), 1500);
  };

  const logout = () => { localStorage.removeItem('token'); setUser(null); setUrls([]); notify('Signed out'); };

  const totalClicks = urls.reduce((a, u) => a + (u.click_count || 0), 0);

  /* ── FEATURE CARDS CONFIG ── */
  const features = [
    {
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      title: 'AI-Powered Slugs',
      badge: 'Free',
      desc: 'Automatically generate readable, SEO-friendly short codes using advanced AI. Stop ugly random hashes forever.',
      accent: '#60a5fa', accBg: 'rgba(96,165,250,.08)', accBorder: 'rgba(96,165,250,.2)',
      action: () => {
        if (!user) { openAuth(); return; }
        setUseAi(true); setAiHighlight(true);
        setTimeout(() => setAiHighlight(false), 2000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => inputRef.current?.focus(), 500);
      },
    },
    {
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      title: 'Deep Analytics',
      badge: 'Live',
      desc: 'Track every click — devices, browsers, referrers, and geographic location in real time. Full funnel visibility.',
      accent: '#22c55e', accBg: 'rgba(34,197,94,.08)', accBorder: 'rgba(34,197,94,.2)',
      action: () => setShowAnalytics(true),
    },
    {
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      title: 'Threat Detection',
      badge: 'Active',
      desc: 'VirusTotal integration scans every URL against 90+ global databases. Block phishing and malware instantly.',
      accent: '#f87171', accBg: 'rgba(239,68,68,.08)', accBorder: 'rgba(239,68,68,.2)',
      action: () => setShowThreat(true),
    },
  ];

  return (
    <>
      {/* ── PAGE BG ── */}
      <div className="page-bg"><div className="grid-bg" /></div>

      {/* ── NAVBAR ── */}
      <header className="navbar">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#22c55e" />
              <path d="M19 4.5L10 16.5h7l-3 11L25 15.5h-7l1-11z" fill="white" />
            </svg>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>
              Smart<span style={{ color: '#22c55e' }}>Link</span>
            </span>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', border: '1px solid rgba(34,197,94,.25)', background: 'rgba(34,197,94,.08)', padding: '2px 7px', borderRadius: 6, letterSpacing: '0.1em' }}>BETA</span>
          </div>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { label: 'Features', onClick: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'Analytics', onClick: () => setShowAnalytics(true) },
            ].map(n => (
              <button key={n.label} onClick={n.onClick} style={{
                background: 'none', border: 'none', color: '#64748b', fontFamily: 'Inter,sans-serif',
                fontWeight: 600, fontSize: 14, padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                transition: 'all .15s',
              }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = 'white'; (e.target as HTMLElement).style.background = 'rgba(255,255,255,.05)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = '#64748b'; (e.target as HTMLElement).style.background = 'none'; }}>
                {n.label}
              </button>
            ))}
          </nav>

          {/* Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#22c55e,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#080e1a', fontWeight: 900, fontSize: 13 }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                </div>
                <button onClick={() => dashRef.current?.scrollIntoView({ behavior: 'smooth' })} className="btn-outline" style={{ padding: '7px 14px', fontSize: 13 }}>
                  Dashboard
                </button>
                <button onClick={logout} style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171', fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: 13, padding: '7px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all .15s' }}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className="btn-outline" style={{ padding: '7px 16px', fontSize: 13 }}>Sign In</button>
                <button onClick={() => openAuth('signup')} className="btn-primary" style={{ padding: '7px 18px', fontSize: 13, borderRadius: 10 }}>Get Started →</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* ══════════════════ HERO ══════════════════ */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 32px 64px', textAlign: 'center' }} className="a-up">
          {/* Live badge */}
          <div className="a-float" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: '#22c55e', fontSize: 12, fontWeight: 700, marginBottom: 36, letterSpacing: '.02em' }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', opacity: .75, animation: 'ping2 1.5s ease-out infinite' }} />
              <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            </span>
            AI-Powered URL Shortening is Live
            <style>{`@keyframes ping2{0%{transform:scale(1);opacity:.75}100%{transform:scale(2.2);opacity:0}}`}</style>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(42px,7vw,76px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
            <span className="gt-white">Intelligent Links for<br />a </span>
            <span className="gt-green">Smarter Web</span>
          </h1>

          <p style={{ fontSize: 18, color: '#4b6a8a', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 48px' }}>
            More than just a URL shortener. Generate AI-powered slugs, detect malicious links,
            and unlock deep analytics — all in one premium platform.
          </p>

          {/* ── SHORTENER ── */}
          <div style={{ maxWidth: 740, margin: '0 auto' }}>
            <div className="shortener-box">
              <div style={{ display: 'flex', gap: 8 }}>
                {/* URL input */}
                <div className="url-row" style={{ flex: 1 }}>
                  <Svg d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" size={20} color="#253850" />
                  <input ref={inputRef} type="url" value={rawUrl} onChange={e => setRawUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && shorten()}
                    placeholder="Paste your long URL here..."
                    className="url-input" style={{ fontSize: 16 }} />
                  {rawUrl && (
                    <button onClick={() => { setRawUrl(''); setShortUrl(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#253850', lineHeight: 1, flexShrink: 0, transition: 'color .15s' }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#64748b')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#253850')}>
                      <Svg d="M6 18L18 6M6 6l12 12" size={16} />
                    </button>
                  )}
                </div>
                {/* Shorten button */}
                <button onClick={shorten} disabled={busy || !rawUrl.trim()} className="btn-primary" style={{ borderRadius: '1.125rem', minWidth: 160 }}>
                  {busy ? <Spinner /> : <>Shorten Now <Svg d="M14 5l7 7m0 0l-7 7m7-7H3" size={18} /></>}
                </button>
              </div>
            </div>

            {/* AI toggle */}
            <div style={{
              marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '8px 16px', borderRadius: 12,
              transition: 'all .4s',
              ...(aiHighlight ? { background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', color: '#4ade80', fontWeight: 700, transform: 'scale(1.04)' } : { color: '#3d5270', border: '1px solid transparent' }),
            }}>
              <input type="checkbox" id="ai" checked={useAi} onChange={e => { if (!user) { openAuth(); return; } setUseAi(e.target.checked); }}
                style={{ width: 16, height: 16, accentColor: '#22c55e', cursor: 'pointer' }} />
              <label htmlFor="ai" style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
                ✨ Use AI to generate a readable, semantic slug
              </label>
            </div>

            {/* Advanced options */}
            {user && (
              <div style={{ marginTop: 12 }}>
                <button onClick={() => setShowAdv(s => !s)} style={{ background: 'none', border: 'none', color: '#3d5270', fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, margin: '0 auto', transition: 'color .15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#22c55e')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#3d5270')}>
                  <Svg d={showAdv ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} size={14} />
                  Advanced Options
                </button>
                {showAdv && (
                  <div className="a-up" style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {[
                      { ph: 'Custom alias (e.g. my-brand)', val: alias, set: setAlias, type: 'text', ico: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14' },
                      { ph: 'Password protect', val: pw, set: setPw, type: 'password', ico: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                      { ph: 'Expiry date', val: exp, set: setExp, type: 'datetime-local', ico: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                    ].map(f => (
                      <div key={f.ph} style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#253850', pointerEvents: 'none' }}>
                          <Svg d={f.ico} size={15} />
                        </div>
                        <input type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)}
                          style={{ width: '100%', background: 'rgba(8,14,26,.9)', border: '1px solid #1a2e46', borderRadius: 12, padding: '10px 12px 10px 34px', color: 'white', fontSize: 13, fontFamily: 'Inter,sans-serif', outline: 'none', transition: 'border-color .2s', colorScheme: 'dark' }}
                          onFocus={e => (e.target.style.borderColor = 'rgba(34,197,94,.5)')}
                          onBlur={e => (e.target.style.borderColor = '#1a2e46')} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Result */}
            {shortUrl && (
              <div className="a-up" style={{ marginTop: 16, padding: '14px 18px', borderRadius: 18, background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(34,197,94,.6)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>✅ Your link is ready</div>
                  <a href={shortUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80', fontWeight: 700, fontSize: 18, textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {shortUrl}
                  </a>
                </div>
                <button onClick={() => copy(shortUrl)} style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: 'Inter,sans-serif', cursor: 'pointer', transition: 'all .2s', border: `1px solid ${copied ? 'rgba(34,197,94,.35)' : 'rgba(255,255,255,.1)'}`,
                  background: copied ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.06)',
                  color: copied ? '#4ade80' : '#94a3b8',
                }}>
                  <Svg d={copied ? 'M5 13l4 4L19 7' : 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'} size={16} />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            )}
          </div>

          {/* Trust row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 32px', marginTop: 28, fontSize: 12, color: '#253850' }}>
            {['No account required', 'SSL encrypted', '99.9% uptime', 'GDPR compliant', '90+ threat databases'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Svg d="M5 13l4 4L19 7" size={12} color="rgba(34,197,94,.5)" /> {t}
              </span>
            ))}
          </div>
        </section>

        {/* ══════════════════ STATS BAND ══════════════════ */}
        <section style={{ maxWidth: 900, margin: '0 auto 64px', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[{ n: '10M+', l: 'Links Shortened' }, { n: '200K+', l: 'Active Users' }, { n: '99.9%', l: 'Uptime SLA' }, { n: '90+', l: 'Threat DBs' }].map(s => (
              <div key={s.l} className="card" style={{ padding: '22px 20px', textAlign: 'center' }}>
                <div className="gt-green" style={{ fontSize: 32, fontWeight: 900, marginBottom: 4 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: '#3d5270', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════ DASHBOARD ══════════════════ */}
        {user && (
          <section ref={dashRef} style={{ maxWidth: 1200, margin: '0 auto 80px', padding: '0 32px' }} className="a-up">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Your Dashboard</div>
                <h2 style={{ color: 'white', fontWeight: 800, fontSize: 26 }}>Welcome back, {user.name?.split(' ')[0]} 👋</h2>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => setShowAnalytics(true)} className="btn-ghost-green">
                  <Svg d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" size={16} color="#4ade80" />
                  View Analytics
                </button>
                <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => inputRef.current?.focus(), 400); }} className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>
                  <Svg d="M12 4v16m8-8H4" size={16} /> New Link
                </button>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { l: 'Total Clicks', v: fmt(totalClicks), color: '#4ade80', bg: 'rgba(34,197,94,.07)', border: 'rgba(34,197,94,.15)', i: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
                { l: 'Total Links', v: String(urls.length), color: '#60a5fa', bg: 'rgba(96,165,250,.07)', border: 'rgba(96,165,250,.15)', i: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
                { l: 'Protected Links', v: String(urls.filter(u => u.password).length), color: '#fbbf24', bg: 'rgba(251,191,36,.07)', border: 'rgba(251,191,36,.15)', i: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                { l: 'Best Link Clicks', v: fmt(Math.max(0, ...urls.map(u => u.click_count || 0))), color: '#c084fc', bg: 'rgba(192,132,252,.07)', border: 'rgba(192,132,252,.15)', i: 'M13 10V3L4 14h7v7l9-11h-7z' },
              ].map(s => (
                <div key={s.l} className="card" style={{ padding: '20px 20px', borderColor: s.border }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Svg d={s.i} size={18} color={s.color} />
                  </div>
                  <div style={{ fontSize: 11, color: '#3d5270', fontWeight: 700, marginBottom: 4, letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.l}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Links table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              {urls.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Short Link</th>
                        <th>Original URL</th>
                        <th style={{ textAlign: 'center' }}>Clicks</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Copy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {urls.map((u, i) => (
                        <tr key={u.id || i}>
                          <td>
                            <a href={`${API_URL}/${u.short_code}`} target="_blank" rel="noopener noreferrer"
                              style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#4ade80')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#22c55e')}>
                              {API_URL.replace(/https?:\/\//, '')}/{u.short_code}
                              <Svg d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" size={13} color="#3d5270" />
                            </a>
                          </td>
                          <td>
                            <span style={{ color: '#3d5270', display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.original_url}>
                              {u.original_url}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="click-badge">{u.click_count ?? 0}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {u.password && <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)', padding: '2px 8px', borderRadius: 6 }}>🔒 Protected</span>}
                              {u.expiry_date && <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', padding: '2px 8px', borderRadius: 6 }}>⏱ Expires</span>}
                              {!u.password && !u.expiry_date && <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', padding: '2px 8px', borderRadius: 6 }}>✓ Active</span>}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => { navigator.clipboard.writeText(`${API_URL}/${u.short_code}`); notify('Copied!'); }}
                              style={{ width: 34, height: 34, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,.04)', color: '#3d5270', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', transition: 'all .15s' }}
                              onMouseEnter={e => { (e.currentTarget.style.background = 'rgba(34,197,94,.1)'); (e.currentTarget.style.color = '#22c55e'); }}
                              onMouseLeave={e => { (e.currentTarget.style.background = 'rgba(255,255,255,.04)'); (e.currentTarget.style.color = '#3d5270'); }}>
                              <Svg d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '60px 32px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Svg d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" size={26} />
                  </div>
                  <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 6 }}>No links yet</div>
                  <div style={{ color: '#253850', fontSize: 13 }}>Paste a URL above to create your first intelligent link!</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══════════════════ FEATURES ══════════════════ */}
        <section id="features" style={{ maxWidth: 1100, margin: '0 auto 80px', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Platform Features</div>
            <h2 className="gt-white" style={{ fontSize: 38, fontWeight: 900, marginBottom: 14, letterSpacing: '-.02em' }}>Everything you need</h2>
            <p style={{ color: '#3d5270', fontSize: 15, maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>Click any card to explore the feature live — no account needed to try.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} className="card-interactive" onClick={f.action} style={{ padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                {/* glow blob */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: f.accBg, filter: 'blur(30px)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, position: 'relative' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 15, background: f.accBg, border: `1px solid ${f.accBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.accent }}>
                    <Svg d={f.icon} size={22} color={f.accent} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: f.accent, background: f.accBg, border: `1px solid ${f.accBorder}`, padding: '3px 10px', borderRadius: 99, letterSpacing: '.06em' }}>{f.badge}</span>
                </div>
                <h3 style={{ color: 'white', fontWeight: 800, fontSize: 17, marginBottom: 10, position: 'relative' }}>{f.title}</h3>
                <p style={{ color: '#3d5270', fontSize: 13.5, lineHeight: 1.7, position: 'relative' }}>{f.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: f.accent, fontSize: 12, fontWeight: 700, marginTop: 20, position: 'relative' }}>
                  Try it live <Svg d="M14 5l7 7m0 0l-7 7m7-7H3" size={14} color={f.accent} />
                </div>
              </div>
            ))}
          </div>
        </section>



        {/* ══════════════════ CTA BANNER ══════════════════ */}
        {!user && (
          <section style={{ maxWidth: 900, margin: '0 auto 80px', padding: '0 32px' }}>
            <div className="card" style={{ padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', borderColor: 'rgba(34,197,94,.15)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(34,197,94,.05) 0%,transparent 50%,rgba(96,165,250,.04) 100%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: '0 0 auto', height: 1, background: 'linear-gradient(90deg,transparent,rgba(34,197,94,.4),transparent)' }} />
              <div className="eyebrow" style={{ marginBottom: 16, position: 'relative' }}>Ready to start?</div>
              <h2 className="gt-white" style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.1, letterSpacing: '-.02em', position: 'relative' }}>
                Start shortening<br />smarter today
              </h2>
              <p style={{ color: '#3d5270', fontSize: 15, marginBottom: 32, lineHeight: 1.7, position: 'relative' }}>
                Join 200,000+ marketers, developers and creators who trust SmartLink daily.
              </p>
              <button onClick={() => openAuth('signup')} className="btn-primary" style={{ padding: '14px 36px', fontSize: 16, position: 'relative' }}>
                Create Free Account →
              </button>
            </div>
          </section>
        )}
      </main>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(26,46,70,.6)', padding: '32px', marginTop: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#22c55e" />
              <path d="M19 4.5L10 16.5h7l-3 11L25 15.5h-7l1-11z" fill="white" />
            </svg>
            <span style={{ color: '#64748b', fontWeight: 600, fontSize: 14 }}>SmartLink</span>
            <span style={{ color: '#253850', fontSize: 13 }}>© {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            {['Privacy Policy', 'Terms', 'API Docs', 'Status', 'Support'].map(l => (
              <button key={l} onClick={() => notify(`${l} coming soon in v1.0`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#253850', fontSize: 13, textDecoration: 'none', transition: 'color .15s', fontFamily: 'Inter,sans-serif' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#64748b')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#253850')}>{l}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#253850' }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', opacity: .7, animation: 'ping2 1.5s ease-out infinite' }} />
              <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            </span>
            All systems operational
          </div>
        </div>
      </footer>

      {/* ══════════════════ MODALS ══════════════════ */}
      {showAuth && (
        <AuthModal mode={authMode} close={() => setShowAuth(false)}
          switchMode={() => setAuthMode(m => m === 'login' ? 'signup' : 'login')}
          onSuccess={(u, us) => { setUser(u); setUrls(us); notify(`Welcome, ${u.name}! 🎉`); }} />
      )}
      {showAnalytics && <AnalyticsModal close={() => setShowAnalytics(false)} />}
      {showThreat && <ThreatModal close={() => setShowThreat(false)} />}
      {toast && <Toast msg={toast.msg} ok={toast.ok} close={() => setToast(null)} />}
    </>
  );
}
