import React from "react";
import "./CourseCard.module.css"

interface CourseCardProps {
  image: string;
  title: string;
  category?: string;
  description: string;
}

const CourseCard = (props: CourseCardProps) => {
  return (
    <div className="course-card-container">
      <img className="card-image" src={props.image} alt={props.title} />
      <div className="course-card-body">
        <h3 className="course-card-title">{props.title}</h3>
        <div className="course-card-description">{props.description}</div>
      </div>
      <div className="course-card-button-group">
        <button className="course-card-button">Open</button>
        <div className="course-card-category">{props.category}</div>
      </div>
    </div>
  );
};

export default CourseCard;
