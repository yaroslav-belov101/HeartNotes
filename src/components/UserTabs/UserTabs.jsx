import { useState, useEffect } from 'react'
import './UserTabs.css'

const API = {
  async getUsers() {
    const saved = localStorage.getItem('heartnotes-users');
    return saved ? JSON.parse(saved) : [];
  },

  async createUser(userData) {
    await new Promise(r => setTimeout(r, 300));
    const saved = localStorage.getItem('heartnotes-users');
    const users = saved ? JSON.parse(saved) : [];
    if (users.some(u => u.name === userData.name)) {
      return users.find(u => u.name === userData.name);
    }
    const newUser = {
      id: Date.now(),
      name: userData.name,
      icon: userData.icon,
    };
    users.push(newUser);
    localStorage.setItem('heartnotes-users', JSON.stringify(users));
    return newUser;
  },

  async updateUser(id, userData) {
    await new Promise(r => setTimeout(r, 300));
    const saved = localStorage.getItem('heartnotes-users');
    const users = saved ? JSON.parse(saved) : [];
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...userData };
    localStorage.setItem('heartnotes-users', JSON.stringify(users));
    return users[index];
  },

  async deleteUser(id) {
    await new Promise(r => setTimeout(r, 200));
    const saved = localStorage.getItem('heartnotes-users');
    const users = saved ? JSON.parse(saved) : [];
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem('heartnotes-users', JSON.stringify(filtered));
    return true;
  },

  async saveUsers(users) {
    localStorage.setItem('heartnotes-users', JSON.stringify(users));
    return true;
  }
};

function UserTabs({ onActiveChange }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newUserName, setNewUserName] = useState('');

  // Drag & drop states
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (users.length > 0 && activeIndex < users.length) {
      onActiveChange?.(users[activeIndex].id);
    }
  }, [activeIndex, users, onActiveChange]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await import('../../lib/users').then(m => m.getUsers())
      
      if (data.length === 0) {
        const defaults = [
          { id: 1, name: "Я", icon: null },
          { id: 2, name: "Друг", icon: null },
          { id: 3, name: "Партнер", icon: null },
        ];
       
        for (const u of defaults) {
          await import('../../lib/users').then(m => m.createUser(u))
        }
        const refreshed = await import('../../lib/users').then(m => m.getUsers())
        setUsers(refreshed);
      } else {
        setUsers(data);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserName.trim()) return;

    const userData = { 
      name: newUserName.trim(), 
      icon: null 
    };

    try {
      if (editingIndex !== null) {
        const id = users[editingIndex].id;
        const updated = await API.updateUser(id, userData);
        setUsers(prev => prev.map((u, i) => 
          i === editingIndex ? updated : u
        ));
      } else {
        const created = await API.createUser(userData);
        setUsers(prev => [...prev, created]);
      }
      
      resetForm();
    } catch (error) {
      alert('Не удалось сохранить: ' + error.message);
    }
  };

  const handleEditUser = (index) => {
    setEditingIndex(index);
    setNewUserName(users[index].name);
    setShowManage(false);
    setShowForm(true);
  };

  const handleDeleteUser = async (index) => {
    if (users.length <= 1) {
      alert('Нельзя удалить последнего пользователя');
      return;
    }
    if (!confirm(`Удалить "${users[index].name}"?`)) return;

    try {
      const id = users[index].id;
      await API.deleteUser(id);
      
      const updated = users.filter((_, i) => i !== index);
      setUsers(updated);
      if (activeIndex >= updated.length) {
        setActiveIndex(updated.length - 1);
      }
    } catch (error) {
      alert('Не удалось удалить');
    }
  };

  // Drag & drop handlers
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newUsers = [...users];
    const [removed] = newUsers.splice(draggedIndex, 1);
    newUsers.splice(dropIndex, 0, removed);

    setUsers(newUsers);
    API.saveUsers(newUsers);

    if (activeIndex === draggedIndex) {
      setActiveIndex(dropIndex);
    } else if (draggedIndex < activeIndex && dropIndex >= activeIndex) {
      setActiveIndex(activeIndex - 1);
    } else if (draggedIndex > activeIndex && dropIndex <= activeIndex) {
      setActiveIndex(activeIndex + 1);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    setNewUserName('');
  };

  if (isLoading) {
    return <div className="user-tabs loading">Загрузка...</div>;
  }

  return (
    <div className="user-tabs">
      {users.map((user, index) => (
        <button 
          key={user.id || index}
          className={activeIndex === index ? 'active' : ''}
          onClick={() => setActiveIndex(index)}
          onContextMenu={(e) => {
            e.preventDefault();
            handleEditUser(index);
          }}
          title={user.name}
        >
          <span className="user-name">{user.name}</span>
        </button>
      ))}

      <button
        className="add-user-btn"
        onClick={() => {
          resetForm();
          setShowForm(true);
        }}
      >
        +
      </button>

      {/* manage button removed — moved to Settings */}
      
      {/* Модалка управления профилями с drag & drop */}
      {/* profile management moved to Settings screen */}
      
      {/* Модалка добавления/редактирования */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(13,13,26,0.95)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8f8fb' }}>
            <button className="modal-close" onClick={resetForm}>✕</button>
            <h3>{editingIndex !== null ? 'Редактировать' : 'Новый человек'}</h3>
            
            <div className="form-group">
              <label htmlFor="user-name">Имя</label>
              <input
                id="user-name"
                type="text"
                placeholder="Введите имя"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                autoFocus
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                  color: '#f8f8fb', outline: 'none', fontSize: '0.95rem',
                }}
              />
            </div>

            {editingIndex !== null && (
              <button 
                type="button"
                className="delete-btn"
                onClick={() => {
                  handleDeleteUser(editingIndex);
                  resetForm();
                }}
              >
                Удалить
              </button>
            )}

            <button 
              type="button"
              className="save-btn" 
              onClick={handleAddUser}
              disabled={!newUserName.trim()}
            >
              {editingIndex !== null ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserTabs