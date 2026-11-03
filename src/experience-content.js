const pair = (ko, en) => ({ ko, en });
const shot = (file, projectId, caption, kind) => ({
  src: `/legacy/public/thumbnails/${file}`, projectId, caption, kind,
});

export const EXPERIENCE_APPS = [
  {
    id: 1, appId: "experience-leviosa", name: "Leviosa-AI",
    icon: "/assets/experience-icons/Leviosa-AI-symbol.svg",
    projectIds: [17, 19],
    summary: pair("AI 서비스를 설계하고, 제품으로 만들고, 운영합니다.", "Building and operating AI products, from architecture to everyday use."),
    focus: pair(["제품 전체 개발", "백엔드 아키텍처", "운영 자동화"], ["End-to-end products", "Backend architecture", "Workflow automation"]),
    media: [
      shot("proj_17_1.png", 17, pair("AI 상세페이지 생성·편집 서비스", "AI detail-page generation and editing"), pair("공개 서비스 화면", "Public service page")),
      shot("proj_19_2.png", 19, pair("Yomates 데스크톱 앱의 에이전트 대화", "An agent conversation in the Yomates desktop app"), pair("사용자 제공 앱 화면", "User-supplied app screenshot")),
      shot("proj_19_1.png", 19, pair("Yomates 공개 서비스 소개", "Yomates public service introduction"), pair("공개 서비스 화면", "Public service page")),
    ],
  },
  {
    id: 2, appId: "experience-alus", name: "Alus-Healthcare",
    icon: "/assets/experience-icons/Alus-Healthcare-symbol.svg",
    projectIds: [2, 4, 1, 3],
    summary: pair("헬스케어 제품과 커머스 운영을 소프트웨어로 연결했습니다.", "Connecting healthcare products and commerce operations through software."),
    focus: pair(["커머스 개발", "디바이스 연동", "업무 자동화"], ["Commerce development", "Device integration", "Workflow automation"]),
    media: [
      shot("proj_2_1.png", 2, pair("POWAPOWA 쇼핑몰과 리뷰 콘텐츠", "POWAPOWA storefront and review content"), pair("기존 서비스 캡처", "Archived service screenshot")),
      shot("proj_4_1.png", 4, pair("브랜드 QR 루틴 챌린지의 출석 화면", "Attendance in the brand QR routine challenge"), pair("기존 앱 캡처", "Archived app screenshot")),
      shot("proj_1_2.png", 1, pair("수면 측정 기기의 BLE 데이터 연동 테스트", "BLE data integration test for a sleep measurement device"), pair("개발 테스트 화면", "Development test capture")),
    ],
  },
  {
    id: 3, appId: "experience-yai", name: "YAI",
    projectIds: [5, 6, 7, 14],
    summary: pair("모델 연구를 실험과 동작하는 인터랙션으로 연결합니다.", "Turning model research into experiments and working interactions."),
    focus: pair(["컴퓨터 비전", "멀티모달 검색", "강화학습"], ["Computer vision", "Multimodal retrieval", "Reinforcement learning"]),
    media: [
      shot("proj_5_1.png", 5, pair("감정 분류와 스타일 전이 모델의 실험 결과", "Emotion classification and style transfer results"), pair("프로젝트 발표 자료", "Project presentation")),
      shot("proj_6_2.png", 6, pair("영상 검색 모델의 유사도 시각화", "Similarity visualization for the video retrieval model"), pair("실험 실행 화면", "Experiment screenshot")),
      shot("proj_7_1.png", 7, pair("포켓몬 강화학습 에이전트 발표", "Pokémon reinforcement-learning agent presentation"), pair("프로젝트 발표 자료", "Project presentation")),
    ],
  },
  {
    id: 4, appId: "experience-noilab", name: "NOI-LAB",
    projectIds: [8],
    summary: pair("측정 데이터를 해석 가능한 리포트로 만드는 과정을 자동화했습니다.", "Automating the path from measurement data to readable reports."),
    focus: pair(["Python 자동화", "리포트 생성", "지표 체계화"], ["Python automation", "Report generation", "Metric definition"]),
    media: [
      shot("proj_8_3.png", 8, pair("HTML·PDF 생성과 QR 코드 연결을 처리하는 코드", "Code for HTML/PDF generation and QR-code linking"), pair("기존 코드 캡처", "Archived code screenshot")),
    ],
  },
  {
    id: 5, appId: "experience-ycc", name: "YCC",
    projectIds: [9],
    summary: pair("스터디를 이끌고, 직접 만든 게임으로 개발 경험을 쌓았습니다.", "Leading study groups and learning through a game built from scratch."),
    focus: pair(["React Native 스터디", "Unity 스터디", "게임 개발"], ["React Native study", "Unity study", "Game development"]),
    media: [
      shot("proj_9_1.png", 9, pair("Yakemon의 턴 기반 전투와 기술 선택", "Turn-based combat and move selection in Yakemon"), pair("기존 게임 캡처", "Archived game screenshot")),
    ],
  },
  {
    id: 6, appId: "experience-sdp", name: "SDP",
    projectIds: [10],
    summary: pair("의류 업사이클링을 연결하는 모바일 플랫폼을 팀과 함께 만들었습니다.", "Building a mobile platform for clothing upcycling with a cross-functional team."),
    focus: pair(["테크팀 리드", "React Native", "팀 간 협업"], ["Tech team leadership", "React Native", "Cross-functional work"]),
    media: [
      shot("proj_10_2.jpg", 10, pair("UPCY의 업사이클링 서비스 탐색", "Browsing upcycling services in UPCY"), pair("기존 앱 소개 자료", "Archived app presentation")),
      shot("proj_10_3.jpg", 10, pair("의뢰 주문서의 옵션과 요청사항", "Options and requests in the order form"), pair("기존 앱 소개 자료", "Archived app presentation")),
    ],
  },
];

export function experienceContent(runtime, id) {
  const locale = runtime.locale;
  const data = runtime.datasets[locale];
  const app = EXPERIENCE_APPS.find((entry) => entry.id === id);
  return {
    ...app,
    icon: app.icon || `/assets/experience-icons/${app.name}-official.svg`,
    experience: data.experiences.find((entry) => entry.id === id),
    summary: app.summary[locale],
    focus: app.focus[locale],
    projects: app.projectIds.map((projectId) => data.projects.find((project) => project.id === projectId)).filter(Boolean),
    media: app.media.map((media) => ({ ...media, caption: media.caption[locale], kind: media.kind[locale] })),
  };
}
