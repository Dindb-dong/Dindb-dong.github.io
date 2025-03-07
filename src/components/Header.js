// components/Header.js
import React from 'react';
import '../Header.css';
import profilePic from '../assets/졸업사진.png';

const Header = () => (
  <header className="header">
    <div className="wrapper">
      <h1>About Me</h1>
      <div className='profile'>
        <div className='profile-background'>
          <img src={profilePic} alt="Profile" className="profile-img" />
        </div>
        <div className='profile-text'>
          <h2>Kim Dong Wook</h2>
          <h3>Yonsei Univ.</h3>
          <h3>Applied Statistics</h3>
        </div>
      </div>
    </div>
  </header>
);

export default Header;