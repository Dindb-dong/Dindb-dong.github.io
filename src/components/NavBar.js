// components/NavBar.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    if (langMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [langMenuOpen]);

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
        <Sparkles size={22} strokeWidth={2} className="nav-logo-icon" aria-hidden />
        <span>My Portfolio</span>
      </div>
      <div className='nav-link'>
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <button onClick={() => handleNavClick('about')}>About</button>
          <button onClick={() => handleNavClick('interests')}>Interests</button>
          <button onClick={() => handleNavClick('skills')}>Skills</button>
          <button onClick={() => handleNavClick('experience')}>Experience</button>
          <button onClick={handleProjectsClick}>Projects</button>
          <button onClick={() => handleNavClick('contact')}>Contact</button>
          <div className="nav-lang-wrapper" ref={langMenuRef}>
            <button
              type="button"
              className="nav-lang-trigger"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-haspopup="listbox"
              aria-expanded={langMenuOpen}
              aria-label="Language Settings"
            >
              <Globe size={18} strokeWidth={2} aria-hidden />
              <span>{language === 'ko' ? '한국어' : 'English'}</span>
            </button>
            {langMenuOpen && (
              <div className="nav-lang-dropdown" role="listbox">
                <button
                  role="option"
                  aria-selected={language === 'ko'}
                  className={language === 'ko' ? 'active' : ''}
                  onClick={() => {
                    setLanguage('ko');
                    setLangMenuOpen(false);
                    setIsOpen(false);
                  }}
                >
                  한국어
                </button>
                <button
                  role="option"
                  aria-selected={language === 'en'}
                  className={language === 'en' ? 'active' : ''}
                  onClick={() => {
                    setLanguage('en');
                    setLangMenuOpen(false);
                    setIsOpen(false);
                  }}
                >
                  English
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 햄버거 아이콘 (모바일) */}
      <button type="button" className="hamburger" onClick={toggleMenu} aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}>
        {isOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
      </button>
    </nav>
  );
};

export default NavBar;