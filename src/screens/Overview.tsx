import { useEffect, useState } from 'react'
import { notes as allNotes } from '../data'

function loadProfilesCount() {
  try {
    const saved = localStorage.getItem('heartnotes-users')
    const arr = saved ? JSON.parse(saved) : []
    return Array.isArray(arr) ? arr.length : 0
  } catch (e) {
    return 0
  }
}

export default function Overview() {
  const [profilesCount, setProfilesCount] = useState(() => loadProfilesCount())

  useEffect(() => {
    const onStorage = () => setProfilesCount(loadProfilesCount())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Notes and tags
  const noteCount = allNotes.length
  const tagList: { word: string; weight: number }[] = []
  // Upcoming events removed from Overview (kept only in Calendar)

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '0 20px 24px' }}>
      <div style={{ padding: '16px 0 20px' }}>
        <h1 className="font-playfair gradient-text" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
          Обзор
        </h1>
      </div>

      {/* Quick stats (honest) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { num: String(profilesCount || 1), label: 'Профиля' },
          { num: String(noteCount), label: 'Записей' },
          { num: String(tagList.length), label: 'Тегов' },
        ].map(({ num, label }) => (
          <div key={label} className="glass" style={{ borderRadius: 16, padding: '14px 12px', textAlign: 'center' }}>
            <div className="font-playfair gradient-text" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1, marginBottom: 4 }}>
              {num}
            </div>
            <div className="font-inter" style={{ fontSize: '0.68rem', color: '#6B6B8D', fontWeight: 500 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="glass" style={{ borderRadius: 20, padding: '18px 16px', marginBottom: 20 }}>
        <h2 className="font-inter" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A0A0C0', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Облако тегов
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, lineHeight: 1.6 }}>
          {tagList.map(tag => (
            <span key={tag.word} className="font-inter" style={{
              fontSize: `${0.7 + tag.weight * 0.6}rem`,
              color: '#FF8E72',
              opacity: 0.5 + tag.weight * 0.5,
              cursor: 'pointer',
            }}>
              {tag.word}
            </span>
          ))}
        </div>
      </div>

      {/* Upcoming events + anniversaries */}
      <div style={{ marginBottom: 12 }}>
        <h2 className="font-inter" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A0A0C0', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Ближайшие события
        </h2>
        {/* Events moved to Calendar — no add UI here per request */}
      </div>
    </div>
  )
}
