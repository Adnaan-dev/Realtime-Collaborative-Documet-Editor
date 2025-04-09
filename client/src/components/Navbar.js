import React from 'react';
import './Navbar.css';

function Navbar({ toggleTheme, theme }) {
    return (
        <div className="navbar">
            <div className="navbar-center">
                <div className="navbar-title">📝 REAL-TIME COLLABORATIVE DOCUMENT EDITOR</div>
            </div>
            <button onClick={toggleTheme} className="theme-toggle-btn">
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
        </div>
    );
}

export default Navbar;
