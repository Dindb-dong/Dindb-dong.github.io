// components/Header.js
import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import "../Header.css";

const Header = () => {
  const { language } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntroduce = async () => {
      setLoading(true);
      const baseName = language === "en" ? "eng_introduce" : "introduce";
      try {
        const res = await fetch(`/${baseName}.json`);
        if (!res.ok) {
          const fallbackRes = await fetch("/introduce.json");
          const json = await fallbackRes.json();
          setData(json);
        } else {
          const json = await res.json();
          setData(json);
        }
      } catch {
        const fallbackRes = await fetch("/introduce.json");
        const json = await fallbackRes.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    };
    fetchIntroduce();
  }, [language]);

  if (loading || !data) {
    return (
      <header className="header">
        <div className="wrapper header-wrapper">
          <p className="header-loading">Loading...</p>
        </div>
      </header>
    );
  }

  const { sectionTitle, profile, details } = data;

  return (
    <header className="header">
      <div className="wrapper header-wrapper">
        <h1 className="section-title">
          <User size={28} strokeWidth={2} className="section-title-icon" aria-hidden />
          {sectionTitle}
        </h1>
        <div className="header-main-row">
          <div className="profile">
            <div className="profile-background">
              <img
                src={profile.imageUrl}
                alt="Profile"
                className="profile-img"
              />
            </div>
            <div className="profile-text">
              <h2>{profile.nameEn}</h2>
              <h2>{profile.nameKo}</h2>
              <h3>{profile.subtitle}</h3>
              <h3>{profile.role}</h3>
              <p className="about-me-intro-inline">
                {profile.intro.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < profile.intro.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        </div>
        <div className="about-me-content about-me-content-bottom">
          {details.map((paragraph, index) => (
            <p
              key={index}
              className="about-me-detail"
              dangerouslySetInnerHTML={{ __html: paragraph }}
            />
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
