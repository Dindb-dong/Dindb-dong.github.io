// components/Header.js
import React from 'react';
import '../Header.css';

const Header = () => (
  <header className="header">
    <h1>세상을 이롭게하는 개발자</h1>
    <div className='profile'>
      <img src="your-image-url.jpg" alt="Profile" className="profile-img" />
      <div className='profile-text'>
        <h2>김동욱</h2>
        <h3>연세대학교 재학</h3>
        <h3>응용통계학과</h3>
      </div>
    </div>
    
  </header>
);

export default Header;