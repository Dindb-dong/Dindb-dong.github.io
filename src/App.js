// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Header from './components/Header';
import Interests from './components/Interests';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import ProjectsGallery from './components/ProjectsGallery';
import DetailedProject from './components/DetailedProject';
import './App.css';

function Home() {
  return (
    <>
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

      <section id="experience">
        <Experience />
      </section>

      <section id="projects">
        <Projects />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        {/* 네비게이션 바 */}
        <NavBar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectsGallery />} />
          <Route path="/projects/:id" element={<DetailedProject />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;