import '../Notes.css';

function NoteViewModal({ note, onEdit, onDelete, onClose }) {
  const categoryIcons = {
    'Цветы': '🌸', 'Еда': '🍕', 'Напитки': '☕',
    'Музыка': '🎵', 'Фильмы': '🎬', 'Другое': '📝'
  };

  const reactionStyles = {
    'Обожает': 'reaction-love',
    'Любит': 'reaction-like',
    'Нравится': 'reaction-ok',
    'Не любит': 'reaction-dislike',
    'Ненавидит': 'reaction-hate',
    'Аллергия': 'reaction-allergy'
  };

  const handleDelete = () => {
    if (confirm('Удалить эту заметку?')) {
      onDelete(note.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal view-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="note-view">
          <div className="note-view-header">
            <span className="note-view-icon">{categoryIcons[note.category] || '📝'}</span>
            <span className="note-view-category">{note.category}</span>
          </div>

          <h2 className="note-view-title">{note.title}</h2>

          <span className={`note-view-reaction ${reactionStyles[note.reaction] || ''}`}>
            {note.reaction}
          </span>

          {note.details && (
            <p className="note-view-details">{note.details}</p>
          )}

          <div className="note-view-date">
            {new Date(note.createdAt).toLocaleDateString('ru-RU')}
          </div>
        </div>

        <div className="note-view-actions">
          <button className="edit-btn" onClick={onEdit}>
            ✏️ Редактировать
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            🗑️ Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteViewModal;