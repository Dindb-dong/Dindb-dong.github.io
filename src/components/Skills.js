// components/Skills.js
import React from "react";
import "../Skills.css";

const Skills = ({ onSkillClick = null }) => {
  // 기술 스택과 로고 URL 매핑 (Simple Icons CDN 사용)
  const languages = [
    {
      name: "JavaScript",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/javascript.svg",
    },
    {
      name: "TypeScript",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/typescript.svg",
    },
    {
      name: "Python",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/python.svg",
    },
    {
      name: "R",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/r.svg",
    },
    {
      name: "C++",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/cplusplus.svg",
    },
    {
      name: "C#",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/csharp.svg",
    },
    {
      name: "Java",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/java.svg",
    },
  ];

  const techStacks = [
    {
      name: "React",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/react.svg",
    },
    {
      name: "React Native",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/react.svg",
    },
    {
      name: "Flutter",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/flutter.svg",
    },
    {
      name: "Node.js",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nodedotjs.svg",
    },
    {
      name: "Docker",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/docker.svg",
    },
    {
      name: "Kubernetes",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/kubernetes.svg",
    },
    {
      name: "AWS",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazonaws.svg",
    },
    {
      name: "MongoDB",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mongodb.svg",
    },
    {
      name: "Supabase",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/supabase.svg",
    },
  ];

  return (
    <section className="skills">
      <div className="wrapper">
        <h2>Usable Languages</h2>
        <ul className="skills-list">
          {languages.map((lang, index) => (
            <li
              key={index}
              className="skill-item"
              role={onSkillClick ? "button" : undefined}
              tabIndex={onSkillClick ? 0 : undefined}
              onClick={() => onSkillClick?.(lang.name)}
              onKeyDown={(e) => {
                if (onSkillClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSkillClick(lang.name);
                }
              }}
            >
              <img src={lang.logo} alt={lang.name} className="skill-logo" />
              <span>{lang.name}</span>
            </li>
          ))}
        </ul>
        <h2>Tech Stacks</h2>
        <ul className="skills-list">
          {techStacks.map((tech, index) => (
            <li
              key={index}
              className="skill-item"
              role={onSkillClick ? "button" : undefined}
              tabIndex={onSkillClick ? 0 : undefined}
              onClick={() => onSkillClick?.(tech.name)}
              onKeyDown={(e) => {
                if (onSkillClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSkillClick(tech.name);
                }
              }}
            >
              <img src={tech.logo} alt={tech.name} className="skill-logo" />
              <span>{tech.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Skills;
