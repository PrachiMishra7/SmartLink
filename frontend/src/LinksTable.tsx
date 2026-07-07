import React, { useState } from 'react';

function Svg({ d, size = 20, color = 'currentColor', fill = false }: { d: string; size?: number; color?: string; fill?: boolean }) {
  return (
    <svg width={size} height={size} fill={fill ? color : 'none'} stroke={fill ? 'none' : color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d={d} />
    </svg>
  );
}

type LinkUrl = {
  id: number;
  short_code: string;
  original_url: string;
  click_count?: number;
  is_active?: boolean;
  password?: string;
  expiry_date?: string;
  notes?: string;
  created_at?: string;
};

type Props = {
  urls: LinkUrl[];
  API_URL: string;
  onCopy: (url: string) => void;
  onQr: (url: string) => void;
  onAnalytics: (u: LinkUrl) => void;
  onToggle: (u: LinkUrl) => void;
  onEdit: (u: LinkUrl) => void;
  onDelete: (id: number) => void;
};

function ActionBtn({ onClick, title, color, bg, children }: {
  onClick: () => void; title: string; color: string; bg: string; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: bg, border: '1px solid transparent',
        color, fontFamily: 'Inter, sans-serif', fontWeight: 600,
        fontSize: 11, padding: '5px 10px', borderRadius: 8,
        cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color + '50';
        e.currentTarget.style.filter = 'brightness(1.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.filter = 'none';
      }}
    >
      {children}
    </button>
  );
}

