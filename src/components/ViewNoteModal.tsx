import type { Note } from '../types'

interface Props {
  note: Note
  onEdit: () => void
  onDelete: (id: number) => void
  onClose: () => void
}

export default function ViewNoteModal({ note, onEdit, onDelete, onClose }: Props) {
  return (
    <div
      className="animate-fade-in"
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      <div
        className="animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
          borderRadius: '24px 24px 0 0',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'linear-gradient(135deg,#FF6B9D,#FF8E72)' }} />
        </div>

        <div style={{ padding: '16px 20px 32px' }}>
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h2 className="font-playfair" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFF0F5', margin: 0, flex: 1, paddingRight: 12 }}>
              {note.title}
            </h2>
            <span style={{ fontSize: '2rem' }}>{note.mood}</span>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <span className="font-inter" style={{ fontSize: '0.75rem', color: '#6B6B8D' }}>{note.date}</span>
            <span className="font-inter" style={{ fontSize: '0.75rem', color: '#6B6B8D' }}>·</span>
            <span className="font-inter" style={{ fontSize: '0.75rem', color: '#6B6B8D' }}>{note.category}</span>
          </div>

          {/* Body */}
          <p className="font-inter" style={{ fontSize: '0.9rem', color: '#A0A0C0', lineHeight: 1.65, margin: '0 0 20px' }}>
            {note.preview || note.details || 'Без описания'}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
            {(note.tags ?? []).map(tag => (
              <span key={tag} className="tag-pill font-inter">{tag}</span>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onEdit}
              className="font-inter glass-light"
              style={{
                flex: 1, padding: '14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 600, color: '#FFF0F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              ✏️ Редактировать
            </button>
            <button
              onClick={() => {
                if (confirm('Удалить эту заметку?')) {
                  onDelete(note.id)
                  onClose()
                }
              }}
              className="font-inter"
              style={{
                flex: 1, padding: '14px', borderRadius: 12,
                border: '1px solid rgba(255,80,80,0.25)', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 600, color: '#FF6B6B',
                background: 'rgba(255,80,80,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              🗑️ Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
