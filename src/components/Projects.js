// components/Projects.js
import React, { useState } from 'react';
import '../Projects.css';

const ProjectItem = ({ title, description, extraDescription, picture }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded((prev) => !prev);
  };

  // 이미지가 없을 수도 있으니, 안전하게 length 체크
  const columnsCount = picture && picture.length > 0 ? picture.length : 1;

  return (
    <div
      className={`project-item ${isExpanded ? 'expanded' : ''}`}
      onClick={toggleExpansion}
    >
      <h3>{title}</h3>
      {description.map((item, index) => (
        <p key={index}>{item}</p>
      ))}
      <div
        className="image-container"
        style={{
          // 이미지 개수(columnsCount)만큼 1fr 컬럼 생성
          gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
        }}
      >
        {picture &&
          picture.map((item, idx) => (
            <img key={idx} src={item} alt={title} />
          ))
        }
      </div>
      {isExpanded &&
        extraDescription.map((item, index) => (
          <p key={index}>- {item}</p>
        ))
      }
    </div>
  );
};

const Projects = () => (
  <section className="projects">
    <div className="wrapper">
      <h2>Projects & Experience</h2>
      <div className="project-list">
        <ProjectItem
          title="Mobile App 'UPCY'"
          description={["A Second-Hand Trading Platform made with ReactNative.",
            "",
            "Click to expand for more details."
          ]}
          extraDescription={[
            "This mobile app connect Reformers(who can re-form clothes) and Users.",
            "Reformers can upload services and Users can search, like and order them.",
            "I was in charge of the entire development process, from planning to deployment."
          ]}
          picture={["https://i.imgur.com/uUaHs8U.jpeg", "https://i.imgur.com/qQ6Ld6B.jpeg"]}
        />
        <ProjectItem
          title="LearnUS_pdf_downloader"
          description={["A Python script based web site that downloads the pdf files from the given URL.",
            "",
            "Click to expand for more details."
          ]}
          extraDescription={[
            "LearnUS site does not provide a download button for pdf files sometimes, so I made this web site.",
            "Firstly, Selenium makes chromeDriver to open the URL and scroll down to the bottom of the page.",
            "Secondly, find the png files separated in the page and download them.",
            "Thirdly, upscale the png files to pdf files and download them."
          ]}
          picture={["https://i.imgur.com/ANuY5d5.png"]}
        />
        <ProjectItem
          title="Emotion Classification & Style Transfer Model"
          description={["Emotion Classification using CNN and Style Transfer using Neural Style Transfer.",
            "",
            "Click to expand for more details."
          ]}
          extraDescription={[
            "Emotion Classification: Fine-tuned `EfficientFace` CNN model to classify the emotion of the given image.",
            "Style Transfer: Fine-tuned `AdaIN` Neural Style Transfer model to transfer the style of the given image to the movie `Inside-Out` style image."
          ]}
          picture={["https://i.imgur.com/fYrAwXl.png", "https://i.imgur.com/ritmUpG.png"]}
        />
        {/* Add more project items as needed */}
      </div>
    </div>
  </section>
);

export default Projects;