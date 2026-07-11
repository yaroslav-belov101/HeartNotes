import { useState, useEffect } from 'react';
import '../Notes.css';

function NoteFormModal({ note, userId, onSave, onDelete, onClose }) {
  const isEditing = !!note;
  
  const [category, setCategory] = useState('Цветы');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [reaction, setReaction] = useState('Любит');
  const [details, setDetails] = useState('');

  const categories = ['Цветы', 'Еда', 'Напитки', 'Музыка', 'Фильмы', 'Другое'];
  const reactions = ['Обожает', 'Любит', 'Нравится', 'Не любит', 'Ненавидит', 'Аллергия'];

  // Подсказки меняются в зависимости от категории
  const placeholders = {
    'Цветы': 'Например: Пионы, розы, тюльпаны...',
    'Еда': 'Например: Пицца, суши, бургер...',
    'Напитки': 'Например: Латте, капучино, смузи...',
    'Музыка': 'Например: Jazz, rock, pop...',
    'Фильмы': 'Например: Драма, комедия, боевик...',
    'Другое': 'Например: Хобби, цвет, стиль...'
  };

  const detailHints = {
    'Цветы': 'Цвет, аромат, сорт, сезон...',
    'Еда': 'Рецепт, ингредиенты, острота, размер...',
    'Напитки': 'Крепость, температура, добавки, бренд...',
    'Музыка': 'Исполнитель, альбом, настроение...',
    'Фильмы': 'Актер, режиссер, год, платформа...',
    'Другое': 'Дополнительная информация...'
  };

  // Заполняем поля при редактировании
  useEffect(() => {
    if (note) {
      setCategory(note.category);
      setTitle(note.title);
      setReaction(note.reaction);
      setDetails(note.details || '');
      
      if (!categories.includes(note.category)) {
        setCategory('Другое');
        setCustomCategory(note.category);
      } else {
        setCustomCategory('');
      }
    }
  }, [note]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === 'Другое' ? customCategory.trim() || 'Другое' : category;

    onSave({
      id: note?.id,
      userId: note?.userId || userId,
      category: finalCategory,
      title: title.trim(),
      reaction,
      details: details.trim(),
      createdAt: note?.createdAt || new Date().toISOString()
    });
    
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Удалить эту заметку?')) {
      onDelete(note.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h3>{isEditing ? 'Редактировать' : 'Новая заметка'}</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Категория</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            {category === 'Другое' && (
              <input
                type="text"
                placeholder="Название категории..."
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                className="custom-category-input"
                autoFocus
              />
            )}
          </div>

          <div className="form-group">
            <label>Название</label>
            <input
              type="text"
              placeholder={placeholders[category]}
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus={category !== 'Другое' && !isEditing}
            />
          </div>

          <div className="form-group">
            <label>Отношение</label>
            <div className="reaction-buttons">
              {reactions.map(r => (
                <button
                  key={r}
                  type="button"
                  className={reaction === r ? 'active' : ''}
                  onClick={() => setReaction(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Детали</label>
            <textarea
              placeholder={detailHints[category]}
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={3}
            />
          </div>

          {isEditing && (
            <button 
              type="button" 
              className="delete-btn-form" 
              onClick={handleDelete}
            >
              Удалить
            </button>
          )}

          <button type="submit" className="save-btn" disabled={!title.trim()}>
            {isEditing ? 'Сохранить' : 'Добавить'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NoteFormModal;