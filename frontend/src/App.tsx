import React, { useState, useEffect, useRef } from 'react';
import { HowItWorks, SecuritySection, AnalyticsPreview, FAQ, AnimatedCounter } from './Landing';
import { DeepAnalyticsModal } from './DeepAnalyticsModal';
import { AdminPanel } from './AdminPanel';
import { LinksTable } from './LinksTable';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:8000');

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   TINY HELPERS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   TOAST
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   MODAL WRAPPER
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Modal({ close, children, wide = false }: { close: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn);
  }, [close]);
  return (
    <div className="modal-bg a-in" onClick={e => e.target === e.currentTarget && close()}>
      <div className="card a-scale" style={{
        width: '100%', maxWidth: wide ? 780 : 460,
        maxHeight: '90vh', overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 40px 100px rgba(0,0,0,.75)',
      }}>
        <div style={{ position: 'absolute', inset: '0 0 auto', height: 1, background: 'linear-gradient(90deg,transparent,rgba(34,197,94,.5),transparent)', zIndex: 20 }} />
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   AUTH MODAL
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function pwStrength(pw: string): { pct: number; label: string; color: string } {
  if (!pw) return { pct: 0, label: '', color: '#1a2e46' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { pct: 25, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { pct: 50, label: 'Fair', color: '#fbbf24' };
  if (score <= 3) return { pct: 75, label: 'Good', color: '#22c55e' };
  return { pct: 100, label: 'Strong', color: '#4ade80' };
}

function AuthField({ label, type, placeholder, value, onChange, icon, extra, showToggle, onToggle, strength }: {
  label: React.ReactNode; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon: string; extra?: React.ReactNode;
  showToggle?: boolean; onToggle?: () => void;
  strength?: { pct: number; label: string; color: string };
}) {
  return (
    <div className="auth-field">
      <label className="auth-label">{label}{extra}</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon"><Svg d={icon} size={16} /></span>
        <input className="auth-input" type={type} placeholder={placeholder} required
          value={value} onChange={e => onChange(e.target.value)}
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'name'} />
        {showToggle !== undefined && (
          <button type="button" className="auth-input-toggle" onClick={onToggle} tabIndex={-1} aria-label={showToggle ? 'Hide password' : 'Show password'}>
            <Svg d={showToggle ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858 3.03a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'} size={16} />
          </button>
        )}
      </div>
      {strength && value && strength.label && (
        <div className="auth-strength">
          <div className="auth-strength-bar">
            <div className="auth-strength-fill" style={{ width: `${strength.pct}%`, background: strength.color }} />
          </div>
          <div className="auth-strength-label">{strength.label} password</div>
        </div>
      )}
    </div>
  );
}

function AuthModal({ mode, close, setMode, onSuccess, platformStats }:
  { mode: 'login' | 'signup'; close: () => void; setMode: (m: 'login' | 'signup') => void; onSuccess: (u: any, urls: any[]) => void; platformStats?: { links_shortened: number; active_users: number } }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [close]);

  useEffect(() => {
    fetch(`${API_URL}/api/config`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => {});
  }, []);

  const goToMode = (m: 'login' | 'signup') => {
    if (m !== mode) { setErr(''); setSuccess(''); setMode(m); setFormKey(k => k + 1); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(''); setSuccess('');
    try {
      if (mode === 'signup') {
        const r = await fetch(`${API_URL}/api/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pw, name }) });
        if (!r.ok) { const d = await r.json(); throw new Error(d.detail || 'Signup failed'); }
        setSuccess('Account created! Sign in to continue.');
        setMode('login');
        setFormKey(k => k + 1);
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

  const strength = mode === 'signup' ? pwStrength(pw) : undefined;

  return (
    <div className="auth-overlay" onClick={e => e.target === e.currentTarget && close()}>
      <div className="auth-orbs" aria-hidden="true">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <div className="auth-wrap">
        <div className="auth-card">
          <button className="auth-close" onClick={close} aria-label="Close">
            <Svg d="M6 18L18 6M6 6l12 12" size={16} />
          </button>

          <aside className="auth-showcase">
            <div className="auth-showcase-grid" aria-hidden="true" />
            <div className="auth-showcase-glow" aria-hidden="true" />

            <div className="auth-showcase-top">
              <div className="auth-showcase-logo">
                <div className="auth-showcase-logo-icon">
                  <Svg d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" size={22} fill />
                </div>
                <span className="auth-showcase-logo-text">SmartLink</span>
              </div>
              <h2 className="auth-showcase-headline">
                Links that are<br /><em>smart, secure &amp; tracked</em>
              </h2>
              <p className="auth-showcase-sub">
                AI-powered URL shortening with real-time analytics, malware scanning, and enterprise-grade security.
              </p>
              <div className="auth-stats">
                <div className="auth-stat">
                  <div className="auth-stat-val">{platformStats && platformStats.active_users >= 1000 ? `${(platformStats.active_users/1000).toFixed(1)}K+` : (platformStats?.active_users || '–')}</div>
                  <div className="auth-stat-lbl">Users</div>
                </div>
                <div className="auth-stat">
                  <div className="auth-stat-val">{platformStats && platformStats.links_shortened >= 1000 ? `${(platformStats.links_shortened/1000).toFixed(1)}K+` : (platformStats?.links_shortened || '–')}</div>
                  <div className="auth-stat-lbl">Links</div>
                </div>
                <div className="auth-stat">
                  <div className="auth-stat-val">99.9%</div>
                  <div className="auth-stat-lbl">Uptime</div>
                </div>
              </div>
            </div>

            <div>
              <div className="auth-preview">
                <div className="auth-preview-bar">
                  <div className="auth-preview-dot" /><div className="auth-preview-dot" /><div className="auth-preview-dot" />
                </div>
                <div className="auth-preview-row">
                  <span className="auth-preview-link">smartlink.to/campaign</span>
                  <span className="auth-preview-clicks">↑ 12.4k clicks</span>
                </div>
                <div className="auth-preview-row">
                  <span className="auth-preview-link">smartlink.to/product</span>
                  <span className="auth-preview-clicks">↑ 3.8k clicks</span>
                </div>
              </div>
              <div className="auth-quote">
                <p className="auth-quote-text">"Best smart URL tool I've used. The AI slugs are a game changer."</p>
                <p className="auth-quote-author">— Alex R., Marketing Lead</p>
              </div>
            </div>
          </aside>

          <section className="auth-form-side">
            <div className="auth-segment" role="tablist">
              <div className={`auth-segment-indicator${mode === 'signup' ? ' signup' : ''}`} aria-hidden="true" />
              <button type="button" role="tab" aria-selected={mode === 'login'}
                className={`auth-segment-btn${mode === 'login' ? ' active' : ''}`}
                onClick={() => goToMode('login')}>Sign In</button>
              <button type="button" role="tab" aria-selected={mode === 'signup'}
                className={`auth-segment-btn${mode === 'signup' ? ' active' : ''}`}
                onClick={() => goToMode('signup')}>Create Account</button>
            </div>

            <div key={formKey} className="auth-form-body">
              <h3 className="auth-form-heading">
                {mode === 'login' ? 'Welcome back' : 'Get started free'}
              </h3>
              <p className="auth-form-desc">
                {mode === 'login'
                  ? 'Sign in to manage your links and view analytics.'
                  : 'Create your account in seconds — no credit card needed.'}
              </p>

              {err && (
                <div className="auth-error">
                  <Svg d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={16} />
                  <span>{err}</span>
                </div>
              )}
              {success && (
                <div className="auth-success">
                  <Svg d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={16} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={submit}>
                {mode === 'signup' && (
                  <AuthField label="Full name" type="text" placeholder="John Doe" value={name} onChange={setName}
                    icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                )}
                <AuthField label="Email address" type="email" placeholder="you@example.com" value={email} onChange={setEmail}
                  icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                <AuthField
                  label="Password"
                  extra={mode === 'login' ? (
                    <button type="button" className="auth-label-link" onClick={() => alert('Password reset is coming soon.')}>Forgot?</button>
                  ) : undefined}
                  type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Enter your password'}
                  value={pw} onChange={setPw}
                  icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  showToggle={showPw} onToggle={() => setShowPw(v => !v)}
                  strength={strength}
                />

                <button type="submit" disabled={busy} className="auth-submit">
                  {busy ? <Spinner /> : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
                </button>
              </form>



              <div className="auth-trust">
                <span className="auth-trust-item"><Svg d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" size={12} /> Encrypted</span>
                <span className="auth-trust-item"><Svg d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={12} /> Secure</span>
                <span className="auth-trust-item"><Svg d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={12} /> Free forever</span>
              </div>
            </div>

            <p className="auth-footer">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" className="auth-footer-link" onClick={() => goToMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Sign up for free' : 'Sign in instead'}
              </button>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   ANALYTICS MODAL
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AnalyticsModal({ close }: { close: () => void }) {
  const [vis, setVis] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => { 
    setTimeout(() => setVis(true), 120); 
    const tok = localStorage.getItem('token');
    if (tok) {
      fetch(`${API_URL}/api/urls/user/analytics`, { headers: { Authorization: `Bearer ${tok}` } })
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

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n);

  const stats = [
    { label: 'Total Clicks', value: fmt(data.total_clicks || 0), color: '#4ade80', bg: 'rgba(34,197,94,.08)', border: 'rgba(34,197,94,.2)', shadow: '0 8px 30px rgba(34,197,94,.1)' },
    { label: 'Unique Visitors', value: fmt(data.unique_visitors || 0), color: '#60a5fa', bg: 'rgba(96,165,250,.08)', border: 'rgba(96,165,250,.2)', shadow: '0 8px 30px rgba(96,165,250,.1)' },
    { label: 'Avg Clicks / Link', value: data.total_links ? fmt(Math.round(data.total_clicks / data.total_links)) : '0', color: '#fbbf24', bg: 'rgba(251,191,36,.08)', border: 'rgba(251,191,36,.2)', shadow: '0 8px 30px rgba(251,191,36,.1)' },
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
      <div style={{ padding: '36px 32px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
            <Svg d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" size={22} />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>Global Analytics</div>
            <div style={{ color: '#3d5270', fontSize: 12, marginTop: 2 }}>Real-time statistics for your short links</div>
          </div>
        </div>

        {/* 3-stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: '20px 18px', boxShadow: s.shadow, transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = s.shadow.replace('0.1)', '0.2)'); }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = s.shadow; }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: s.color, textShadow: `0 0 20px ${s.color}40` }}>{s.value}</div>
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
              <div key={g.name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i%colors.length], display: 'inline-block' }} />{g.name}
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
                <div key={d.name} style={{ flex: 1, minWidth: 60, background: 'rgba(8,14,26,.8)', border: '1px solid #1a2e46', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#3d5270', marginBottom: 4 }}>{d.name}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{Math.round((d.count/devsTotal)*100)}%</div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <div>
                <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Top Browsers</div>
                {browsers.length === 0 && <div style={{ color: '#3d5270', fontSize: 12 }}>No browser data</div>}
                {browsers.map((b: any) => (
                  <div key={b.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: '#94a3b8' }}>{b.name}</span><span style={{ color: 'white', fontWeight: 700 }}>{Math.round((b.count/browsersTotal)*100)}%</span>
                    </div>
                    <div className="pbar"><div className="pbar-fill" style={{ width: vis ? `${(b.count/browsersTotal)*100}%` : '0%' }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   THREAT MODAL
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function ThreatModal({ close }: { close: () => void }) {
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/urls/platform/threats`)
      .then(r => r.json())
      .then(d => { setThreats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Modal close={close} wide>
      <div style={{ padding: '36px 32px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <Svg d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={22} />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>Threat Intelligence</div>
            <div style={{ color: '#3d5270', fontSize: 12, marginTop: 2 }}>Live feed of URLs intercepted by the Heuristic Engine</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>
        ) : threats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(34,197,94,.08)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Svg d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={26} />
            </div>
            <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 6 }}>All clear</div>
            <div style={{ color: '#253850', fontSize: 13 }}>No malicious links have been intercepted yet.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {threats.map(t => (
              <div key={t.id} style={{ 
                background: 'linear-gradient(180deg, rgba(239,68,68,0.03), rgba(8,14,26,0.8))', 
                border: '1px solid rgba(239,68,68,0.2)', 
                borderRadius: 16, padding: '20px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(239,68,68,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(239,68,68,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(239,68,68,0.05)'; }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #ef4444, transparent)', opacity: 0.5 }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                      <Svg d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={16} />
                    </div>
                    <div>
                      <div style={{ color: '#ef4444', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Threat Blocked</div>
                      <div style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>{new Date(t.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, color: '#f87171', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    Score: {t.score}/100
                  </div>
                </div>
                
                <div style={{ color: '#cbd5e1', fontSize: 14, wordBreak: 'break-all', marginBottom: 16, fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', borderLeft: '3px solid #ef4444' }}>
                  {t.url}
                </div>
                
                {t.reasons && t.reasons.length > 0 && (
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Detection Flags</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {t.reasons.map((r: string, i: number) => (
                        <span key={i} style={{ fontSize: 11, fontWeight: 600, background: 'rgba(251,191,36,.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.3)', padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Svg d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={12} />
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   MAIN APP
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function App() {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState({ links_shortened: 0, active_users: 0, total_clicks: 0 });

  useEffect(() => {
    fetch(`${API_URL}/api/urls/platform/stats`)
      .then(r => r.json())
      .then(d => setStats({ links_shortened: d.links_shortened || 0, active_users: d.active_users || 0, total_clicks: d.total_clicks || 0 }))
      .catch(() => {});
  }, []);

  const [user, setUser] = useState<any>(null);
  const [urls, setUrls] = useState<any[]>([]);
  const [qrUrl, setQrUrl] = useState('');
  const [editingUrl, setEditingUrl] = useState<any>(null);

  const fetchUrls = async () => {
    const tok = localStorage.getItem('token');
    if (!tok) return;
    const r = await fetch(`${API_URL}/api/urls/user/urls`, { headers: { Authorization: `Bearer ${tok}` } });
    const us = await r.json();
    setUrls(Array.isArray(us) ? us : []);
  };

  const deleteUrl = async (id: number) => {
    const tok = localStorage.getItem('token');
    if (!tok) return;
    await fetch(`${API_URL}/api/urls/user/urls/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok}` } });
    fetchUrls();
  };

  const updateUrl = async (id: number, updates: any) => {
    const tok = localStorage.getItem('token');
    if (!tok) return;
    await fetch(`${API_URL}/api/urls/user/urls/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    fetchUrls();
  };

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showAuth, setShowAuth] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showThreat, setShowThreat] = useState(false);
  const [deepAnalyticsUrl, setDeepAnalyticsUrl] = useState<any>(null);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);

  const handleBulkSubmit = async () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l);
    if (!lines.length) return notify('No URLs found', false);
    if (lines.length > 100) return notify('Max 100 URLs at a time', false);
    setBulkBusy(true);
    try {
      const tok = localStorage.getItem('token');
      const payload = { urls: lines.map(l => {
        const parts = l.split(',');
        return { original_url: parts[0].trim(), custom_alias: parts[1] ? parts[1].trim() : undefined, use_ai: useAi };
      })};
      const r = await fetch(`${API_URL}/api/urls/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
        body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error('Bulk shortening failed');
      const res = await r.json();
      setUrls(prev => [...res, ...prev]);
      notify(`Successfully shortened ${res.length} URLs! ðŸŽ‰`);
      setShowBulk(false);
      setBulkText('');
    } catch (e: any) { notify(e.message, false); } finally { setBulkBusy(false); }
  };
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const dashRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const notify = (msg: string, ok = true) => setToast({ msg, ok });
  const openAuth = (m: 'login' | 'signup' = 'login') => { setAuthMode(m); setShowAuth(true); };

  useEffect(() => {
    const tok = localStorage.getItem('token'); if (!tok) return;
    fetch(`${API_URL}/api/me`, { headers: { Authorization: `Bearer ${tok}` } })
      .then(r => r.json())
      .then(me => {
        if (me?.email) setUser(me);
        else localStorage.removeItem('token');
      });
    fetchUrls();
  }, []);

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

  const totalClicks = urls.reduce((acc, u) => acc + (u.click_count || 0), 0);



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

  if (window.location.pathname === '/admin') {
    return <AdminPanel API_URL={API_URL} />;
  }

  return (
    <>
      <div className="page-bg"><div className="grid-bg" /></div>

      <header style={{
        padding: '0 32px',
        borderBottom: '1px solid rgba(26,46,70,.6)',
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(8,14,26,.85)',
        backdropFilter: 'blur(24px)',
        height: 64,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#22c55e" />
              <path d="M19 4.5L10 16.5h7l-3 11L25 15.5h-7l1-11z" fill="white" />
            </svg>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-.02em' }}>SmartLink</span>
          </div>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: 6, padding: '6px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} className="hide-mobile">
            {[
              { label: 'Home', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
              { label: 'Features', action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'Analytics', action: () => { if (user) setShowAnalytics(true); else openAuth('login'); } },
              { label: 'Threat Feed', action: () => setShowThreat(true) },
            ].map(n => (
              <button key={n.label} onClick={n.action} style={{
                background: 'transparent', border: 'none', color: '#94a3b8', fontFamily: 'Inter,sans-serif',
                fontWeight: 600, fontSize: 14, padding: '8px 20px', borderRadius: 100, cursor: 'pointer',
                transition: 'all 0.2s ease', whiteSpace: 'nowrap', position: 'relative'
              }}
                onMouseEnter={e => { (e.currentTarget).style.color = '#fff'; (e.currentTarget).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget).style.color = '#94a3b8'; (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.transform = 'translateY(0)'; }}>
                {n.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {user.role === 'admin' && (
                    <button onClick={() => window.location.href = '/admin'} style={{
                      background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)', color: '#fbbf24',
                      fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: 12, padding: '6px 12px',
                      borderRadius: 8, cursor: 'pointer', transition: 'all .15s',
                    }} className="hide-mobile">Admin</button>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 6px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#4ade80,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#080e1a', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ color: '#cbd5e1', fontSize: 13, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hide-mobile">{user.name?.split(' ')[0]}</span>
                  </div>
                  <button onClick={logout} style={{
                    background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.15)', color: '#f87171',
                    fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: 13, padding: '6px 12px',
                    borderRadius: 8, cursor: 'pointer', transition: 'all .15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.07)'; }}>
                    <Svg d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={15} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className="btn-outline hide-mobile" style={{ padding: '7px 16px', fontSize: 13 }}>Sign In</button>
                <button onClick={() => openAuth('signup')} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13, borderRadius: 10, position: 'relative', zIndex: 100 }}>Get Started →</button>
              </>
            )}
            {/* Hamburger — mobile only */}
            <button onClick={() => setMobileMenuOpen(o => !o)} style={{
              display: 'none', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
              color: '#94a3b8', borderRadius: 8, padding: '8px', cursor: 'pointer', lineHeight: 1,
            }} className="show-mobile">
              <Svg d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div style={{
            position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, zIndex: 190,
            background: 'rgba(8,14,26,.97)', backdropFilter: 'blur(20px)',
            padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {[
              { label: 'ðŸ  Home', action: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); } },
              { label: '⚡ Features', action: () => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); } },
              { label: 'ðŸ“– How it Works', action: () => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); } },
              { label: 'ðŸ“Š Analytics', action: () => { if (user) setShowAnalytics(true); else openAuth('login'); setMobileMenuOpen(false); } },
              { label: 'ðŸ›¡ï¸ Threat Feed', action: () => { setShowThreat(true); setMobileMenuOpen(false); } },
            ].map(n => (
              <button key={n.label} onClick={n.action} style={{
                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                color: '#e2e8f0', fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: 16,
                padding: '14px 20px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                transition: 'all .15s',
              }}>{n.label}</button>
            ))}
            <div style={{ flex: 1 }} />
            {!user && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { openAuth('login'); setMobileMenuOpen(false); }} className="btn-outline" style={{ flex: 1, padding: '12px' }}>Sign In</button>
                <button onClick={() => { openAuth('signup'); setMobileMenuOpen(false); }} className="btn-primary" style={{ flex: 1, padding: '12px' }}>Sign Up</button>
              </div>
            )}
            {user && (
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} style={{
                background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171',
                fontFamily: 'Inter,sans-serif', fontWeight: 600, fontSize: 15, padding: '12px',
                borderRadius: 12, cursor: 'pointer',
              }}>Sign Out</button>
            )}
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>
        {!user && (
          <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 32px 64px', textAlign: 'center', position: 'relative' }} className="a-up">
              <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.12) 0%, transparent 60%)', pointerEvents: 'none', zIndex: -1 }} />
              
              {/* Live platform stats */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, marginBottom: 36, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 20, padding: '4px', backdropFilter: 'blur(10px)' }}>
                {[
                  { n: stats.links_shortened, l: 'Links Created', suffix: '', decimals: 0, color: '#4ade80' },
                  { n: stats.active_users, l: 'Active Users', suffix: '', decimals: 0, color: '#60a5fa' },
                  { n: 99.9, l: 'Uptime', suffix: '%', decimals: 1, color: '#c084fc' },
                ].map((s, i) => (
                  <div key={s.l} style={{ display: 'flex', alignItems: 'center' }}>
                    {i > 0 && <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,.08)', margin: '0 4px' }} />}
                    <div style={{ textAlign: 'center', padding: '10px 24px' }}>
                      <div style={{ color: s.color, fontWeight: 900, fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 3, textShadow: `0 0 20px ${s.color}60` }}>
                        <AnimatedCounter end={s.n} suffix={s.suffix} decimals={s.decimals} />
                      </div>
                      <div style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.l}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Logged-in user personal stats */}
              {user && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                  {[
                    { icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101', label: 'Your Links', value: urls.length, color: '#4ade80' },
                    { icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', label: 'Total Clicks', value: totalClicks, color: '#60a5fa' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
                      <Svg d={s.icon} size={14} color={s.color} />
                      <span style={{ color: s.color, fontWeight: 800, fontSize: 15 }}>{s.value.toLocaleString()}</span>
                      <span style={{ color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="a-float" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: '#22c55e', fontSize: 12, fontWeight: 700, marginBottom: 36, letterSpacing: '.02em' }}>
                <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', opacity: .75, animation: 'ping2 1.5s ease-out infinite' }} />
                  <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                </span>
                AI-Powered URL Shortening is Live
                <style>{`@keyframes ping2{0%{transform:scale(1);opacity:.75}100%{transform:scale(2.2);opacity:0}}`}</style>
              </div>

              <h1 style={{ fontSize: 'clamp(42px,7vw,76px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
                <span className="gt-white">Effortless Links,<br /></span>
                <span className="gt-green">Infinite Possibilities</span>
              </h1>

              <p style={{ fontSize: 18, color: '#4b6a8a', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 48px' }}>
                Create clean, branded links with AI-optimized slugs, gain deep traffic insights,
                and protect your audience from threats with enterprise-grade security.
              </p>

          <div style={{ maxWidth: 740, margin: '0 auto' }}>
            <div className="shortener-box">
              <div style={{ display: 'flex', gap: 8 }}>
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
                <button onClick={shorten} disabled={busy || !rawUrl.trim()} className="btn-primary" style={{ borderRadius: '1.125rem', minWidth: 160 }}>
                  {busy ? <Spinner /> : <>Shorten Now <Svg d="M14 5l7 7m0 0l-7 7m7-7H3" size={18} /></>}
                </button>
              </div>
            </div>

            <div onClick={() => { if (!user) { openAuth(); return; } setUseAi(!useAi); }} style={{
              marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 14, fontSize: 16, padding: '14px 28px', borderRadius: 20,
              transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
              background: useAi ? 'linear-gradient(145deg, rgba(34,197,94,0.15), rgba(16,185,129,0.25))' : 'rgba(15,23,42,0.6)',
              border: `1px solid ${useAi ? 'rgba(34,197,94,.6)' : 'rgba(51,65,85,.5)'}`,
              boxShadow: useAi ? '0 0 30px rgba(34,197,94,.3), inset 0 0 20px rgba(34,197,94,.1)' : '0 4px 12px rgba(0,0,0,0.1)',
              ...(aiHighlight ? { transform: 'scale(1.05)', borderColor: '#4ade80' } : {}),
            }}>
              <div style={{
                width: 44, height: 24, borderRadius: 12, background: useAi ? '#22c55e' : '#334155', position: 'relative',
                transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', alignItems: 'center', padding: 2
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 10, background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transform: `translateX(${useAi ? 20 : 0}px)`, transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {useAi && <Svg d="M5 13l4 4L19 7" size={12} color="#22c55e" />}
                </div>
              </div>
              <span style={{ 
                userSelect: 'none', 
                color: useAi ? '#4ade80' : '#cbd5e1', 
                fontWeight: useAi ? 800 : 500,
                textShadow: useAi ? '0 0 10px rgba(74,222,128,0.5)' : 'none',
                letterSpacing: '.02em'
              }}>
                ✨ Enable AI Semantic Slug
              </span>
            </div>

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
              {shortUrl && !user && (
                <div className="a-up" style={{ marginTop: 16, padding: '24px', borderRadius: 18, background: 'linear-gradient(145deg, rgba(34,197,94,0.1), rgba(12,21,38,0.8))', border: '1px solid rgba(34,197,94,.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                  <div>
                    <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Unlock Analytics & AI Features</h3>
                    <p style={{ color: '#94a3b8', fontSize: 13 }}>Create a free account to track clicks, locations, and edit this link anytime.</p>
                  </div>
                  <button onClick={() => openAuth('signup')} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13, flexShrink: 0, position: 'relative', zIndex: 50 }}>
                    Sign In to Unlock
                  </button>
                </div>
              )}
            </div>

            {!user && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 40, position: 'relative', zIndex: 50 }}>
                <button onClick={() => openAuth('signup')} className="btn-primary" style={{ padding: '14px 32px', fontSize: 16, position: 'relative', zIndex: 50 }}>Get Started Free</button>
              </div>
            )}
          </section>
        )}

        {user && (
          <section ref={dashRef} style={{ maxWidth: 1200, margin: '0 auto 80px', padding: '40px 32px' }} className="a-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 32, background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>Dashboard</h2>
                <div style={{ color: '#94a3b8', fontSize: 15, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>Welcome back, {user.name?.split(' ')[0]} <span role="img" aria-label="wave">👋</span></div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowBulk(true)} className="btn-outline" style={{ padding: '8px 16px', fontSize: 13, borderColor: 'rgba(255,255,255,.1)' }}>
                  <Svg d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" size={16} />
                  Bulk Upload
                </button>
                <button onClick={() => setShowAnalytics(true)} className="btn-ghost-green">
                  <Svg d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" size={16} color="#4ade80" />
                  View Analytics
                </button>
              </div>
            </div>

            {/* Quick Create Bar */}
            <div style={{ padding: 32, marginBottom: 40, background: 'linear-gradient(145deg, rgba(15,23,42,0.6), rgba(8,14,26,0.9))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '14px 20px', transition: 'all .2s', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}>
                  <Svg d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" size={20} color="#64748b" />
                  <input ref={inputRef} type="url" value={rawUrl} onChange={e => setRawUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && shorten()}
                    placeholder="Paste a long URL to shorten..."
                    style={{ background: 'transparent', border: 'none', color: 'white', fontSize: 16, outline: 'none', width: '100%', fontFamily: 'Inter, sans-serif' }} />
                </div>
                <button onClick={shorten} disabled={busy || !rawUrl.trim()} className="btn-primary" style={{ padding: '14px 28px', fontSize: 16, borderRadius: 14, boxShadow: '0 8px 24px rgba(34,197,94,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {busy ? <Spinner /> : 'Shorten'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12, background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>{API_URL.replace(/https?:\/\//, '')}/</span>
                  <input type="text" value={alias} onChange={e => { setAlias(e.target.value); if(e.target.value) setUseAi(false); }} placeholder="custom-alias" style={{ background: 'transparent', border: 'none', outline: 'none', color: useAi ? '#64748b' : 'white', fontSize: 13, width: '100%', maxWidth: 200, fontFamily: 'monospace' }} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div onClick={() => { setUseAi(!useAi); if (!useAi) setAlias(''); }} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '4px 10px', borderRadius: 20,
                    transition: 'all .3s ease', cursor: 'pointer',
                    background: useAi ? 'linear-gradient(145deg, rgba(34,197,94,0.15), rgba(16,185,129,0.2))' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${useAi ? 'rgba(34,197,94,.4)' : 'rgba(255,255,255,.05)'}`,
                  }}>
                    <div style={{ width: 24, height: 14, borderRadius: 7, background: useAi ? '#22c55e' : '#334155', position: 'relative', display: 'flex', alignItems: 'center', padding: 2 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 5, background: 'white', transform: `translateX(${useAi ? 10 : 0}px)`, transition: 'all .3s ease' }} />
                    </div>
                    <span style={{ color: useAi ? '#4ade80' : '#64748b', fontWeight: 600 }}>AI Slug</span>
                  </div>
                  
                  <button onClick={() => setShowAdv(!showAdv)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontWeight: 600 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
                    <Svg d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" size={14} />
                    Options
                  </button>
                </div>
              </div>

              {showAdv && (
                <div className="a-down" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.05)', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                  <input type="password" placeholder="Password protect" value={pw} onChange={e => setPw(e.target.value)}
                    style={{ background: 'rgba(8,14,26,.6)', border: '1px solid #1a2e46', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 13, outline: 'none' }} />
                  <input type="datetime-local" value={exp} onChange={e => setExp(e.target.value)}
                    style={{ background: 'rgba(8,14,26,.6)', border: '1px solid #1a2e46', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 13, outline: 'none', colorScheme: 'dark' }} />
                </div>
              )}

              {/* Quick Create Success Box */}
              {shortUrl && (
                <div className="a-down" style={{ marginTop: 24, padding: '24px', borderRadius: 16, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#22c55e', boxShadow: '0 0 12px #22c55e' }} />
                  <div style={{ minWidth: 0, flex: 1, paddingLeft: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#4ade80', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Svg d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={16} />
                      Link Generated Successfully
                    </div>
                    <a href={shortUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontWeight: 700, fontSize: 20, textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', textShadow: '0 2px 10px rgba(255,255,255,0.2)' }}>
                      {shortUrl.replace(/https?:\/\//, '')}
                    </a>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={() => copy(shortUrl)} style={{
                      flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: 'Inter,sans-serif', cursor: 'pointer', transition: 'all .2s',
                      border: `1px solid ${copied ? 'rgba(34,197,94,.4)' : 'rgba(255,255,255,.08)'}`,
                      background: copied ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.04)',
                      color: copied ? '#4ade80' : '#e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <Svg d={copied ? 'M5 13l4 4L19 7' : 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'} size={16} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={() => setQrUrl(shortUrl)} style={{
                      flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: 'Inter,sans-serif', cursor: 'pointer', transition: 'all .2s',
                      border: '1px solid rgba(96,165,250,.2)', background: 'rgba(96,165,250,.1)', color: '#93c5fd', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(96,165,250,.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(96,165,250,.1)'}>
                      <Svg d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" size={16} />
                      QR
                    </button>
                    <button onClick={() => {
                       // Find the URL object from urls list to open analytics
                       const u = urls.find(x => `${API_URL}/${x.short_code}` === shortUrl);
                       if (u) setDeepAnalyticsUrl(u);
                    }} style={{
                      flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: 'Inter,sans-serif', cursor: 'pointer', transition: 'all .2s',
                      border: '1px solid rgba(192,132,252,.2)', background: 'rgba(192,132,252,.1)', color: '#d8b4fe', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,132,252,.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(192,132,252,.1)'}>
                      <Svg d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" size={16} />
                      Stats
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="eyebrow" style={{ marginBottom: 16 }}>Overview</div>
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

              <div className="eyebrow" style={{ marginTop: 40, marginBottom: 16 }}>Your Links</div>
              <div className="card" style={{ overflow: 'hidden' }}>
              {/* Search + Sort toolbar */}
              {urls.length > 0 && (() => {
                // Pull search and sort state from URL component — use a local function trick
                return null;
              })()}

              {urls.length > 0 ? (
                <LinksTable
                  urls={urls}
                  API_URL={API_URL}
                  onCopy={(url: string) => { navigator.clipboard.writeText(url); notify('Copied!'); }}
                  onQr={(url: string) => setQrUrl(url)}
                  onAnalytics={(u: any) => setDeepAnalyticsUrl(u)}
                  onToggle={(u: any) => updateUrl(u.id, { is_active: !u.is_active })}
                  onEdit={(u: any) => setEditingUrl(u)}
                  onDelete={(id: number) => deleteUrl(id)}
                />
              ) : (
                <div style={{ padding: '80px 32px', textAlign: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(34,197,94,.07)', border: '1px solid rgba(34,197,94,.12)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Svg d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" size={32} />
                  </div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No links yet</div>
                  <div style={{ color: '#475569', fontSize: 14 }}>Paste a URL above to create your first intelligent short link!</div>
                </div>
              )}
            </div>
        </section>
      )}

        {/* ══════════════════ FEATURES ══════════════════ */}
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



        {/* ══════════════════ CTA BANNER ══════════════════ */}
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

        {!user && (
          <>
            {/* New Landing Page Sections */}
            <HowItWorks />
            <AnalyticsPreview openAuth={() => openAuth('signup')} isLoggedIn={false} />
            <SecuritySection />
            <FAQ />
          </>
        )}
      </main>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(26,46,70,.6)', padding: '64px 32px 32px', marginTop: 'auto', background: 'rgba(8,14,26,.6)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 64 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#22c55e" />
                  <path d="M19 4.5L10 16.5h7l-3 11L25 15.5h-7l1-11z" fill="white" />
                </svg>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>SmartLink</span>
              </div>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                The intelligent URL shortener with built-in analytics, AI slugs, and enterprise threat detection.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {['Twitter', 'GitHub', 'Discord'].map(s => (
                  <button key={s} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}>
                    {s[0]}
                  </button>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Analytics', 'Threat Detection', 'Pricing', 'Changelog'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Blog', 'Community', 'Help Center'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Legal', 'Privacy Policy', 'Terms of Service'] }
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>{col.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" onClick={e => { e.preventDefault(); notify(`${l} coming soon in v1.0`); }}
                      style={{ color: '#64748b', textDecoration: 'none', fontSize: 14, transition: 'color .2s' }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = '#4ade80')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = '#64748b')}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 32, borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <span style={{ color: '#4b6a8a', fontSize: 13 }}>© {new Date().getFullYear()} SmartLink Inc. All rights reserved.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#4b6a8a', padding: '6px 12px', background: 'rgba(34,197,94,.05)', borderRadius: 20, border: '1px solid rgba(34,197,94,.1)' }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', opacity: .7, animation: 'ping2 1.5s ease-out infinite' }} />
                <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              </span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════════ MODALS ══════════════════ */}
      {showAuth && (
        <AuthModal mode={authMode} close={() => setShowAuth(false)}
          setMode={setAuthMode}
          platformStats={stats}
          onSuccess={(u, us) => { setUser(u); setUrls(us); notify(`Welcome, ${u.name}! ðŸŽ‰`); }} />
      )}
      {qrUrl && (
        <Modal close={() => setQrUrl('')}>
          <div style={{ padding: '36px 32px', textAlign: 'center' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(96,165,250,.1)', border: '1px solid rgba(96,165,250,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Svg d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" size={18} color="#60a5fa" />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>QR Code</div>
                <div style={{ color: '#475569', fontSize: 12 }}>Scan to open this link</div>
              </div>
            </div>

            {/* URL label */}
            <div style={{ marginBottom: 20, padding: '8px 14px', background: 'rgba(8,14,26,.8)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, fontSize: 12, color: '#4ade80', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {qrUrl.replace(/https?:\/\//, '')}
            </div>

            {/* QR image */}
            <div style={{ background: 'white', padding: 18, borderRadius: 20, display: 'inline-block', marginBottom: 24, boxShadow: '0 0 0 1px rgba(34,197,94,.2), 0 20px 60px rgba(0,0,0,.5)' }}>
              <img src={`${API_URL}/api/urls/qr?data=${encodeURIComponent(qrUrl)}`} alt="QR Code" width={200} height={200} style={{ display: 'block', borderRadius: 4 }} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { navigator.clipboard.writeText(qrUrl); notify('Link copied!'); }} className="btn-outline" style={{ flex: 1, padding: '12px', fontSize: 14 }}>
                <Svg d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" size={16} />
                Copy Link
              </button>
              <a href={`${API_URL}/api/urls/qr?data=${encodeURIComponent(qrUrl)}`} download="smartlink-qr.png" target="_blank" rel="noreferrer" className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Svg d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={16} color="#080e1a" />
                Download PNG
              </a>
            </div>
          </div>
        </Modal>
      )}


      {editingUrl && (
        <Modal close={() => setEditingUrl(null)}>
          <div style={{ padding: 32 }}>
            <h3 style={{ color: 'white', marginBottom: 20 }}>Edit Link Note</h3>
            <textarea 
              defaultValue={editingUrl.notes || ''} 
              id="edit-note"
              style={{ width: '100%', height: 100, background: 'rgba(8,14,26,.8)', border: '1px solid #1a2e46', borderRadius: 12, padding: 16, color: 'white', fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none' }} 
              placeholder="e.g. Cold email campaign link..."
            />
            <button onClick={() => {
              const val = (document.getElementById('edit-note') as HTMLTextAreaElement).value;
              updateUrl(editingUrl.id, { notes: val });
              setEditingUrl(null);
            }} className="btn-primary" style={{ width: '100%', marginTop: 20 }}>Save Note</button>
          </div>
        </Modal>
      )}
      {showBulk && (
        <Modal close={() => setShowBulk(false)}>
          <div style={{ padding: 32 }}>
            <h3 style={{ color: 'white', marginBottom: 12 }}>Bulk Upload URLs</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>Paste your long URLs below, one per line. Optionally, add a custom alias separated by a comma (e.g., `https://example.com, my-alias`). Max 100.</p>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} placeholder="https://google.com&#10;https://example.com, my-example"
              style={{ width: '100%', height: 200, background: 'rgba(4,8,15,.6)', border: '1px solid #1a2e46', borderRadius: 12, padding: 16, color: 'white', fontFamily: 'monospace', fontSize: 13, resize: 'none', marginBottom: 20, outline: 'none' }}
              onFocus={e => (e.target.style.borderColor = '#22c55e')}
              onBlur={e => (e.target.style.borderColor = '#1a2e46')} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowBulk(false)} className="btn-outline" style={{ padding: '10px 20px', fontSize: 14 }}>Cancel</button>
              <button onClick={handleBulkSubmit} disabled={bulkBusy || !bulkText.trim()} className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
                {bulkBusy ? <Spinner /> : 'Shorten All'}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {showAnalytics && <AnalyticsModal close={() => setShowAnalytics(false)} />}
      {deepAnalyticsUrl && <DeepAnalyticsModal url={deepAnalyticsUrl} close={() => setDeepAnalyticsUrl(null)} API_URL={API_URL} />}
      {showThreat && <ThreatModal close={() => setShowThreat(false)} />}
      {toast && <Toast msg={toast.msg} ok={toast.ok} close={() => setToast(null)} />}
    </>
  );
}
// force hmr
// force hmr 2
// force hmr 3
// force hmr 5
// force hmr 6
// force hmr 7
// force hmr 8
// force hmr 9
