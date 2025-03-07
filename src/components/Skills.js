// components/Skills.js
import React from 'react';
import '../Skills.css';

const Skills = () => (
  <section className="skills">
    <div className='wrapper'>
      <h2>Tech Skills</h2>
        <ul>
          <li>JavaScript</li>
          <li>React</li>
          <li>Python</li>
          <li>Node.js</li>
          <li>MongoDB</li>
          <li>ML/DL</li>
        {/* 추가 기술 항목들 */}
      </ul>
    </div>
  </section>
);

export default Skills;