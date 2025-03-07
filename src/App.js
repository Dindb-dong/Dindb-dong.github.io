// App.js
import React from 'react';
import NavBar from './components/NavBar';
import Header from './components/Header';
import Interests from './components/Interests';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* 네비게이션 바 */}
      <NavBar />

      {/* 각 섹션에 id 부여 */}
      <section id="about">
        <Header />
      </section>

      <section id="interests">
        <Interests />
      </section>

      <section id="skills">
        <Skills />
      </section>

      <section id="projects">
        <Projects />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </div>
  );
}

export default App;