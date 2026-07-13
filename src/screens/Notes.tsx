import { useState } from 'react'
import { notes as allNotes } from '../data'
import type { Note } from '../types'

const people = [
  { id: 1, name: 'Мама', initials: 'М', color: 'var(--accent-gradient)' },
  { id: 2, name: 'Катя', initials: 'К', color: 'linear-gradient(135deg,#A78BFA,#818CF8)' },
  { id: 3, name: 'Паша', initials: 'П', color: 'linear-gradient(135deg,#34D399,#059669)' },
  { id: 4, name: 'Дима', initials: 'Д', color: 'linear-gradient(135deg,#60A5FA,#3B82F6)' },
  { id: 5, name: 'Аня', initials: 'А', color: 'linear-gradient(135deg,#FCD34D,#F59E0B)' },
]

interface NoteCardProps {
  note: Note
  index: number
  onClick: () => void
}

function NoteCard({ note, index, onClick }: NoteCardProps) {
  const [pressed, setPressed] = useState(false)
  const delayStyle = { animationDelay: `${index * 0.05}s`, opacity: 0 } as React.CSSProperties
  return (
    <div
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className="glass animate-fade-in-up card-top-bar"
      style={{
        borderRadius: 20, padding: '16px 16px 14px', cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.15s',
        ...delayStyle,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span className="font-inter" style={{ fontWeight: 600, fontSize: '0.95rem', color: '#FFF0F5', flex: 1, paddingRight: 8 }}>
          {note.title}
        </span>
        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{note.mood}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <span className="font-inter" style={{ fontSize: '0.72rem', color: '#6B6B8D' }}>{note.date}</span>
        <span className="font-inter" style={{ fontSize: '0.72rem', color: '#6B6B8D' }}>·</span>
        <span className="font-inter" style={{ fontSize: '0.72rem', color: '#6B6B8D' }}>{note.category}</span>
      </div>

      <p className="font-inter" style={{
        fontSize: '0.82rem', color: '#A0A0C0', lineHeight: 1.5, margin: '0 0 12px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {note.preview}
      </p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {note.tags.map(tag => (
          <span key={tag} className="tag-pill font-inter">{tag}</span>
        ))}
      </div>
    </div>
  )
}

interface Props {
  onNewNote: () => void
  onViewNote: (note: Note) => void
}

export default function Notes({ onNewNote, onViewNote }: Props) {
  const [activePerson, setActivePerson] = useState(1)
  const [search, setSearch] = useState('')

  const filtered = allNotes.filter(n =>
    (n.personId === activePerson) &&
    (search === '' || n.title.toLowerCase().includes(search.toLowerCase()) || (n.preview || '').toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Sticky header */}
      <div style={{
        padding: '12px 20px', flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(20px)',
      }}>
        <h1 className="font-playfair gradient-text" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
          HeartNotes
        </h1>
        <button
          onClick={onNewNote}
          className="gradient-bg glow-pink"
          style={{
            width: 48, height: 48, borderRadius: '50%', border: 'none',
            fontSize: '1.5rem', cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.15s',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          +
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 0' }}>
        {/* Person tabs */}
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16 }}>
          {people.map(p => (
            <div
              key={p.id}
              onClick={() => setActivePerson(p.id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', fontWeight: 700, color: '#fff', fontFamily: 'Inter',
                boxShadow: activePerson === p.id ? `0 0 0 2px var(--accent), 0 0 20px rgba(255,107,157,0.35)` : 'none',
                transition: 'box-shadow 0.2s',
              }}>
                {p.initials}
              </div>
              <span className="font-inter" style={{
                fontSize: '0.65rem',
                color: activePerson === p.id ? 'var(--accent)' : '#6B6B8D',
                fontWeight: activePerson === p.id ? 600 : 400,
                transition: 'color 0.2s',
              }}>
                {p.name}
              </span>
            </div>
          ))}
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}
          >
            <div className="glass-light" style={{
              width: 56, height: 56, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
            }}>⚙️</div>
            <span className="font-inter" style={{ fontSize: '0.65rem', color: '#6B6B8D' }}>Профили</span>
          </div>
        </div>

        {/* Search */}
        <div className="glass-light" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          borderRadius: 9999, padding: '11px 16px', marginBottom: 16,
        }}>
          <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск записей..."
            className="font-inter search-input"
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: '#FFF0F5', fontSize: '0.9rem', flex: 1, minWidth: 0,
            }}
          />
        </div>

        {/* Note cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div className="animate-float" style={{ fontSize: 48, marginBottom: 16 }}>💭</div>
              <p className="font-inter" style={{ color: '#6B6B8D', fontSize: '0.9rem' }}>Записей пока нет</p>
            </div>
          ) : (
            filtered.map((note, i) => (
              <NoteCard key={note.id} note={note} index={i} onClick={() => onViewNote(note)} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
