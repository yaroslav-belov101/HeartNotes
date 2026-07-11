import { useState } from 'react';
import Header from './components/Header/Header';
import UserTabs from './components/UserTabs/UserTabs';
import SearchBar from './components/SearchBar/SearchBar';
import NotesList from './components/NotesList/NotesList';
import NoteViewModal from './components/NoteViewModal/NoteViewModal';
import NoteFormModal from './components/NoteFormModal/NoteFormModal';

function App() {
  const [activeUserId, setActiveUserId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  
  const [viewingNote, setViewingNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const filteredNotes = notes
    .filter(n => n.userId === activeUserId)
    .filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleSaveNote = (noteData) => {
    if (noteData.id) {
      setNotes(prev => prev.map(n => n.id === noteData.id ? noteData : n));
    } else {
      setNotes(prev => [...prev, { ...noteData, id: Date.now() }]);
    }
  };

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handleNoteClick = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    setViewingNote(note);
  };

  const handleCloseView = () => {
    setViewingNote(null);
  };

  const handleStartEdit = () => {
    setEditingNote(viewingNote);
    setViewingNote(null);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingNote(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingNote(null);
  };

  return (
    <div className="app">
      <Header onAddClick={handleAddClick} />
      
      <UserTabs onActiveChange={setActiveUserId} />
      
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      
      <NotesList notes={filteredNotes} onNoteClick={handleNoteClick} />

      {viewingNote && (
        <NoteViewModal
          note={viewingNote}
          onEdit={handleStartEdit}
          onDelete={handleDeleteNote}
          onClose={handleCloseView}
        />
      )}

      {showForm && (
        <NoteFormModal
          note={editingNote}
          userId={activeUserId}
          onSave={handleSaveNote}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default App;