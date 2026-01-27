// components/Projects.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Projects.css';

const Projects = () => {
  const navigate = useNavigate();

  const [imageSrcs, setImageSrcs] = useState({});

  const projects = [
    {
      id: 1,
      title: "Mobile App 'UPCY'",
      role: "Full-Stack Developer",
      description: "React Native로 제작한 중고 거래 플랫폼"
    },
    {
      id: 2,
      title: "LearnUS_pdf_downloader",
      role: "Developer",
      description: "주어진 URL에서 PDF 파일을 다운로드하는 Python 기반 웹사이트"
    },
    {
      id: 3,
      title: "Emotion Classification & Style Transfer Model",
      role: "ML Engineer",
      description: "CNN을 활용한 감정 분류 및 Neural Style Transfer를 활용한 스타일 전이"
    }
  ];

  const handleImageError = (projectId) => {
    const currentSrc = imageSrcs[projectId] || `${process.env.PUBLIC_URL}/thumbnails/proj_${projectId}_1.png`;
    if (currentSrc.endsWith('.png')) {
      setImageSrcs(prev => ({
        ...prev,
        [projectId]: `${process.env.PUBLIC_URL}/thumbnails/proj_${projectId}_1.jpg`
      }));
    } else {
      setImageSrcs(prev => ({
        ...prev,
        [projectId]: `${process.env.PUBLIC_URL}/logo512.png`
      }));
    }
  };

  return (
    <section className="projects">
      <div className="wrapper">
        <h2>프로젝트 경험</h2>
        <p className="projects-intro">더 자세한 내용을 보시려면 프로젝트를 클릭하세요.</p>
        <div className="project-preview-list">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="project-preview-card"
              onClick={() => navigate('/projects')}
            >
              <div className="preview-thumbnail">
                <img 
                  src={imageSrcs[project.id] || `${process.env.PUBLIC_URL}/thumbnails/proj_${project.id}_1.png`} 
                  alt={project.title}
                  onError={() => handleImageError(project.id)}
                />
              </div>
              <div className="preview-info">
                <h3>{project.title}</h3>
                <p className="preview-role">{project.role}</p>
                <p className="preview-description">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="view-all-projects" onClick={() => navigate('/projects')}>
          모든 프로젝트 보기 →
        </button>
      </div>
    </section>
  );
};

export default Projects;