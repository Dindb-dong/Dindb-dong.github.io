// components/ProjectsGallery.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../ProjectsGallery.css';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = React.useState(
    `${process.env.PUBLIC_URL}/thumbnails/proj_${project.id}_1.png`
  );
  
  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleImageError = () => {
    if (imageSrc.endsWith('.png')) {
      // PNG가 없으면 JPG 시도
      setImageSrc(`${process.env.PUBLIC_URL}/thumbnails/proj_${project.id}_1.jpg`);
    } else {
      // 둘 다 없으면 기본 이미지
      setImageSrc(`${process.env.PUBLIC_URL}/logo512.png`);
    }
  };

  return (
    <div className="project-card" onClick={handleClick}>
      <div className="project-thumbnail">
        <img 
          src={imageSrc} 
          alt={project.title}
          onError={handleImageError}
        />
      </div>
      <div className="project-info">
        <h3>{project.title}</h3>
        <p className="project-role">{project.role}</p>
        <p className="project-description">{project.description}</p>
      </div>
    </div>
  );
};

const ProjectsGallery = () => {
  // 프로젝트 데이터 - 나중에 별도 파일로 분리하거나 API에서 가져올 수 있음
  const projects = [
    {
      id: 1,
      title: "Mobile App 'UPCY'",
      role: "Full-Stack Developer",
      description: "React Native로 제작한 중고 거래 플랫폼",
      thumbnail: "proj_1_1"
    },
    {
      id: 2,
      title: "LearnUS_pdf_downloader",
      role: "Developer",
      description: "주어진 URL에서 PDF 파일을 다운로드하는 Python 기반 웹사이트",
      thumbnail: "proj_2_1"
    },
    {
      id: 3,
      title: "Emotion Classification & Style Transfer Model",
      role: "ML Engineer",
      description: "CNN을 활용한 감정 분류 및 Neural Style Transfer를 활용한 스타일 전이",
      thumbnail: "proj_3_1"
    }
  ];

  return (
    <div className="projects-gallery">
      <div className="gallery-wrapper">
        <h1>프로젝트 경험</h1>
        <div className="gallery-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsGallery;
