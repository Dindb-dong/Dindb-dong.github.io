// components/DetailedProject.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../DetailedProject.css';

// 이미지 로더 컴포넌트 - 이미지 로딩 실패 시 숨김 처리
const ImageLoader = ({ pngPath, jpgPath, alt }) => {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(pngPath);

  const handleError = () => {
    if (currentSrc === pngPath) {
      // PNG 실패 시 JPG 시도
      setCurrentSrc(jpgPath);
    } else {
      // 둘 다 실패 시 숨김
      setImageError(true);
    }
  };

  if (imageError) {
    return null;
  }

  return (
    <div className="image-wrapper">
      <img 
        src={currentSrc} 
        alt={alt}
        onError={handleError}
      />
    </div>
  );
};

const DetailedProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 프로젝트 상세 데이터 - 나중에 별도 파일로 분리하거나 API에서 가져올 수 있음
  const projectDetails = {
    1: {
      title: "Mobile App 'UPCY'",
      role: "Full-Stack Developer",
      description: [
        "React Native로 제작한 중고 거래 플랫폼입니다.",
        "",
        "클릭하여 더 자세한 내용을 확인하세요."
      ],
      extraDescription: [
        "이 모바일 앱은 의류 리폼 전문가(Reformers)와 사용자(Users)를 연결합니다.",
        "Reformers는 서비스를 업로드할 수 있고, Users는 검색, 좋아요, 주문을 할 수 있습니다.",
        "기획부터 배포까지 전체 개발 과정을 담당했습니다."
      ],
      images: [] // proj_1_1, proj_1_2, ... 형식으로 로드
    },
    2: {
      title: "LearnUS_pdf_downloader",
      role: "Developer",
      description: [
        "주어진 URL에서 PDF 파일을 다운로드하는 Python 기반 웹사이트입니다.",
        "",
        "클릭하여 더 자세한 내용을 확인하세요."
      ],
      extraDescription: [
        "LearnUS 사이트는 때때로 PDF 파일에 대한 다운로드 버튼을 제공하지 않아 이 웹사이트를 제작했습니다.",
        "먼저, Selenium이 chromeDriver를 사용하여 URL을 열고 페이지 하단까지 스크롤합니다.",
        "두 번째로, 페이지에 분리된 PNG 파일을 찾아 다운로드합니다.",
        "세 번째로, PNG 파일을 PDF 파일로 변환하여 다운로드합니다."
      ],
      images: []
    },
    3: {
      title: "Emotion Classification & Style Transfer Model",
      role: "ML Engineer",
      description: [
        "CNN을 활용한 감정 분류 및 Neural Style Transfer를 활용한 스타일 전이입니다.",
        "",
        "클릭하여 더 자세한 내용을 확인하세요."
      ],
      extraDescription: [
        "감정 분류: EfficientFace CNN 모델을 파인튜닝하여 주어진 이미지의 감정을 분류했습니다.",
        "스타일 전이: AdaIN Neural Style Transfer 모델을 파인튜닝하여 주어진 이미지의 스타일을 영화 '인사이드 아웃' 스타일 이미지로 전이했습니다."
      ],
      images: []
    }
  };

  const project = projectDetails[id];

  if (!project) {
    return (
      <div className="detailed-project">
        <div className="project-wrapper">
          <h1>프로젝트를 찾을 수 없습니다</h1>
          <button onClick={() => navigate('/projects')}>프로젝트 목록으로 돌아가기</button>
        </div>
      </div>
    );
  }

  // 이미지 로드 함수 - proj_{id}_1, proj_{id}_2, ... 형식으로 시도
  // 실제로는 프로젝트별로 이미지 개수가 다를 수 있으므로,
  // 여기서는 최대 5개까지 시도하도록 설정 (필요시 조정 가능)
  const getImagePaths = (imageIndex) => {
    return {
      png: `${process.env.PUBLIC_URL}/thumbnails/proj_${id}_${imageIndex}.png`,
      jpg: `${process.env.PUBLIC_URL}/thumbnails/proj_${id}_${imageIndex}.jpg`,
      index: imageIndex
    };
  };

  // 프로젝트별 이미지 개수 설정 (필요시 수정)
  const imageCounts = {
    1: 2, // UPCY 프로젝트는 2개 이미지
    2: 1, // LearnUS 프로젝트는 1개 이미지
    3: 2  // Emotion Classification 프로젝트는 2개 이미지
  };

  const maxImages = imageCounts[id] || 5;
  const projectImages = Array.from({ length: maxImages }, (_, i) => getImagePaths(i + 1));

  return (
    <div className="detailed-project">
      <div className="project-wrapper">
        <button className="back-button" onClick={() => navigate('/projects')}>
          ← 프로젝트 목록으로
        </button>
        
        <div className="project-header">
          <h1>{project.title}</h1>
          <p className="project-role">{project.role}</p>
        </div>

        <div className="project-content">
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

          {projectImages.length > 0 && (
            <div className="project-images-section">
              <h2>프로젝트 이미지</h2>
              <div className="images-grid">
                {projectImages.map((img, idx) => (
                  <ImageLoader 
                    key={idx} 
                    pngPath={img.png}
                    jpgPath={img.jpg}
                    alt={`${project.title} ${img.index}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedProject;
