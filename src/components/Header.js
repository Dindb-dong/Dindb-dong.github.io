// components/Header.js
import React from "react";
import { User } from "lucide-react";
import "../Header.css";

const Header = () => (
  <header className="header">
    <div className="wrapper">
      <h1 className="section-title">
        <User size={28} strokeWidth={2} className="section-title-icon" aria-hidden />
        About Me
      </h1>
      <div className="profile">
        <div className="profile-background">
          <img
            src="https://i.imgur.com/2aGESqu.png"
            alt="Profile"
            className="profile-img"
          />
        </div>
        <div className="profile-text">
          <h2>Kim Dong Wook</h2>
          <h2>김동욱</h2>
          <h3>연세대학교 응용통계학과 &amp; 컴퓨터과학과</h3>
          <h3>Full-Stack AI Engineer</h3>
        </div>
      </div>
      <div className="about-me-content">
        <p className="about-me-intro">
          안녕하십니까, 저는 풀스택 AI 엔지니어 김동욱입니다. <br />
          데이터 사이언스와 소프트웨어 개발, AI 연구에 열정을 가지고 <br />
          연세대학교 응용통계학과와 컴퓨터과학과에서 학업을 진행하고 있습니다.
        </p>
        <p className="about-me-detail">
          저는 <b>‘힘든 아이들을 돕자’</b>는 목표가 명확한 사람입니다. <br />
          고등학교 시절, 1달 가량 등교를 못했었고 교실에 제 침대가 있을 정도로
          건강이 좋지 않았습니다. <br />
          저와 같이 몸이 불편한 아이들을 기술로 도와야겠다는 생각이 들어,
          문과임에도 IT 기술을 다루는 응용통계학과에 진학했습니다.
          <br />
          <b>
            뒤늦게 개발을 시작했기에 더욱 공부하고, 여러 활동에 도전하며
            그것들에 최선을 다해왔습니다.
          </b>
          <br />
        </p>
        <p className="about-me-detail">
          좋은 개발자가 되기 위해 앱, 웹, 프론트엔드, 백엔드, DB 등
          <b> 다양한 포지션</b>을 경험했습니다.
          <br />
          세상을 바라보는 눈을 넓히고자, 저를 인정해주신 분들의 노력에
          보답하고자 <b>회사에 근무하며 정말 다양한 경험</b>을 쌓았습니다.
          <br />
          <b>기획자와 디자이너와 협업하며</b> 사용자 중심의 서비스를 만들어본
          이후, "구조 설계"가 중요하다는 것을 깨달았습니다. <br />
          프로젝트 팀장으로서 AI 학습 환경을 <b>0부터 쌓아올린 경험</b>, 직접
          만든 환경에 알맞도록 <br />
          AI 모델을 <b>0부터 개발하고 학습시킨 경험</b>을 통해 "응용"의 기저에
          필요한 "원론"의 중요성을 깨달았습니다.
        </p>
        <p className="about-me-detail">
          저는 <b>가장 빠른 정답을 찾기 위해 0부터 검토하는 사람</b>입니다.
          <br />이 글을 읽고 계신 분께도 제 노력이 닿을 수 있도록
          정진하겠습니다. <br />
          감사합니다.
        </p>
      </div>
    </div>
  </header>
);

export default Header;
