// components/Experience.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../Experience.css";

const Experience = () => {
  const navigate = useNavigate();

  const experiences = [
    {
      id: 1,
      groupName: "(주) 알루스 헬스케어",
      period: "2025.06 - 2025.09",
      position: "Researcher",
      description: [
        "신사업 개발 지원을 위한 다양한 데이터 분석",
        "렘 수면 안전도 검사 앱, 브랜드 게임 개발 (개발 중단)",
        "카페24 기반 쇼핑몰 개발, 쇼핑몰 운영 및 관리",
        "건강기능식품 런칭 관련 OEM 업체 미팅 다수 진행 (해외 포함)",
        "기타 사업 관련 업무, C-level 임원진 업무 수행",
        "물류 관리 자동화 시스템 개발",
      ],
      projects: [
        // 프로젝트 이름 누르면 그 프로젝트 상세 페이지로 이동
        "렘 수면 안전도 앱",
        "powapowa 쇼핑몰",
        "물류 관리 자동화 시스템",
        "브랜드 홍보용 QR 루틴 챌린지 웹앱",
      ],
    },
    {
      id: 2,
      groupName: "연세대학교 인공지능학회 YAI",
      period: "2025.03 ~",
      position: "CV, RL 연구부원 및 대외팀 임원진",
      description: [
        "CV: EfficientFace + AdaIN → 감정 분류 및 weight 생성 후 스타일 필터 적용",
        "CV: CLIP + BLIP2 Query based Text to Image Retrieval → 찾고 싶은 장면 묘사 시 그 장면 범위 찾기",
        "RL: Dueling DDQN based Pokemon Game Agent → 자체 개발 시뮬레이터로 학습시킨 포켓몬 게임 배틀 에이전트",
      ],
      projects: [
        "EfficientFace + AdaIN Neural Style Transfer Project",
        "CLIP + BLIP2 Query based Text to Image Retrieval Project",
        "Yakemon: Dueling DDQN based Pokemon Game Agent Project (Self-Developed)",
      ],
    },
    {
      id: 2,
      groupName: "(주) 노이랩",
      period: "2024.07 ~ 2025.11",
      position: "개발팀 인턴",
      description: [
        "다양한 스타트업 행사 및 부스 운영 경험",
        "두뇌 능력 측정을 위한 지표 체계화",
        "뇌지컬 리포트 자동 생성 스크립트 개발 (Python)",
      ],
      projects: ["노이랩 뇌지컬 리포트 자동 생성 스크립트"],
    },
    {
      id: 4,
      groupName: "연세대학교 중앙컴퓨터동아리 YCC",
      period: "2024.03 ~ 2025.06",
      position: "동아리원",
      description: ["React Native 스터디 팀장", "Unity 스터디 팀장"],
      projects: ["Yakemon: 자체 개발 시뮬레이션 웹 게임"],
    },
    {
      id: 5,
      groupName: "UN Youth 산하 지속가능개발 학회 SDP",
      period: "2024.03 ~ 2025.02",
      position: "14기 테크팀 팀장",
      description: [
        "React Native 기반 중고 의류 거래 플랫폼 개발",
        "테크팀장으로서 마케팅팀, 디자인팀, 리서치팀 등 다양한 팀과 협업",
        "기획자, 디자이너와의 긴밀한 소통 경험",
      ],
      projects: ["UPCY: React Native 기반 중고 의류 거래 플랫폼"],
    },
  ];

  return (
    <section className="experience" id="experience">
      <div className="wrapper">
        <h2>경력</h2>
        <div className="experience-list">
          {experiences.map((exp, expIndex) => {
            // 현재 경력 이전의 모든 경력들의 프로젝트 개수 합산
            const previousProjectsCount = experiences
              .slice(0, expIndex)
              .reduce((sum, prevExp) => sum + (prevExp.projects?.length || 0), 0);
            
            return (
              <div key={exp.id} className="experience-card">
                <div className="experience-header">
                  <h3 className="group-name">{exp.groupName}</h3>
                  <span className="period">{exp.period}</span>
                </div>
                <div className="experience-position">
                  <span className="position-label">직책</span>
                  <span className="position-value">{exp.position}</span>
                </div>
                <div className="experience-content">
                  <div className="experience-content-details">
                    <h4 className="content-title">주요 업무 및 성과</h4>
                    <ul className="experience-details">
                      {exp.description.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="experience-content-details">
                    <h4 className="content-title">진행한 프로젝트</h4>
                    <ul className="experience-details">
                      {exp.projects.map((item, index) => {
                        // 이전 경력들의 프로젝트 개수 + 현재 경력 내 인덱스 + 1
                        const projectId = previousProjectsCount + index + 1;
                        return (
                          <li
                            key={index}
                            onClick={() => navigate(`/projects/${projectId}`)}
                            style={{ color: "#6b9bd1", cursor: "pointer" }}
                          >
                            {item}
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
