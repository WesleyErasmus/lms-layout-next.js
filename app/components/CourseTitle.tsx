"use client";

import { useCourse } from "../contexts/CourseContext";
import styles from "./CourseTitle.module.css";

export default function CourseTitle() {
  const { courseTitle, courseId } = useCourse();
  return (
    <div>
      {courseTitle ? (
        <h2 className={styles.courseTitle}>
          {courseTitle} |{" "}
          <span className={styles.courseId}>{courseId}</span>
        </h2>
      ) : null}
    </div>
  );
}
