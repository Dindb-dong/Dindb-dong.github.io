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
          <h3>연세대학교 응용통계학과</h3>
          <h3>Full-Stack Developer</h3>
        </div>
      </div>
      <div className="about-me-content">
        <p className="about-me-intro">
          안녕하세요! 저는 풀스택 개발자로, 데이터 사이언스와 소프트웨어 개발에 열정을 가지고 있습니다.
        </p>
        <p className="about-me-detail">
          연세대학교 응용통계학과에서 통계학과 데이터 분석의 기초를 다졌으며, 
          현재는 웹 개발과 모바일 앱 개발에 집중하고 있습니다. 
          React, React Native, Node.js 등을 활용하여 사용자 중심의 서비스를 만드는 것을 좋아합니다.
        </p>
        <p className="about-me-detail">
          AI와 머신러닝에도 관심이 많아, 감정 분류 모델과 스타일 전이 모델 등의 프로젝트를 진행한 경험이 있습니다. 
          항상 새로운 기술을 배우고 적용하는 것을 즐기며, 
          사용자에게 가치를 제공할 수 있는 서비스를 만드는 것이 목표입니다.
        </p>
      </div>
    </div>
  </header>
);

export default Header;