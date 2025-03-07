// components/NavBar.js
import React, { useState } from 'react';
import '../NavBar.css';

const NavBar = () => {
  // 햄버거 메뉴 열림/닫힘 상태
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // 네비게이션 바 높이: 화면 높이의 1/16
      const navBarHeight = window.innerHeight / 16;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navBarHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    // 모바일에서는 메뉴 닫기
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        My Portfolio
      </div>
      <div className='nav-link'>
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <button onClick={() => handleScroll('about')}>About</button>
          <button onClick={() => handleScroll('interests')}>Interests</button>
          <button onClick={() => handleScroll('skills')}>Skills</button>
          <button onClick={() => handleScroll('projects')}>Projects</button>
          <button onClick={() => handleScroll('contact')}>Contact</button>
        </div>
      </div>
      
      {/* 햄버거 아이콘 (모바일) */}
      <div className="hamburger" onClick={toggleMenu}>
        {/* 단순 예시로, 3개의 선을 이용해 햄버거 아이콘 구현 */}
        <div className="line" />
        <div className="line" />
        <div className="line" />
      </div>
    </nav>
  );
};

export default NavBar;