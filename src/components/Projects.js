// components/Projects.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Projects.css";

// 미디어 로더 컴포넌트 - 이미지 또는 비디오 자동 감지
const MediaLoader = ({ projectId, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaType, setMediaType] = useState(null);
  const [mediaSrc, setMediaSrc] = useState(null);

  const extensions = [
    { ext: ".mp4", type: "video" },
    { ext: ".mov", type: "video" },
    { ext: ".png", type: "image" },
    { ext: ".jpg", type: "image" },
  ];

  useEffect(() => {
    const basePath = `${process.env.PUBLIC_URL}/thumbnails/proj_${projectId}_1`;
    const currentExt = extensions[currentIndex];

    if (!currentExt) {
      // 모든 확장자 시도 실패 시 기본 이미지
      setMediaSrc(`${process.env.PUBLIC_URL}/logo512.png`);
      setMediaType("image");
      return;
    }

    const testPath = basePath + currentExt.ext;

    // 이미지/비디오 로드 테스트 - 성공할 때까지 mediaSrc를 설정하지 않음
    if (currentExt.type === "image") {
      const img = new Image();
      img.onload = () => {
        setMediaSrc(testPath);
        setMediaType("image");
      };
      img.onerror = () => {
        setCurrentIndex((prev) => prev + 1);
      };
      img.src = testPath;
    } else {
      // 비디오인 경우
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;

      const handleCanPlay = () => {
        setMediaSrc(testPath);
        setMediaType("video");
      };

      const handleError = () => {
        setCurrentIndex((prev) => prev + 1);
      };

      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("error", handleError);
      video.src = testPath;
      video.load();

      // cleanup
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("error", handleError);
      };
    }
  }, [projectId, currentIndex]);

  if (!mediaSrc) {
    return <div className="preview-thumbnail-loading">로딩 중...</div>;
  }

  if (mediaType === "video") {
    return (
      <video
        src={mediaSrc}
        autoPlay
        loop
        muted
        playsInline
        className="preview-media"
        onError={() => {
          // 비디오 로드 실패 시 다음 확장자 시도
          if (currentIndex < extensions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setMediaSrc(`${process.env.PUBLIC_URL}/logo512.png`);
            setMediaType("image");
          }
        }}
      >
        브라우저가 비디오 태그를 지원하지 않습니다.
      </video>
    );
  }

  return (
    <img
      src={mediaSrc}
      alt={alt}
      className="preview-media"
      onError={() => {
        // 이미지 로드 실패 시 다음 확장자 시도
        if (currentIndex < extensions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setMediaSrc(`${process.env.PUBLIC_URL}/logo512.png`);
        }
      }}
    />
  );
};

const Projects = ({ filter = null, onClearFilter = null }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // projectDetails.json에서 프로젝트 데이터 로드
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch(
          `${process.env.PUBLIC_URL}/projectDetails.json`,
        );
        if (!response.ok) {
          throw new Error("프로젝트 데이터를 불러올 수 없습니다.");
        }
        const projectDetails = await response.json();

        // 객체를 배열로 변환하고 id, tags 포함
        let projectsArray = Object.entries(projectDetails).map(
          ([id, project]) => ({
            id: parseInt(id),
            title: project.title,
            role: project.role,
            tags: Array.isArray(project.tags) ? project.tags : [],
            description: Array.isArray(project.description)
              ? project.description[0] || project.description.join(" ")
              : project.description || "",
          }),
        );

        // filter가 있으면 해당 해시태그(태그)를 가진 프로젝트만 표시
        if (filter && filter.trim() !== "") {
          projectsArray = projectsArray.filter(
            (p) => p.tags && p.tags.includes(filter),
          );
        }

        setProjects(projectsArray);
      } catch (error) {
        console.error("프로젝트 로드 실패:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [filter]);

  if (loading) {
    return (
      <section className="projects">
        <div className="wrapper">
          <h2>프로젝트 경험</h2>
          <p className="projects-intro">로딩 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="projects">
      <div className="wrapper">
        <h2>
          {filter
            ? `${filter} 사용 프로젝트`
            : "프로젝트 경험"}
        </h2>
        <p className="projects-intro">
          {filter
            ? `${filter}를 사용한 프로젝트 목록입니다.`
            : "더 자세한 내용을 보시려면 프로젝트를 클릭하세요."}
        </p>
        {filter && onClearFilter && (
          <button
            type="button"
            className="clear-filter-btn"
            onClick={onClearFilter}
          >
            필터 해제 (전체 보기)
          </button>
        )}
        <div className="project-preview-list">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-preview-card"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="preview-thumbnail">
                <MediaLoader projectId={project.id} alt={project.title} />
              </div>
              <div className="preview-info">
                <h3>{project.title}</h3>
                <p className="preview-role">{project.role}</p>
                <p className="preview-description">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          className="view-all-projects"
          onClick={() => navigate("/projects")}
        >
          모든 프로젝트 보기 →
        </button>
      </div>
    </section>
  );
};

export default Projects;
