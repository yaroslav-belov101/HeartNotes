import { useState, useEffect } from 'react'

function Toggle({ on, disabled, onChange }: { on: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <div
      className="toggle-track"
      onClick={() => !disabled && onChange?.(!on)}
      style={{
        background: on ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div className="toggle-thumb" style={{ left: on ? 22 : 2 }} />
    </div>
  )
}

interface RowProps {
  icon: string
  label: string
  type: 'toggle' | 'arrow'
  on?: boolean
  disabled?: boolean
  danger?: boolean
  onChange?: (v: boolean) => void
}

function SettingRow({ icon, label, type, on, disabled, danger, onChange }: RowProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', cursor: type === 'arrow' ? 'pointer' : 'default',
    }}>
      <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span className="font-inter" style={{
        flex: 1, fontSize: '0.9rem', fontWeight: 500,
        color: danger ? '#FF6B6B' : '#FFF0F5',
      }}>
        {label}
      </span>
      {type === 'toggle' && <Toggle on={on!} disabled={disabled} onChange={onChange} />}
      {type === 'arrow' && (
        <span style={{ color: '#6B6B8D', fontSize: '1rem' }}>›</span>
      )}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />
}

export default function Settings() {
  const [notifications, setNotifications] = useState(true)
  const [showManage, setShowManage] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newUserName, setNewUserName] = useState('')

  useEffect(() => {
    if (!showManage) return
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showManage])

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const m = await import('../lib/users')
      const data = await m.getUsers()
      setUsers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleEditUser = (index: number) => {
    setEditingIndex(index)
    setNewUserName(users[index].name)
  }

  const handleDeleteUser = async (index: number) => {
    if (users.length <= 1) { alert('Нельзя удалить последнего пользователя'); return }
    if (!confirm(`Удалить "${users[index].name}"?`)) return
    try {
      const m = await import('../lib/users')
      await m.deleteUser(users[index].id)
      const updated = users.filter((_, i) => i !== index)
      setUsers(updated)
    } catch (e) { alert('Не удалось удалить') }
  }

  const handleSaveUser = async () => {
    if (!newUserName.trim()) return
    try {
      const m = await import('../lib/users')
      if (editingIndex !== null) {
        const id = users[editingIndex].id
        const updated = await m.updateUser(id, { name: newUserName.trim() })
        setUsers(prev => prev.map((u, i) => i === editingIndex ? updated : u))
      } else {
        const created = await m.createUser({ name: newUserName.trim(), icon: null })
        setUsers(prev => [...prev, created])
      }
      setEditingIndex(null)
      setNewUserName('')
    } catch (e) { alert('Не удалось сохранить') }
  }

  const handleDragStart = (index: number) => setDraggedIndex(index)
  const handleDragOver = (e: any, index: number) => { e.preventDefault(); setDragOverIndex(index) }
  const handleDragLeave = () => setDragOverIndex(null)
  const handleDrop = async (e: any, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) { setDraggedIndex(null); setDragOverIndex(null); return }
    const newUsers = [...users]
    const [removed] = newUsers.splice(draggedIndex, 1)
    newUsers.splice(dropIndex, 0, removed)
    setUsers(newUsers)
    const m = await import('../lib/users')
    m.saveUsers(newUsers)
    setDraggedIndex(null); setDragOverIndex(null)
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '0 20px 24px' }}>
      <div style={{ padding: '16px 0 24px' }}>
        <h1 className="font-playfair" style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#FFF0F5' }}>
          Настройки
        </h1>
      </div>

      {/* Group 1 */}
      <div className="glass" style={{ borderRadius: 20, marginBottom: 16, overflow: 'hidden' }}>
        <SettingRow icon="🔔" label="Уведомления" type="toggle" on={notifications} onChange={setNotifications} />
        <Divider />
        <SettingRow icon="🌙" label="Тёмная тема" type="toggle" on={true} disabled />
      </div>

      {/* Group 2 */}
      <div className="glass" style={{ borderRadius: 20, marginBottom: 16, overflow: 'hidden' }}>
        <SettingRow icon="📤" label="Экспорт данных" type="arrow" />
        <Divider />
        <SettingRow icon="📥" label="Импорт данных" type="arrow" />
        <Divider />
        <div onClick={() => setShowManage(true)}>
          <SettingRow icon="👥" label="Управление профилями" type="arrow" />
        </div>
      </div>

      {/* Group 3 */}
      <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
        <SettingRow icon="🗑️" label="Очистить все данные" type="arrow" danger />
      </div>

      {/* App info */}
      <div style={{ textAlign: 'center', marginTop: 40, paddingBottom: 8 }}>
        <p className="font-playfair gradient-text" style={{ fontSize: 18, fontWeight: 600, margin: '0 0 4px' }}>HeartNotes</p>
        <p className="font-inter" style={{ fontSize: '0.72rem', color: '#6B6B8D', margin: 0 }}>Версия 1.0.0</p>
      </div>

      {/* Manage profiles modal */}
      {showManage && (
        <div className="modal-overlay" onClick={() => setShowManage(false)}>
          <div className="modal manage-modal" onClick={(e) => e.stopPropagation()} style={{ background: 'rgba(13,13,26,0.95)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8f8fb' }}>
            <button className="modal-close" onClick={() => setShowManage(false)}>✕</button>
            <h3>Управление профилями</h3>
            <p className="drag-hint">⟷ Перетягивайте для смены порядка</p>

            {isLoadingUsers ? <div>Загрузка...</div> : (
              <div className="users-list">
                {users.map((user, index) => (
                  <div 
                    key={user.id || index} 
                    className={`user-list-item ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index && dragOverIndex !== draggedIndex ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                  >
                    <span className="drag-handle">☰</span>
                    <div className="user-list-info">
                      <div className="user-list-icon-placeholder">{user.name[0]}</div>
                      <span className="user-list-name">{user.name}</span>
                    </div>
                    <div className="user-list-actions-vertical">
                      <button 
                        className="action-btn edit" 
                        onClick={() => handleEditUser(index)}
                        title="Редактировать"
                      >
                        ✎
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDeleteUser(index)}
                        disabled={users.length <= 1}
                        title="Удалить"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Имя" style={{ flex: 1, padding: 10, borderRadius: 10 }} />
                <button onClick={handleSaveUser} style={{ padding: '10px 12px', borderRadius: 10 }}>Сохранить</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
