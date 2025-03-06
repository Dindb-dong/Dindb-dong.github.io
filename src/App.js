// App.js
import React from 'react';
import Header from './components/Header';
import Interests from './components/Interests';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Interests />
      <Skills />
      <Projects />
      <Contact />
    </div>
  );
}

export default App;