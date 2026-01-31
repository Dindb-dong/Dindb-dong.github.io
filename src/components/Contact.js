// components/Contact.js
import React from "react";
import { Mail } from "lucide-react";
import "../Contact.css";

// Lucide의 Github 아이콘은 브랜드 아이콘으로 deprecated → Simple Icons 사용 (Skills와 동일)
const GITHUB_ICON =
  "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg";

const Contact = () => (
  <section className="contact">
    <div className="wrapper">
      <h2 className="section-title">
        <Mail size={26} strokeWidth={2} className="section-title-icon" aria-hidden />
        Contact Me
      </h2>
      <div className="contact-links">
        <a href="https://github.com/Dindb-dong" target="_blank" rel="noreferrer" className="contact-link">
          <img src={GITHUB_ICON} alt="" className="contact-link-icon" aria-hidden />
          <span>GitHub</span>
        </a>
        <a href="mailto:dongwook443@yonsei.ac.kr" className="contact-link">
          <Mail size={22} strokeWidth={2} aria-hidden />
          <span>Email</span>
        </a>
      </div>
    </div>
  </section>
);

export default Contact;
