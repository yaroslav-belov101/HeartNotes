import NoteCard from '../NoteCard/NoteCard';

function NotesList({ notes, onNoteClick }) {
  return (
    <div className="notes-list">
      {notes.map(note => (
        <NoteCard 
          key={note.id} 
          note={note} 
          onClick={onNoteClick}
        />
      ))}
    </div>
  );
}

export default NotesList;