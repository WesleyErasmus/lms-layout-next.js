"use client";

import { useCourse } from "../contexts/CourseContext";
import styles from "./CourseTitle.module.css";

export default function CourseTitle() {
  const { courseTitle, courseId } = useCourse();
  return (
    <div>
      <h2 className={styles.courseTitle}>
        {courseTitle || null} |{" "}
        <span className={styles.courseId}>{courseId || null}</span>
      </h2>
    </div>
  );
}
