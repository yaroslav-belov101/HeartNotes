import { useRef, useEffect } from 'react'
import './SeacrhBar.css'

function SearchBar({ value, onChange, placeholder = 'Поиск записей...' }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="app-search-bar">
      <span className="search-icon">🔍</span>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
      {value && (
        <button className="search-clear" onClick={handleClear} type="button">
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;