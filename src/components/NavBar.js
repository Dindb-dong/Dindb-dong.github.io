// components/NavBar.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 햄버거 메뉴 열림/닫힘 상태
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (target) => {
    if (location.pathname !== '/') {
      navigate('/');
      // 페이지 이동 후 스크롤을 위해 약간의 지연
      setTimeout(() => {
        handleScroll(target);
      }, 100);
    } else {
      handleScroll(target);
    }
    setIsOpen(false);
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
  };

  const handleProjectsClick = () => {
    navigate('/projects');
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate('/')}>
        My Portfolio
      </div>
      <div className='nav-link'>
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <button onClick={() => handleNavClick('about')}>About</button>
          <button onClick={() => handleNavClick('interests')}>Interests</button>
          <button onClick={() => handleNavClick('skills')}>Skills</button>
          <button onClick={handleProjectsClick}>Projects</button>
          <button onClick={() => handleNavClick('contact')}>Contact</button>
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