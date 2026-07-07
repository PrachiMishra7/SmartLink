import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '', decimals = 0 }: { end: number; duration?: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(ease * end);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          window.requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  
  return <span ref={ref}>{prefix}{count.toFixed(decimals)}{suffix}</span>;
}

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
    <section id="how-it-works" style={{ maxWidth: 1100, margin: '0 auto 100px', padding: '0 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>How It Works</div>
        <h2 className="gt-white" style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em' }}>3 Steps to Smarter Links</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 40, left: '16%', right: '16%', height: 2, background: 'linear-gradient(90deg, rgba(34,197,94,0) 0%, rgba(34,197,94,.5) 50%, rgba(34,197,94,0) 100%)', zIndex: 0 }} className="hide-mobile" />
        {steps.map((s, i) => (
          <div key={s.title} className="card-interactive" style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '40px 24px', background: 'linear-gradient(180deg, rgba(12,21,38,0.8) 0%, rgba(8,14,26,0.9) 100%)' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', width: 80, height: 80, borderRadius: 24, background: '#0a1220', border: '1px solid rgba(34,197,94,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', boxShadow: '0 10px 40px rgba(34,197,94,.2)' }}>
              <Svg d={s.icon} size={36} />
              <div style={{ position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #16a34a)', color: '#080e1a', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #0a1220', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{i+1}</div>
            </div>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: 20, marginBottom: 12, marginTop: 24 }}>{s.title}</h3>
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>{s.desc}</p>
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
    <section style={{ maxWidth: 1100, margin: '0 auto 100px', padding: '0 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Enterprise Grade</div>
        <h2 className="gt-white" style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, marginBottom: 14, letterSpacing: '-0.02em' }}>Built with Security First</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {cards.map(c => (
          <div key={c.t} className="card-interactive" style={{ padding: '40px 32px', textAlign: 'center', background: 'linear-gradient(160deg, rgba(12,21,38,0.8) 0%, rgba(8,14,26,0.9) 100%)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: c.bg, filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none', opacity: 0.6 }} />
            <div style={{ width: 64, height: 64, borderRadius: 20, background: c.bg, color: c.c, border: `1px solid ${c.bg.replace('0.1', '0.2')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', position: 'relative' }}>
              <Svg d={c.i} size={30} />
            </div>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: 19, marginBottom: 12, position: 'relative' }}>{c.t}</h3>
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, position: 'relative' }}>{c.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AnalyticsPreview({ openAuth, isLoggedIn = false }: { openAuth: () => void; isLoggedIn?: boolean }) {
  const [stats, setStats] = useState({ clicks: 12.4, visitors: 9.1, mobile: 89, countries: 34 });

  useEffect(() => {
    fetch(`${API_URL || 'http://127.0.0.1:8000'}/api/urls/platform/stats`)
      .then(r => r.json())
      .then(d => {
        if (d.clicks_tracked) {
          setStats({
            clicks: d.clicks_tracked,
            visitors: d.unique_visitors,
            mobile: d.mobile_traffic,
            countries: 34 // Keep active countries static for now or fetch it
          });
        }
      })
      .catch(e => console.error(e));
  }, [API_URL]);

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto 100px', padding: '0 32px' }}>
      <div className="card" style={{ padding: '80px 48px', position: 'relative', overflow: 'hidden', textAlign: 'center', background: 'linear-gradient(180deg, rgba(12,21,38,0.7) 0%, rgba(8,14,26,0.95) 100%)', border: '1px solid rgba(26,46,70,0.8)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, rgba(34,197,94,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <h2 className="gt-white" style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, marginBottom: 20, letterSpacing: '-0.02em', position: 'relative' }}>Deep Analytics Preview</h2>
        <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6, position: 'relative' }}>Track every click, traffic source, top countries, and device types to understand your audience perfectly in real time.</p>
        
        <div style={{ maxWidth: 800, margin: '0 auto', background: 'rgba(8,14,26,0.8)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 32, boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)', position: 'relative', backdropFilter: 'blur(20px)' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { v: stats.clicks, l: 'Total Clicks', s: '', c: '#4ade80', dec: 0 },
                { v: stats.visitors, l: 'Unique Visitors', s: '', c: '#60a5fa', dec: 0 },
                { v: stats.mobile, l: 'Mobile Traffic', s: '%', c: '#fbbf24', dec: 0 },
                { v: stats.countries, l: 'Active Countries', s: '', c: '#c084fc', dec: 0 }
              ].map((stat, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '24px 16px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: stat.c, letterSpacing: '-1px', marginBottom: 8, textShadow: `0 0 20px ${stat.c}40` }}>
                    <AnimatedCounter end={stat.v} decimals={stat.dec} suffix={stat.s} duration={2500} />
                  </div>
                  <div style={{ color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.l}</div>
                </div>
              ))}
           </div>
           
           <div style={{ height: 160, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: '20px 24px', gap: 12 }}>
             {/* Animated mock chart bars */}
             {[40, 65, 30, 85, 55, 90, 45, 75, 50, 95].map((h, i) => (
               <div key={i} style={{ flex: 1, background: `linear-gradient(180deg, #22c55e ${h}%, rgba(34,197,94,0.1) 100%)`, borderRadius: '6px 6px 0 0', opacity: 0.8, animation: `fadeUp 1s ease-out ${i * 0.1}s both`, height: `${h}%` }} />
             ))}
           </div>
           
           <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isLoggedIn ? 'rgba(4,8,15,0.3)' : 'rgba(4,8,15,0.6)', backdropFilter: 'blur(6px)', borderRadius: 24, zIndex: 10 }}>
             <button onClick={openAuth} className="btn-primary" style={{ padding: '16px 36px', fontSize: 16, boxShadow: '0 0 50px rgba(34,197,94,0.5)', borderRadius: 100 }}>
               {isLoggedIn ? '📊 View Your Analytics →' : 'Unlock Advanced Analytics →'}
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
    <section style={{ maxWidth: 1100, margin: '0 auto 100px', padding: '0 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Trusted Worldwide</div>
        <h2 className="gt-white" style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, marginBottom: 14, letterSpacing: '-0.02em' }}>Loved by 50,000+ Users</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {t.map((o, i) => (
          <div key={i} className="card-interactive" style={{ padding: 40, background: 'linear-gradient(145deg, rgba(12,21,38,0.7) 0%, rgba(8,14,26,0.9) 100%)' }}>
            <div style={{ display: 'flex', gap: 4, color: '#4ade80', marginBottom: 24 }}>
              {[1,2,3,4,5].map(s => <Svg key={s} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" size={18} fill />)}
            </div>
            <div style={{ color: '#e2e8f0', fontSize: 16, lineHeight: 1.7, marginBottom: 32, fontStyle: 'italic' }}>"{o.q}"</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#4ade80,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#080e1a', fontWeight: 900, fontSize: 18, boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>{o.n[0]}</div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{o.n}</div>
                <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>{o.r}</div>
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
    <section style={{ maxWidth: 800, margin: '0 auto 100px', padding: '0 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <h2 className="gt-white" style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, marginBottom: 14, letterSpacing: '-0.02em' }}>Frequently Asked Questions</h2>
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        {qs.map((q, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} className="card-interactive" style={{ padding: '24px 32px', cursor: 'pointer', background: open === i ? 'rgba(12,21,38,0.9)' : 'rgba(12,21,38,0.5)', borderColor: open === i ? 'rgba(34,197,94,0.3)' : 'rgba(26,46,70,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: open === i ? '#4ade80' : '#e2e8f0', fontWeight: 700, fontSize: 17, transition: 'color 0.2s' }}>{q.q}</h3>
              <div style={{ color: open === i ? '#4ade80' : '#64748b', transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                <Svg d="M19 9l-7 7-7-7" size={20} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateRows: open === i ? '1fr' : '0fr', transition: 'grid-template-rows 0.3s ease-out' }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ marginTop: 16, color: '#94a3b8', fontSize: 15, lineHeight: 1.7 }}>{q.a}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
