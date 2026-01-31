// App.js
import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
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
  // activeFilter: null | { type: 'tag', value } | { type: 'category', value }
  const [activeFilter, setActiveFilter] = useState(null);
  const projectsSectionRef = useRef(null);

  const scrollToProjects = () => {
    projectsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSkillClick = (skillName) => {
    setActiveFilter({ type: 'tag', value: skillName });
    scrollToProjects();
  };

  const handleInterestClick = (categoryName) => {
    setActiveFilter({ type: 'category', value: categoryName });
    scrollToProjects();
  };

  return (
    <>
      <section id="about">
        <Header />
      </section>

      <section id="interests">
        <Interests onInterestClick={handleInterestClick} />
      </section>

      <section id="skills">
        <Skills onSkillClick={handleSkillClick} />
      </section>

      <section id="experience">
        <Experience />
      </section>

      <section id="projects" ref={projectsSectionRef}>
        <Projects
          activeFilter={activeFilter}
          onClearFilter={() => setActiveFilter(null)}
        />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </>
  );
}

function App() {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Router>
        <div className="App">
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<ProjectsGallery />} />
            <Route path="/projects/:id" element={<DetailedProject />} />
          </Routes>
        </div>
      </Router>
    </Tooltip.Provider>
  );
}

export default App;