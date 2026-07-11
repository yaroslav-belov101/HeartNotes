function NoteCard({ note, onClick }) {
  const categoryIcons = {
    'Цветы': '🌸',
    'Еда': '🍕',
    'Напитки': '☕',
    'Музыка': '🎵',
    'Фильмы': '🎬',
    'Другое': '📝'
  };

  const reactionStyles = {
    'Обожает': 'reaction-love',
    'Любит': 'reaction-like',
    'Нравится': 'reaction-ok',
    'Не любит': 'reaction-dislike',
    'Ненавидит': 'reaction-hate',
    'Аллергия': 'reaction-allergy'
  };

  return (
    <div className="note-card" onClick={() => onClick(note.id)}>
      <span className="note-icon">{categoryIcons[note.category] || '📝'}</span>
      <span className="note-title">{note.title}</span>
      <span className={`note-reaction ${reactionStyles[note.reaction] || ''}`}>
        {note.reaction}
      </span>
      {note.details && <span className="note-details">{note.details}</span>}
    </div>
  );
}

export default NoteCard;