import type { Tab } from '../../App'

interface Props {
  tab: Tab
  setTab: (t: Tab) => void
}

const items: { id: Tab; emoji: string; label: string }[] = [
  { id: 'notes', emoji: '📝', label: 'Записи' },
  { id: 'calendar', emoji: '📅', label: 'Календарь' },
  { id: 'overview', emoji: '📊', label: 'Обзор' },
  { id: 'settings', emoji: '⚙️', label: 'Настройки' },
]

export default function BottomNav({ tab, setTab }: Props) {
  return (
    <div style={{
      flexShrink: 0,
      borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(13,13,26,0.97)',
      backdropFilter: 'blur(20px)',
      paddingBottom: 20,
      paddingTop: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {items.map(item => {
          const active = tab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '6px 14px',
              }}
            >
              <span style={{ fontSize: active ? '1.25rem' : '1.05rem' }}>
                {item.emoji}
              </span>
              <span style={{
                fontSize: '0.6rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--accent)' : '#6B6B8D',
              }}>
                {item.label}
              </span>
              {active && (
                <div style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  marginTop: 1,
                  boxShadow: '0 0 6px rgba(255,107,157,0.6)',
                }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
