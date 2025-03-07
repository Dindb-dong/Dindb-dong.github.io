// components/Header.js
import React from 'react';
import '../Header.css';

const Header = () => (
  <header className="header">
    <div className="wrapper">
      <h1>About Me</h1>
      <div className='profile'>
        <div className='profile-background'>
          <img src="https://i.imgur.com/2aGESqu.png" alt="Profile" className="profile-img" />
        </div>
        <div className='profile-text'>
          <h2>Kim Dong Wook</h2>
          <h3>Yonsei Univ. Applied Statistics</h3>
          <h3>Full-Stack Developr</h3>
        </div>
      </div>
    </div>
  </header>
);

export default Header;