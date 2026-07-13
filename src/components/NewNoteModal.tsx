import { useState } from 'react'

const templates = [
  { emoji: '💑', label: 'Свидание' },
  { emoji: '🎁', label: 'Подарок' },
  { emoji: '💌', label: 'Признание' },
  { emoji: '😢', label: 'Ссора' },
  { emoji: '✈️', label: 'Поездка' },
]

const moods = ['😊', '❤️', '😂', '😢', '😡', '🤔', '🥰', '⭐']
const catTabs = ['🍽️ Еда', '🎁 Подарки', '⚠️ Важно', '📝 Заметки']

interface Props {
  onClose: () => void
}

export default function NewNoteModal({ onClose }: Props) {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [mood, setMood] = useState('😊')
  const [cat, setCat] = useState(0)

  return (
    <div
      className="animate-fade-in"
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      <div
        className="animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          maxHeight: '88%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Handle */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px 16px' }}>
          <h2 className="font-inter" style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-h)' }}>
            Новая запись
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text)', padding: 4 }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
          {/* Templates */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16 }}>
            {templates.map(t => (
              <div key={t.label} className="glass-light" style={{
                flexShrink: 0, borderRadius: 9999, padding: '7px 14px',
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              }}>
                <span style={{ fontSize: '0.95rem' }}>{t.emoji}</span>
                <span className="font-inter" style={{ fontSize: '0.78rem', color: '#A0A0C0', whiteSpace: 'nowrap' }}>{t.label}</span>
              </div>
            ))}
          </div>

          {/* Title */}
          <div style={{ marginBottom: 12 }}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Заголовок"
                className="font-inter glass-light"
              style={{
                width: '100%', padding: '13px 14px', borderRadius: 12,
                border: 'none', outline: 'none', color: '#FFF0F5',
                fontSize: '0.92rem', background: 'rgba(255,255,255,0.05)',
              }}
            />
          </div>

          {/* Details */}
          <div style={{ marginBottom: 16 }}>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Детали..."
              rows={4}
              className="font-inter"
              style={{
                width: '100%', padding: '13px 14px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)', outline: 'none',
                color: '#FFF0F5', fontSize: '0.88rem', resize: 'none',
                background: 'rgba(255,255,255,0.04)', lineHeight: 1.5,
              }}
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <div className="font-inter" style={{ fontSize: '0.75rem', color: '#6B6B8D', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Категория
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {catTabs.map((c, i) => (
                <button
                  key={c}
                  onClick={() => setCat(i)}
                  className="font-inter"
                  style={{
                    padding: '6px 12px', borderRadius: 9999, cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 500,
                      background: cat === i ? 'var(--accent-bg)' : 'rgba(255,255,255,0.05)',
                      color: cat === i ? 'var(--accent)' : 'var(--text)',
                      outline: `1px solid ${cat === i ? 'rgba(255,107,157,0.3)' : 'transparent'}`,
                    border: 'none',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div style={{ marginBottom: 20 }}>
            <div className="font-inter" style={{ fontSize: '0.75rem', color: '#6B6B8D', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Настроение
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {moods.map(m => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  style={{
                    width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
                    fontSize: '1.3rem', background: mood === m ? 'rgba(255,107,157,0.15)' : 'rgba(255,255,255,0.05)',
                      boxShadow: mood === m ? '0 0 0 1.5px var(--accent)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={onClose}
            className="gradient-bg glow-pink font-inter"
            style={{
              width: '100%', padding: '15px', borderRadius: 12,
              border: 'none', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: 600, color: '#fff',
            }}
          >
            Сохранить запись
          </button>
        </div>
      </div>
    </div>
  )
}
