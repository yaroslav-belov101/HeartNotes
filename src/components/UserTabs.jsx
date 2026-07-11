import { useState, useEffect, useRef } from 'react'
import './UserTabs.css'

const API = {
  // Заглушка: имитирует сервер, сохраняя в localStorage
  async getUsers() {
    const saved = localStorage.getItem('heartnotes-users');
    return saved ? JSON.parse(saved) : [];
  },

  async createUser(userData) {
    // userData: { name: string, icon: string|null (base64) }
    await new Promise(r => setTimeout(r, 300)); 
    
    const saved = localStorage.getItem('heartnotes-users');
    const users = saved ? JSON.parse(saved) : [];
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
  }
};


// const API_URL = '';
// 
// const API = {
//   async getUsers() {
//     const res = await fetch(`${API_URL}/users/`);
//     return res.json();
//   },
//   async createUser(userData) {
//     const formData = new FormData();
//     formData.append('name', userData.name);
//     if (userData.avatarFile) {
//       formData.append('avatar', userData.avatarFile);
//     }
//     const res = await fetch(`${API_URL}/users/`, {
//       method: 'POST',
//       body: formData,
//     });
//     return res.json();
//   },
//   async updateUser(id, userData) { ... },
//   async deleteUser(id) { ... }
// };


function UserTabs() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newUserName, setNewUserName] = useState('');
  
  const [pendingImage, setPendingImage] = useState(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const longPressTimer = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await API.getUsers();
      
      if (data.length === 0) {
        const defaults = [
          { id: 1, name: "Я", icon: null },
          { id: 2, name: "Друг", icon: null },
          { id: 3, name: "Девушка", icon: null },
        ];
       
        for (const u of defaults) {
          await API.createUser(u);
        }
        const refreshed = await API.getUsers();
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

  const cropImage = (imageSrc, scale, offset, containerSize = 200) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = containerSize;
          canvas.height = containerSize;
          const ctx = canvas.getContext('2d');
          
          const displayWidth = img.width * scale;
          const displayHeight = img.height * scale;
          
          const imgX = (containerSize - displayWidth) / 2 + offset.x;
          const imgY = (containerSize - displayHeight) / 2 + offset.y;
          
          ctx.drawImage(img, imgX, imgY, displayWidth, displayHeight);
          
          let dataUrl;
          try {
            dataUrl = canvas.toDataURL('image/webp', 0.85);
            if (!dataUrl || dataUrl.length < 100) {
              throw new Error('WebP not supported');
            }
          } catch (e) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          }
          
          console.log('✂️ Обрезанное изображение. Размер:', dataUrl.length, 'bytes');
          resolve(dataUrl);
        } catch (error) {
          console.error('❌ Ошибка обрезки:', error);
          reject(error);
        }
      };
      img.onerror = (error) => {
        console.error('❌ Ошибка загрузки изображения:', error);
        reject(error);
      };
      img.src = imageSrc;
    });
  };

  const handleAddUser = async () => {
    if (!newUserName.trim()) return;

    let finalIcon = null;
    
    if (pendingImage) {
      try {
        finalIcon = await cropImage(pendingImage, cropScale, cropOffset);
      } catch (error) {
        alert('Ошибка при обработке изображения: ' + error.message);
        return;
      }
    } else if (editingIndex !== null) {
      finalIcon = users[editingIndex]?.icon || null;
    }

    const userData = { 
      name: newUserName.trim(), 
      icon: finalIcon 
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
      console.error('❌ Ошибка сохранения:', error);
      alert('Не удалось сохранить: ' + error.message);
    }
  };

  const handleEditUser = (index) => {
    setEditingIndex(index);
    setNewUserName(users[index].name);
    setPendingImage(null);
    setCropScale(1);
    setCropOffset({ x: 0, y: 0 });
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
      console.error('❌ Ошибка удаления:', error);
      alert('Не удалось удалить');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    setNewUserName('');
    setPendingImage(null);
    setCropScale(1);
    setCropOffset({ x: 0, y: 0 });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCropMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleCropMouseMove = (e) => {
    if (!isDragging) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - cropOffset.x,
        y: e.touches[0].clientY - cropOffset.y,
      });
    }
  };

  const handleCropTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    setCropOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleCropTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e, index) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    longPressTimer.current = setTimeout(() => {
      handleEditUser(index);
    }, 600);
  };

  const handleTouchMove = (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
    if (dx > 10 || dy > 10) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
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
          onTouchStart={(e) => handleTouchStart(e, index)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => {
            e.preventDefault();
            handleEditUser(index);
          }}
        >
          {user.icon ? (
            <img src={user.icon} alt={user.name} className="user-icon-img" />
          ) : (
            <span className="user-name">{user.name}</span>
          )}
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
      
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
              />
            </div>

            <div className="form-group">
              <label>Фото</label>
              
              {!pendingImage && (!editingIndex || !users[editingIndex]?.icon) ? (
                <div className="icon-upload">
                  <div 
                    className="upload-placeholder"
                    onClick={handleUploadClick}
                  >
                    <span className="upload-icon">📷</span>
                    <span>Нажмите, чтобы загрузить</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setPendingImage(ev.target.result);
                          setCropScale(1);
                          setCropOffset({ x: 0, y: 0 });
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = '';
                    }}
                    className="visually-hidden-input"
                  />
                </div>
              ) : pendingImage ? (
                <div className="cropper-container">
                  <div className="cropper-preview">
                    <div
                      className={`cropper-image ${isDragging ? 'dragging' : ''}`}
                      style={{
                        transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropScale})`,
                      }}
                      onMouseDown={handleCropMouseDown}
                      onMouseMove={handleCropMouseMove}
                      onMouseUp={handleCropMouseUp}
                      onMouseLeave={handleCropMouseUp}
                      onTouchStart={handleCropTouchStart}
                      onTouchMove={handleCropTouchMove}
                      onTouchEnd={handleCropTouchEnd}
                    >
                      <img src={pendingImage} alt="crop" draggable={false} />
                    </div>
                    <div className="cropper-circle-overlay" />
                  </div>
                  
                  <div className="cropper-controls">
                    <button
                      type="button"
                      className="zoom-btn"
                      onClick={() => setCropScale(Math.max(0.5, cropScale - 0.1))}
                    >
                      −
                    </button>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={cropScale}
                      onChange={(e) => setCropScale(parseFloat(e.target.value))}
                      className="zoom-slider"
                    />
                    <button
                      type="button"
                      className="zoom-btn"
                      onClick={() => setCropScale(Math.min(3, cropScale + 0.1))}
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    className="change-photo-btn"
                    onClick={() => {
                      setPendingImage(null);
                      setTimeout(() => fileInputRef.current?.click(), 100);
                    }}
                  >
                    Выбрать другое фото
                  </button>
                </div>
              ) : (
                <div className="current-icon-preview">
                  <img 
                    src={users[editingIndex]?.icon} 
                    alt="current" 
                    className="current-icon-img" 
                  />
                  <button
                    type="button"
                    className="change-photo-btn"
                    onClick={handleUploadClick}
                  >
                    Заменить фото
                  </button>
                </div>
              )}
              
              <p className="format-hint">
                {pendingImage 
                  ? 'Перетащите фото и настройте масштаб' 
                  : 'Рекомендуется: JPEG, PNG, WebP'}
              </p>
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