export function LinksTable({ urls, API_URL, onCopy, onQr, onAnalytics, onToggle, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'clicks' | 'alphabetical'>('newest');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const filtered = [...urls]
    .filter(u =>
      u.short_code.toLowerCase().includes(search.toLowerCase()) ||
      u.original_url.toLowerCase().includes(search.toLowerCase()) ||
      (u.notes || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'clicks') return (b.click_count || 0) - (a.click_count || 0);
      if (sort === 'alphabetical') return a.short_code.localeCompare(b.short_code);
      return (b.id || 0) - (a.id || 0);
    });

  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return '—'; }
  };

  const baseUrl = API_URL.replace(/https?:\/\//, '').replace(/\/$/, '');

  return (
    <div style={{ padding: '0 0 8px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, padding: '20px 20px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
            <Svg d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={16} color="#94a3b8" />
          </div>
          <input type="text" placeholder="Search links..." value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', background: 'rgba(30,41,59,.4)', border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 12, padding: '10px 14px 10px 38px', color: 'white',
              fontSize: 13, outline: 'none', transition: 'border-color .2s'
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#60a5fa')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)')}
          />
        </div>

        {/* Sort pills */}
        <div style={{ display: 'flex', gap: 3, background: 'rgba(8,14,26,.6)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 3 }}>
          {(['newest', 'clicks', 'alphabetical'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)} style={{
              background: sort === s ? 'rgba(34,197,94,.12)' : 'none',
              border: sort === s ? '1px solid rgba(34,197,94,.25)' : '1px solid transparent',
              color: sort === s ? '#4ade80' : '#94a3b8',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 11,
              padding: '5px 11px', borderRadius: 7, cursor: 'pointer', transition: 'all .18s',
            }}>
              {s === 'newest' ? '🕐 Newest' : s === 'clicks' ? '🔥 Top' : 'A–Z'}
            </button>
          ))}
        </div>

        <div style={{ color: '#475569', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {filtered.length} / {urls.length}
        </div>
      </div>

      {/* Link cards */}
      <div style={{ padding: '14px 12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#475569', fontSize: 14 }}>
            No links match &ldquo;<strong style={{ color: '#94a3b8' }}>{search}</strong>&rdquo;
          </div>
        ) : filtered.map((u) => {
          const shortFull = `${API_URL}/${u.short_code}`;
          const isActive = u.is_active !== false;
          return (
            <div key={u.id} style={{
              background: isActive ? 'rgba(30,41,59,.4)' : 'rgba(15,23,42,.4)',
              border: `1px solid ${isActive ? 'rgba(255,255,255,.1)' : 'rgba(239,68,68,.2)'}`,
              borderRadius: 14, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
              transition: 'border-color .2s',
              opacity: isActive ? 1 : 0.65,
            }}
              onMouseEnter={e => { if (isActive) e.currentTarget.style.borderColor = 'rgba(34,197,94,.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isActive ? 'rgba(255,255,255,.06)' : 'rgba(239,68,68,.12)'; }}
            >
              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                background: isActive ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)',
                border: `1px solid ${isActive ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Svg d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" size={18} color={isActive ? '#22c55e' : '#f87171'} />
              </div>

              {/* Main info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
                  <a href={shortFull} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#4ade80', fontWeight: 800, fontSize: 14, textDecoration: 'none', fontFamily: 'monospace', letterSpacing: '-0.01em' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#86efac')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4ade80')}>
                    {baseUrl}/{u.short_code}
                    <svg style={{ marginLeft: 4, display: 'inline', verticalAlign: 'middle', opacity: 0.4 }} width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                  {u.password && <span style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.2)', padding: '1px 6px', borderRadius: 5 }}>🔒 Protected</span>}
                  {u.expiry_date && <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', padding: '1px 6px', borderRadius: 5 }}>⏱ Expires {fmtDate(u.expiry_date)}</span>}
                  {!isActive && <span style={{ fontSize: 10, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', padding: '1px 6px', borderRadius: 5 }}>⛔ Paused</span>}
                </div>
                <div style={{ color: '#cbd5e1', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.original_url}>
                  {u.original_url}
                </div>
                {u.notes && (
                  <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 3, fontStyle: 'italic' }}>📝 {u.notes}</div>
                )}
              </div>

              {/* Clicks */}
              <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 50 }}>
                <div style={{ color: '#4ade80', fontWeight: 900, fontSize: 20, lineHeight: 1 }}>{(u.click_count ?? 0).toLocaleString()}</div>
                <div style={{ color: '#94a3b8', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>clicks</div>
              </div>

              {/* Date */}
              <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 72 }} className="hide-mobile">
                <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600 }}>Created</div>
                <div style={{ color: '#cbd5e1', fontSize: 10 }}>{fmtDate(u.created_at)}</div>
              </div>

              {/* Actions */}
              <div style={{ flexShrink: 0, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                <ActionBtn onClick={() => onCopy(shortFull)} title="Copy link" color="#e2e8f0" bg="rgba(255,255,255,.08)">
                  <Svg d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" size={13} />
                  <span>Copy</span>
                </ActionBtn>
                <ActionBtn onClick={() => onQr(shortFull)} title="Generate QR Code" color="#93c5fd" bg="rgba(96,165,250,.15)">
                  <Svg d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" size={13} />
                  <span>QR</span>
                </ActionBtn>
                <ActionBtn onClick={() => onAnalytics(u)} title="View deep analytics" color="#d8b4fe" bg="rgba(192,132,252,.15)">
                  <Svg d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" size={13} />
                  <span>Stats</span>
                </ActionBtn>
                <ActionBtn onClick={() => onToggle(u)} title={isActive ? 'Pause link' : 'Enable link'} color={isActive ? '#fcd34d' : '#4ade80'} bg={isActive ? 'rgba(251,191,36,.15)' : 'rgba(34,197,94,.15)'}>
                  <Svg d={isActive ? 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z' : 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z'} size={13} />
                  <span>{isActive ? 'Pause' : 'Enable'}</span>
                </ActionBtn>
                <ActionBtn onClick={() => onEdit(u)} title="Add/edit notes" color="#cbd5e1" bg="rgba(255,255,255,.08)">
                  <Svg d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" size={13} />
                  <span>Edit</span>
                </ActionBtn>
                {confirmDelete === u.id ? (
                  <div style={{ display: 'flex', gap: 3 }}>
                    <ActionBtn onClick={() => { onDelete(u.id); setConfirmDelete(null); }} title="Confirm delete" color="#f87171" bg="rgba(239,68,68,.15)">
                      <Svg d="M5 13l4 4L19 7" size={13} />
                      <span>Yes, Delete</span>
                    </ActionBtn>
                    <ActionBtn onClick={() => setConfirmDelete(null)} title="Cancel" color="#64748b" bg="rgba(255,255,255,.04)">
                      <Svg d="M6 18L18 6M6 6l12 12" size={13} />
                    </ActionBtn>
                  </div>
                ) : (
                  <ActionBtn onClick={() => setConfirmDelete(u.id)} title="Delete link" color="#f87171" bg="rgba(239,68,68,.07)">
                    <Svg d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={13} />
                  </ActionBtn>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

