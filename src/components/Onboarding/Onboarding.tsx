interface Props {
  onStart: () => void
}

export default function Onboarding({ onStart }: Props) {
  return (
    <div style={{
      minHeight: 768,
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 28px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 280, height: 280,
        background: 'radial-gradient(circle, rgba(255,107,157,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '-10%',
        width: 200, height: 200,
        background: 'radial-gradient(circle, rgba(255,142,114,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Emoji */}
      <div className="animate-float" style={{ fontSize: 64, marginBottom: 32, lineHeight: 1 }}>🧠</div>

      {/* Brand */}
      <h1 className="font-playfair gradient-text" style={{
        fontSize: 36, fontWeight: 700, margin: '0 0 16px',
        textAlign: 'center', lineHeight: 1.15,
      }}>
        HeartNotes
      </h1>

      {/* Subtitle */}
      <p className="font-inter" style={{
        fontSize: '1rem', color: 'var(--text)', textAlign: 'center',
        lineHeight: 1.6, margin: '0 0 56px', maxWidth: 280,
      }}>
        Запоминай предпочтения людей, которые тебе важны
      </p>

      {/* Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button
          onClick={() => {
            try { localStorage.setItem('heartnotes-onboarded', '1') } catch (e) {}
            onStart()
          }}
          className="gradient-bg glow-pink font-inter"
          style={{
            width: '100%', padding: '16px', borderRadius: 12,
            border: 'none', cursor: 'pointer',
            fontSize: '1rem', fontWeight: 600, color: '#fff',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Начать
        </button>

        <button
          onClick={() => {
            try { localStorage.setItem('heartnotes-onboarded', '1') } catch (e) {}
            onStart()
          }}
          className="glass-light font-inter"
          style={{
            width: '100%', padding: '16px', borderRadius: 12,
            cursor: 'pointer',
            fontSize: '1rem', fontWeight: 500, color: '#FFF0F5',
            transition: 'transform 0.15s',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Импорт данных
        </button>
      </div>

      {/* decorative dots removed per request */}
    </div>
  )
}
