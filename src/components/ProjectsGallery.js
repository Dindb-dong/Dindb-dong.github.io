// components/ProjectsGallery.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Filter, FilterX, Loader2 } from "lucide-react";
import "../ProjectsGallery.css";

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
        // 이미지 로드 성공
        setMediaSrc(testPath);
        setMediaType("image");
      };
      img.onerror = () => {
        // 이미지 로드 실패, 다음 확장자 시도
        setCurrentIndex((prev) => prev + 1);
      };
      img.src = testPath;
    } else {
      // 비디오인 경우
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;

      const handleCanPlay = () => {
        // 비디오 로드 성공
        setMediaSrc(testPath);
        setMediaType("video");
      };

      const handleError = () => {
        // 비디오 로드 실패, 다음 확장자 시도
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
    return <div className="project-thumbnail-loading">로딩 중...</div>;
  }

  if (mediaType === "video") {
    return (
      <video
        src={mediaSrc}
        autoPlay
        loop
        muted
        playsInline
        className="project-media"
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
      className="project-media"
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

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="project-card" onClick={handleClick}>
      <div className="project-thumbnail">
        <MediaLoader projectId={project.id} alt={project.title} />
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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterValue, setFilterValue] = useState("");

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

        // 객체를 배열로 변환하고 id 추가, description 처리
        const projectsArray = Object.entries(projectDetails).map(
          ([id, project]) => ({
            id: parseInt(id, 10),
            title: project.title,
            role: project.role,
            languages: Array.isArray(project.languages)
              ? project.languages
              : [],
            techStacks: Array.isArray(project.techStacks)
              ? project.techStacks
              : [],
            categories: Array.isArray(project.categories)
              ? project.categories
              : [],
            description: Array.isArray(project.description)
              ? project.description[0] || project.description.join(" ")
              : project.description || "",
          }),
        );

        setAllProjects(projectsArray);
        setProjects(projectsArray);
      } catch (error) {
        console.error("프로젝트 로드 실패:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const uniqueValues = (key) => {
    const values = new Set();
    allProjects.forEach((p) => {
      if (key === "role" && p.role) {
        values.add(p.role);
      } else if (key === "languages" && Array.isArray(p.languages)) {
        p.languages.forEach((v) => values.add(v));
      } else if (key === "techStacks" && Array.isArray(p.techStacks)) {
        p.techStacks.forEach((v) => values.add(v));
      } else if (key === "categories" && Array.isArray(p.categories)) {
        p.categories.forEach((v) => values.add(v));
      }
    });
    return Array.from(values).sort();
  };

  const handleFilterTypeChange = (e) => {
    const newType = e.target.value;
    setFilterType(newType);
    setFilterValue("");

    if (newType === "all") {
      setProjects(allProjects);
      return;
    }
  };

  const handleFilterValueChange = (e) => {
    const value = e.target.value;
    setFilterValue(value);

    if (!value) {
      setProjects(allProjects);
      return;
    }

    let filtered = allProjects;
    if (filterType === "role") {
      filtered = allProjects.filter((p) => p.role === value);
    } else if (filterType === "languages") {
      filtered = allProjects.filter(
        (p) => Array.isArray(p.languages) && p.languages.includes(value),
      );
    } else if (filterType === "techStacks") {
      filtered = allProjects.filter(
        (p) => Array.isArray(p.techStacks) && p.techStacks.includes(value),
      );
    } else if (filterType === "categories") {
      filtered = allProjects.filter(
        (p) => Array.isArray(p.categories) && p.categories.includes(value),
      );
    }

    setProjects(filtered);
  };

  const handleClearFilter = () => {
    setFilterType("all");
    setFilterValue("");
    setProjects(allProjects);
  };

  if (loading) {
    return (
      <div className="projects-gallery">
        <div className="gallery-wrapper">
          <h1 className="gallery-title">
            <FolderKanban size={32} strokeWidth={2} className="gallery-title-icon" aria-hidden />
            프로젝트 경험
          </h1>
          <p className="gallery-loading">
            <Loader2 size={22} className="spin" aria-hidden />
            로딩 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-gallery">
      <div className="gallery-wrapper">
        <h1 className="gallery-title">
          <FolderKanban size={32} strokeWidth={2} className="gallery-title-icon" aria-hidden />
          프로젝트 경험
        </h1>
        <div className="gallery-filters">
          <div className="gallery-filter-row">
            <div className="filter-type-select">
              <label htmlFor="filter-type">
                <Filter size={16} strokeWidth={2} aria-hidden />
                <span>필터 유형</span>
              </label>
              <select
                id="filter-type"
                value={filterType}
                onChange={handleFilterTypeChange}
              >
                <option value="all">전체</option>
                <option value="languages">사용 언어</option>
                <option value="techStacks">기술 스택</option>
                <option value="categories">카테고리</option>
                <option value="role">포지션</option>
              </select>
            </div>
            {filterType !== "all" && (
              <div className="filter-value-select">
                <label htmlFor="filter-value">
                  <span>값 선택</span>
                </label>
                <select
                  id="filter-value"
                  value={filterValue}
                  onChange={handleFilterValueChange}
                >
                  <option value="">전체</option>
                  {filterType === "languages" &&
                    uniqueValues("languages").map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  {filterType === "techStacks" &&
                    uniqueValues("techStacks").map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  {filterType === "categories" &&
                    uniqueValues("categories").map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  {filterType === "role" &&
                    uniqueValues("role").map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                </select>
              </div>
            )}
            {(filterType !== "all" || filterValue) && (
              <button
                type="button"
                className="gallery-clear-filter-btn"
                onClick={handleClearFilter}
              >
                <FilterX size={16} strokeWidth={2} aria-hidden />
                <span>필터 초기화</span>
              </button>
            )}
          </div>
        </div>
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
