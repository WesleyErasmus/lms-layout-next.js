"use client"

import React, { useState } from "react";
import styles from "./CourseCard.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "../button/Button";

interface CourseCardProps {
  image?: string;
  title: string;
  category?: string;
  description: string;
  courseId: string;
}

const CourseCard = ({
  image,
  title,
  category,
  description,
  courseId,
}: CourseCardProps) => {
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState({
    assignments: false,
    students: false,
    grades: false,
  });

  const handleNavigation = async (
    path: string,
    buttonType: keyof typeof loadingStates
  ) => {
    setLoadingStates((prev) => ({ ...prev, [buttonType]: true }));
    try {
      await router.push(path);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [buttonType]: false }));
    }
  };

  return (
    <div className={styles.courseCard}>
      <div className={styles.imageContainer}>
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className={styles.cardImage}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <h3 className={styles.cardTitle}>{title}</h3>
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        {image && <h3 className={styles.cardTitle}>{title}</h3>}
        {category && <span className={styles.category}>{category}</span>}
        <p className={styles.cardDescription}>{description}</p>
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.buttonGroup}>
          <Button
            variant="secondary"
            loading={loadingStates.assignments}
            onClick={() =>
              handleNavigation(
                `/courses/${courseId}/assignments`,
                "assignments"
              )
            }
          >
            {loadingStates.assignments ? "Loading..." : "Assignments"}
          </Button>
          <Button
            variant="secondary"
            loading={loadingStates.students}
            onClick={() =>
              handleNavigation(`/courses/${courseId}/students`, "students")
            }
          >
            {loadingStates.students ? "Loading..." : "Students"}
          </Button>
          <Button
            variant="secondary"
            loading={loadingStates.grades}
            onClick={() =>
              handleNavigation(`/courses/${courseId}/grades`, "grades")
            }
          >
            {loadingStates.grades ? "Loading..." : "Grades"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
