// components/Experience.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Calendar, ExternalLink } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import "../Experience.css";

const Experience = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      const baseName = language === "en" ? "eng_experiences" : "experiences";
      try {
        const res = await fetch(`/${baseName}.json`);
        if (!res.ok) {
          // eng_ 파일이 없으면 기본(한국어) 파일로 fallback
          const fallbackRes = await fetch("/experiences.json");
          const data = await fallbackRes.json();
          setExperiences(data);
        } else {
          const data = await res.json();
          setExperiences(data);
        }
      } catch {
        const fallbackRes = await fetch("/experiences.json");
        const data = await fallbackRes.json();
        setExperiences(data);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, [language]);

  if (loading) {
    return (
      <section className="experience" id="experience">
        <div className="wrapper">
          <p className="experience-loading">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="experience" id="experience">
      <div className="wrapper">
        <h2 className="section-title">
          <Briefcase
            size={26}
            strokeWidth={2}
            className="section-title-icon"
            aria-hidden
          />
          Experience
        </h2>
        <div className="experience-list">
          {experiences.map((exp, expIndex) => {
            const previousProjectsCount = experiences
              .slice(0, expIndex)
              .reduce(
                (sum, prevExp) => sum + (prevExp.projects?.length || 0),
                0,
              );

            return (
              <div key={`${exp.id}-${expIndex}`} className="experience-card">
                <div className="experience-header">
                  <h3 className="group-name">{exp.groupName}</h3>
                </div>
                <div className="experience-position">
                  <div className="experience-position-details">
                    <span className="position-label">Position</span>
                    <span className="position-value">{exp.position}</span>
                  </div>
                  <span className="period">
                    <Calendar
                      size={16}
                      strokeWidth={2}
                      className="period-icon"
                      aria-hidden
                    />
                    {exp.period}
                  </span>
                </div>
                <div className="experience-content">
                  <div className="experience-content-details">
                    <h4 className="content-title">
                      Main Tasks and Achievements
                    </h4>
                    <ul className="experience-details">
                      {exp.description.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="experience-content-details experience-projects-block">
                    <h4 className="content-title projects-title">Projects</h4>
                    <ul className="experience-details experience-projects">
                      {exp.projects.map((item, index) => {
                        const projectId = previousProjectsCount + index + 1;
                        return (
                          <li
                            key={index}
                            className="experience-project-link"
                            onClick={() => navigate(`/projects/${projectId}`)}
                          >
                            <ExternalLink
                              size={14}
                              strokeWidth={2}
                              aria-hidden
                            />
                            <span>{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experience;
