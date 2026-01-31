// components/Interests.js
import React from "react";
import { Brain, Cpu, LineChart, Atom } from "lucide-react";
import "../Interests.css";

const interests = [
  { label: "AI", icon: Brain },
  { label: "Computer Science", icon: Cpu },
  { label: "Data Science", icon: LineChart },
  { label: "Quantum information", icon: Atom },
];

const Interests = () => (
  <section className="interests">
    <div className="wrapper">
      <h2 className="section-title">
        <Brain size={26} strokeWidth={2} className="section-title-icon" aria-hidden />
        I'm Interested in...
      </h2>
      <ul className="interests-list">
        {interests.map(({ label, icon: Icon }) => (
          <li key={label} className="interest-item">
            <Icon size={24} strokeWidth={2} className="interest-icon" aria-hidden />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Interests;
