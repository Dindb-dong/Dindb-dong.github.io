// components/Skills.js
import React from 'react';
import '../Skills.css';

const Skills = () => (
  <section className="skills">
    <h2>기술 스택</h2>
    <div className="skill-cards">
      <div className="card">JavaScript</div>
      <div className="card">React</div>
      <div className="card">Python</div>
      {/* 추가 기술 항목들 */}
    </div>
  </section>
);

export default Skills;