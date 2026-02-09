// components/Interests.js
import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Brain, Cpu, LineChart, Atom, Globe, Smartphone, Gamepad } from "lucide-react";
import "../Interests.css";

const interests = [
  { label: "AI", icon: Brain },
  { label: "Computer Science", icon: Cpu },
  { label: "Data Science", icon: LineChart },
  { label: "Quantum Computing", icon: Atom },
  { label: "Web", icon: Globe },
  { label: "Mobile", icon: Smartphone },
  { label: "Game", icon: Gamepad },
];

const Interests = ({ onInterestClick = null }) => (
  <section className="interests">
    <div className="wrapper">
      <h2 className="section-title">
        <Brain size={26} strokeWidth={2} className="section-title-icon" aria-hidden />
        I'm Interested in...
      </h2>
      <ul className="interests-list">
        {interests.map(({ label, icon: Icon }) => (
          <Tooltip.Root key={label} delayDuration={300}>
            <Tooltip.Trigger asChild>
              <li
                className="interest-item"
                role={onInterestClick ? "button" : undefined}
                tabIndex={onInterestClick ? 0 : undefined}
                onClick={() => onInterestClick?.(label)}
                onKeyDown={(e) => {
                  if (onInterestClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onInterestClick(label);
                  }
                }}
              >
                <Icon size={24} strokeWidth={2} className="interest-icon" aria-hidden />
                <span>{label}</span>
              </li>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="interest-tooltip-content" sideOffset={6}>
                {onInterestClick ? `${label} 관련 프로젝트 보기` : label}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        ))}
      </ul>
    </div>
  </section>
);

export default Interests;
