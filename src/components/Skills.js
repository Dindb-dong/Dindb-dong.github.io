// components/Skills.js
import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Layers, Wrench } from "lucide-react";
import "../Skills.css";

export const LANGUAGES = [
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
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/openjdk.svg",
  },
  {
    name: "Dart",
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/dart.svg",
  },
];

export const TECH_STACKS = [
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
  {
    name: "PyTorch",
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/pytorch.svg",
  },
  {
    name: "TensorFlow",
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/tensorflow.svg",
  },
  {
    name: "Qiskit",
    logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/qiskit.svg",
  },
];

const Skills = ({ onSkillClick = null }) => {
  // TECH_STACKS가 LANGUAGES보다 많을 때, 모바일에서 같은 행 수를 갖도록 열 개수 계산
  const techColumns =
    TECH_STACKS.length > LANGUAGES.length
      ? Math.ceil(TECH_STACKS.length / LANGUAGES.length)
      : 1;

  const SkillItem = ({ item, type }) => (
    <Tooltip.Root delayDuration={300}>
      <Tooltip.Trigger asChild>
        <li
          className="skill-item"
          role={onSkillClick ? "button" : undefined}
          tabIndex={onSkillClick ? 0 : undefined}
          onClick={() => onSkillClick?.(item.name)}
          onKeyDown={(e) => {
            if (onSkillClick && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onSkillClick(item.name);
            }
          }}
        >
          <img src={item.logo} alt={item.name} className="skill-logo" />
          <span>{item.name}</span>
        </li>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="skill-tooltip-content" sideOffset={6}>
          {onSkillClick ? `${item.name} 사용 프로젝트 보기` : item.name}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );

  return (
    <section className="skills">
      <div className="wrapper">
        <h3 className="skills-subtitle">
          Click to see projects using the skills!
        </h3>
        <div className="skills-section-container">
          <div className="skills-section">
            <h2 className="section-title">
              <Layers
                size={26}
                strokeWidth={2}
                className="section-title-icon"
                aria-hidden
              />
              Languages
            </h2>
            <ul className="skills-list">
              {LANGUAGES.map((lang, index) => (
                <SkillItem key={index} item={lang} type="lang" />
              ))}
            </ul>
          </div>
          <div className="skills-section">
            <h2 className="section-title">
              <Wrench
                size={26}
                strokeWidth={2}
                className="section-title-icon"
                aria-hidden
              />
              Tech Stacks
            </h2>
            <ul
              className="skills-list skills-list--tech"
              style={{ "--tech-cols": techColumns }}
            >
              {TECH_STACKS.map((tech, index) => (
                <SkillItem key={index} item={tech} type="tech" />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
