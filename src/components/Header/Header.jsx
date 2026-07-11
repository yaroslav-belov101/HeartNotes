import './Header.css';

function Header({ onAddClick }) {
  return (
    <header className="header">
      <h1>Heart Notes</h1>
      <button className="add-btn" onClick={onAddClick}>+</button>
    </header>
  )
}

export default Header;