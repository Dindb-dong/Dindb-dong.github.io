// components/DetailedProject.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Brain,
  Cpu,
  LineChart,
  Globe,
  Smartphone,
  Gamepad2,
  Tag,
  Atom,
} from "lucide-react";
import { LANGUAGES, TECH_STACKS } from "./Skills";
import "../DetailedProject.css";

// 카테고리명 → Lucide 아이콘 (Interests와 동일한 의미 매핑)
const CATEGORY_ICONS = {
  AI: Brain,
  "Computer Science": Cpu,
  "Data Science": LineChart,
  "Quantum Computing": Atom,
  Web: Globe,
  Mobile: Smartphone,
  Game: Gamepad2,
}; 
const DEFAULT_CATEGORY_ICON = Tag;

// 미디어 로더 컴포넌트 - 이미지 또는 비디오 자동 감지
const MediaLoader = ({ projectId, mediaIndex, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaType, setMediaType] = useState(null);
  const [mediaSrc, setMediaSrc] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const extensions = [
    { ext: ".mp4", type: "video" },
    { ext: ".mov", type: "video" },
    { ext: ".png", type: "image" },
    { ext: ".jpg", type: "image" },
  ];

  useEffect(() => {
    const basePath = `${process.env.PUBLIC_URL}/thumbnails/proj_${projectId}_${mediaIndex}`;
    const currentExt = extensions[currentIndex];

    if (!currentExt) {
      // 모든 확장자 시도 실패 시 숨김
      setLoadError(true);
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
  }, [projectId, mediaIndex, currentIndex]);

  if (loadError) {
    return null;
  }

  if (!mediaSrc) {
    return null;
  }

  if (mediaType === "video") {
    return (
      <div className="image-wrapper">
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
              setLoadError(true);
            }
          }}
        >
          브라우저가 비디오 태그를 지원하지 않습니다.
        </video>
      </div>
    );
  }

  return (
    <div className="image-wrapper">
      <img
        src={mediaSrc}
        alt={alt}
        onError={() => {
          // 이미지 로드 실패 시 다음 확장자 시도
          if (currentIndex < extensions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setLoadError(true);
          }
        }}
      />
    </div>
  );
};

const DetailedProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 자동으로 proj_{id}_로 시작하는 모든 미디어 파일 찾기
  // 모든 hooks는 early return 전에 선언해야 함
  const [foundMediaIndices, setFoundMediaIndices] = useState([]);
  const [isScanning, setIsScanning] = useState(true);
  const [maxIndexToCheck, setMaxIndexToCheck] = useState(10); // 최대 10개까지 체크

  // JSON 파일에서 프로젝트 데이터 로드
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.PUBLIC_URL}/projectDetails.json`,
        );
        if (!response.ok) {
          throw new Error("프로젝트 데이터를 불러올 수 없습니다.");
        }
        const projectDetails = await response.json();
        const projectData = projectDetails[id];

        if (!projectData) {
          setError("프로젝트를 찾을 수 없습니다.");
        } else {
          setProject(projectData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [id]);

  // 자동으로 proj_{id}_로 시작하는 모든 미디어 파일 찾기
  useEffect(() => {
    if (!project) return;

    // 1부터 maxIndexToCheck까지 순차적으로 체크
    const checkMediaFiles = async () => {
      const found = [];
      let consecutiveFailures = 0;
      const maxConsecutiveFailures = 3; // 연속 3개 실패하면 중단

      for (let i = 1; i <= maxIndexToCheck; i++) {
        const basePath = `${process.env.PUBLIC_URL}/thumbnails/proj_${id}_${i}`;
        const extensions = [".mp4", ".mov", ".png", ".jpg"];
        let foundFile = false;

        // 각 확장자 순차적으로 체크
        for (const ext of extensions) {
          const testPath = basePath + ext;
          const fileExists = await new Promise((resolve) => {
            if (ext === ".mp4") {
              const video = document.createElement("video");
              video.preload = "none";
              video.muted = true;
              const timeout = setTimeout(() => {
                video.removeEventListener("canplay", onCanPlay);
                video.removeEventListener("error", onError);
                resolve(false);
              }, 2000); // 2초 타임아웃

              const onCanPlay = () => {
                clearTimeout(timeout);
                video.removeEventListener("canplay", onCanPlay);
                video.removeEventListener("error", onError);
                resolve(true);
              };

              const onError = () => {
                clearTimeout(timeout);
                video.removeEventListener("canplay", onCanPlay);
                video.removeEventListener("error", onError);
                resolve(false);
              };

              video.addEventListener("canplay", onCanPlay);
              video.addEventListener("error", onError);
              video.src = testPath;
              video.load();
            } else {
              const img = new Image();
              const timeout = setTimeout(() => {
                img.onload = null;
                img.onerror = null;
                resolve(false);
              }, 2000);

              img.onload = () => {
                clearTimeout(timeout);
                resolve(true);
              };
              img.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
              };
              img.src = testPath;
            }
          });

          if (fileExists) {
            found.push(i);
            foundFile = true;
            consecutiveFailures = 0;
            break; // 하나 찾으면 다음 인덱스로
          }
        }

        if (!foundFile) {
          consecutiveFailures++;
          if (consecutiveFailures >= maxConsecutiveFailures) {
            break; // 연속 실패하면 중단
          }
        }
      }

      setFoundMediaIndices(found);
      setIsScanning(false);
    };

    checkMediaFiles();
  }, [id, project, maxIndexToCheck]);

  // 로딩 중
  if (loading) {
    return (
      <div className="detailed-project">
        <div className="project-wrapper">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 또는 프로젝트 없음
  if (error || !project) {
    return (
      <div className="detailed-project">
        <div className="project-wrapper">
          <h1>{error || "프로젝트를 찾을 수 없습니다"}</h1>
          <button className="back-button" onClick={() => navigate("/projects")}>
            <ArrowLeft size={20} strokeWidth={2} aria-hidden />
            <span>프로젝트 목록으로 돌아가기</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detailed-project">
      <div className="project-wrapper">
        <button className="back-button" onClick={() => navigate("/projects")}>
          <ArrowLeft size={20} strokeWidth={2} aria-hidden />
          <span>프로젝트 목록으로</span>
        </button>

        <div className="project-header">
          <h1>{project.title}</h1>
          <p className="project-role">{project.role}</p>
          {project.languages && project.languages.length > 0 && (
            <div className="project-meta-section">
              <span className="project-meta-label">사용 언어</span>
              <ul className="project-tag-list">
                {project.languages.map((name) => (
                  <li key={name} className="project-tag-pill">
                    <img
                      src={LANGUAGES.find((l) => l.name === name)?.logo}
                      alt={name}
                      className="project-pill-logo"
                    />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.techStacks && project.techStacks.length > 0 && (
            <div className="project-meta-section">
              <span className="project-meta-label">기술 스택</span>
              <ul className="project-tag-list">
                {project.techStacks.map((name) => (
                  <li key={name} className="project-tech-pill">
                    <img
                      src={TECH_STACKS.find((t) => t.name === name)?.logo}
                      alt={name}
                      className="project-pill-logo"
                    />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.categories && project.categories.length > 0 && (
            <div className="project-meta-section">
              <span className="project-meta-label">카테고리</span>
              <ul className="project-category-list">
                {project.categories.map((cat) => {
                  const IconComponent = CATEGORY_ICONS[cat] ?? DEFAULT_CATEGORY_ICON;
                  return (
                    <li key={cat} className="project-category-pill">
                      <IconComponent size={20} strokeWidth={2} className="project-category-icon" aria-hidden />
                      <span>{cat}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="project-content">
          <div className="project-description-section">
            {project.links && project.links.length > 0 && (
              <>
                <h2>프로젝트 링크</h2>
                <div className="project-links">
                  {project.links.map((item, index) => (
                    <a
                      key={index}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="project-link-item"
                    >
                      <ExternalLink size={16} strokeWidth={2} aria-hidden />
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="project-description-section">
            <h2>프로젝트 소개</h2>
            {project.description.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </div>

          {project.extraDescription && project.extraDescription.length > 0 && (
            <div className="project-details-section">
              <h2>상세 내용</h2>
              <ul>
                {project.extraDescription.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {isScanning ? (
            <div className="project-images-section">
              <h2>프로젝트 미디어</h2>
              <p>미디어 파일을 찾는 중...</p>
            </div>
          ) : foundMediaIndices.length > 0 ? (
            <div className="project-images-section">
              <h2>프로젝트 미디어</h2>
              <div className="images-grid">
                {foundMediaIndices.map((mediaIndex) => (
                  <MediaLoader
                    key={mediaIndex}
                    projectId={id}
                    mediaIndex={mediaIndex}
                    alt={`${project.title} ${mediaIndex}`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DetailedProject;
