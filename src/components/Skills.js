// components/Skills.js
import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Layers, Wrench } from "lucide-react";
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
        <h2 className="section-title">
          <Layers size={26} strokeWidth={2} className="section-title-icon" aria-hidden />
          Usable Languages
        </h2>
        <ul className="skills-list">
          {languages.map((lang, index) => (
            <SkillItem key={index} item={lang} type="lang" />
          ))}
        </ul>
        <h2 className="section-title">
          <Wrench size={26} strokeWidth={2} className="section-title-icon" aria-hidden />
          Tech Stacks
        </h2>
        <ul className="skills-list">
          {techStacks.map((tech, index) => (
            <SkillItem key={index} item={tech} type="tech" />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Skills;
