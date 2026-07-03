import { useState } from 'react';

function Svg({ d, size = 20, color = 'currentColor', fill = false }: { d: string; size?: number; color?: string; fill?: boolean }) {
  return (
    <svg width={size} height={size} fill={fill ? color : 'none'} stroke={fill ? 'none' : color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  );
}

export function HowItWorks() {
  const steps = [
    { title: 'Paste URL', desc: 'Drop any long, ugly link into our smart input.', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { title: 'AI Enhances Link', desc: 'Our engine generates a semantic slug and scans for malware.', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    { title: 'Track & Share', desc: 'Get rich analytics on devices, locations, and click velocity.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];
  return (
    <section id="how-it-works" style={{ maxWidth: 1100, margin: '0 auto 80px', padding: '0 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>How It Works</div>
        <h2 className="gt-white" style={{ fontSize: 38, fontWeight: 900, marginBottom: 14 }}>3 Steps to Smarter Links</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 32, left: '16%', right: '16%', height: 2, background: 'linear-gradient(90deg, rgba(34,197,94,0) 0%, rgba(34,197,94,.4) 50%, rgba(34,197,94,0) 100%)', zIndex: 0 }} />
        {steps.map((s, i) => (
          <div key={s.title} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#080e1a', border: '1px solid rgba(34,197,94,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#22c55e', boxShadow: '0 0 30px rgba(34,197,94,.15)' }}>
              <Svg d={s.icon} size={30} />
            </div>
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 24, height: 24, borderRadius: '50%', background: '#22c55e', color: '#080e1a', fontWeight: 900, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #080e1a' }}>{i+1}</div>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: 18, marginBottom: 10 }}>{s.title}</h3>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SecuritySection() {
  const cards = [
    { t: 'Malicious Detection', d: 'AI scans links before shortening.', i: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', c: '#ef4444', bg: 'rgba(239,68,68,.1)' },
    { t: 'Password Protection', d: 'Keep private links secure.', i: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', c: '#fbbf24', bg: 'rgba(251,191,36,.1)' },
    { t: 'One-Time Links', d: 'Links that disappear after opening.', i: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', c: '#c084fc', bg: 'rgba(192,132,252,.1)' },
  ];
  return (
    <section style={{ maxWidth: 1100, margin: '0 auto 80px', padding: '0 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Enterprise Grade</div>
        <h2 className="gt-white" style={{ fontSize: 38, fontWeight: 900, marginBottom: 14 }}>Built with Security First</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {cards.map(c => (
          <div key={c.t} className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: c.bg, color: c.c, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Svg d={c.i} size={26} />
            </div>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: 17, marginBottom: 10 }}>{c.t}</h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>{c.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AnalyticsPreview({ openAuth }: { openAuth: () => void }) {
  return (
    <section style={{ maxWidth: 1100, margin: '0 auto 80px', padding: '0 32px' }}>
      <div className="card" style={{ padding: '64px 48px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(34,197,94,.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <h2 className="gt-white" style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>Deep Analytics Preview</h2>
        <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 500, margin: '0 auto 32px' }}>Track every click, traffic source, top countries, and device types to understand your audience perfectly.</p>
        
        <div style={{ maxWidth: 700, margin: '0 auto', background: '#080e1a', border: '1px solid #1a2e46', borderRadius: 16, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,.5)', position: 'relative' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24, opacity: .5, filter: 'blur(1px)' }}>
              {['12.4k', '9.1k', 'US', '89%'].map(v => (
                <div key={v} style={{ background: 'rgba(255,255,255,.05)', padding: 16, borderRadius: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#4ade80' }}>{v}</div>
                </div>
              ))}
           </div>
           <div style={{ height: 120, background: 'rgba(34,197,94,.05)', borderRadius: 12, border: '1px solid rgba(34,197,94,.1)', opacity: .5, filter: 'blur(2px)' }} />
           
           <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,14,26,.6)', backdropFilter: 'blur(4px)', borderRadius: 16 }}>
             <button onClick={openAuth} className="btn-primary" style={{ padding: '14px 28px', fontSize: 15, boxShadow: '0 0 40px rgba(34,197,94,.4)' }}>
               Unlock Advanced Analytics
             </button>
           </div>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const t = [
    { q: "Best smart URL tool I've used. The AI slugs are a game changer.", n: "Alex R.", r: "Marketing Lead" },
    { q: "The analytics are incredibly detailed. Knowing my audience has never been easier.", n: "Sarah M.", r: "Content Creator" },
    { q: "Malware detection gives us peace of mind when sharing links with clients.", n: "David T.", r: "Security Analyst" }
  ];
  return (
    <section style={{ maxWidth: 1100, margin: '0 auto 80px', padding: '0 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Trusted Worldwide</div>
        <h2 className="gt-white" style={{ fontSize: 38, fontWeight: 900, marginBottom: 14 }}>Loved by 50,000+ Users</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {t.map((o, i) => (
          <div key={i} className="card" style={{ padding: 32 }}>
            <div style={{ color: '#22c55e', marginBottom: 16 }}>
              {[1,2,3,4,5].map(s => <Svg key={s} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" size={16} fill />)}
            </div>
            <div style={{ color: 'white', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>"{o.q}"</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#080e1a', fontWeight: 800 }}>{o.n[0]}</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{o.n}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>{o.r}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FAQ() {
  const qs = [
    { q: 'Is SmartLink free?', a: 'Yes! Our core features including basic shortening and QR codes are 100% free forever.' },
    { q: 'Can I customize URLs?', a: 'Absolutely. You can choose custom aliases (e.g., smartlink.to/my-brand) or let our AI generate human-readable slugs for you.' },
    { q: 'Are links secure?', a: 'Yes, all links are scanned by our heuristic engine for malware and phishing threats before they are created.' },
    { q: 'Can I track clicks?', a: 'Yes, signing in unlocks deep analytics including traffic sources, geographic distribution, and device tracking.' },
    { q: 'Do links expire?', a: 'You can optionally set an expiration date for your links, after which they will automatically self-destruct.' },
  ];
  
  const [open, setOpen] = useState<number | null>(0);
  
  return (
    <section style={{ maxWidth: 700, margin: '0 auto 80px', padding: '0 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 className="gt-white" style={{ fontSize: 38, fontWeight: 900, marginBottom: 14 }}>Frequently Asked Questions</h2>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {qs.map((q, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} className="card" style={{ padding: '20px 24px', cursor: 'pointer', transition: 'all .2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: open === i ? '#4ade80' : 'white', fontWeight: 700, fontSize: 16 }}>{q.q}</h3>
              <div style={{ color: open === i ? '#4ade80' : '#64748b', transform: open === i ? 'rotate(180deg)' : 'none', transition: 'all .2s' }}>
                <Svg d="M19 9l-7 7-7-7" size={18} />
              </div>
            </div>
            {open === i && (
              <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>{q.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
