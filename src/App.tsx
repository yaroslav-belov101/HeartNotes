import { useState, useEffect } from 'react'
import type { Note } from './types'
import Onboarding from './components/Onboarding/Onboarding'
import Header from './components/Header/Header'
import UserTabs from './components/UserTabs/UserTabs'
import SearchBar from './components/SearchBar/SearchBar'
import NotesList from './components/NotesList/NotesList'
import ViewNoteModal from './components/ViewNoteModal'
import NoteFormModal from './components/NoteFormModal/NoteFormModal'
import Overview from './screens/Overview'
import Settings from './screens/Settings'
import Calendar from './screens/Calendar'
import BottomNav from './components/BottomNav/BottomNav'

export type Tab = 'notes' | 'calendar' | 'overview' | 'settings'

function App() {
  const [screen, setScreen] = useState<'onboarding' | 'app'>(() => {
    try {
      return localStorage.getItem('heartnotes-onboarded') ? 'app' : 'onboarding'
    } catch (e) {
      return 'onboarding'
    }
  })
  const [tab, setTab] = useState<Tab>('notes')

  const [activeUserId, setActiveUserId] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [notes, setNotes] = useState<Note[]>([])

  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showForm, setShowForm] = useState(false)

  const filteredNotes = notes
    .filter(n => n.userId === activeUserId)
    .filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.details ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.category ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleSaveNote = (noteData: Note) => {
    if (noteData.id) {
      setNotes(prev => prev.map(n => n.id === noteData.id ? noteData : n))
    } else {
      setNotes(prev => [...prev, { ...noteData, id: Date.now() }])
    }
  }

  const handleDeleteNote = (noteId: number) => {
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  const handleNoteClick = (noteId: number) => {
    const note = notes.find(n => n.id === noteId)
    if (note) setViewingNote(note)
  }

  const handleStartEdit = () => {
    if (viewingNote) {
      setEditingNote(viewingNote)
      setViewingNote(null)
      setShowForm(true)
    }
  }

  const handleAddClick = () => {
    setEditingNote(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingNote(null)
  }

  // Telegram WebApp initialization (optional)
  useEffect(() => {
    let mounted = true
    async function initWebApp() {
      try {
        const mod = await import('@twa-dev/sdk')
        const webApp: any = (mod as any).WebApp?.init ? (mod as any).WebApp.init() : (mod as any).init?.()
        if (!mounted) return
        // expand view if inside Telegram
        try { webApp?.expand() } catch (e) { /* ignore */ }
        document.title = 'HeartNotes — Telegram'
      } catch (e) {
        // SDK not available or not running inside Telegram — ignore
      }
    }
    initWebApp()
    return () => { mounted = false }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#0D0D1A',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      padding: 0,
      margin: 0,
      overflow: 'hidden',
    }}>
      <div style={{
        width: '100%',
        height: '100vh',
        background: '#0D0D1A',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {screen === 'onboarding' ? (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Onboarding onStart={() => setScreen('app')} />
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Screens */}
            <div style={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {tab === 'notes' && (
                <>
                  <Header onAddClick={handleAddClick} />
                  <UserTabs onActiveChange={setActiveUserId} />
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                  <NotesList notes={filteredNotes} onNoteClick={handleNoteClick} />
                </>
              )}

              {tab === 'calendar' && <Calendar />}
              {tab === 'overview' && <Overview />}
              {tab === 'settings' && <Settings />}
            </div>

            <BottomNav tab={tab} setTab={setTab} />

            {/* Modals */}
            {viewingNote && (
              <ViewNoteModal
                note={viewingNote}
                onEdit={handleStartEdit}
                onDelete={handleDeleteNote}
                onClose={() => setViewingNote(null)}
              />
            )}

            {showForm && (
              <NoteFormModal
                note={editingNote}
                userId={activeUserId}
                onSave={handleSaveNote}
                onClose={handleCloseForm}
                onDelete={handleDeleteNote}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App