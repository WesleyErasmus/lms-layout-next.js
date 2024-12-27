"use client";
import { useEffect } from "react";
import { useCourse } from "@/app/contexts/CourseContext";
import styles from "./layout.module.css";
import CourseNavbar from "@/app/components/CourseNavbar";

export default function ClientCourseLayout({
  children,
  course,
}: {
  children: React.ReactNode;
  course: { id: string; title: string };
}) {
  const { setCourse } = useCourse();

  useEffect(() => {
    setCourse(course.id, course.title);
  }, [course, setCourse]);

  return (
    <div className={styles.container}>
      {/* <header className={styles.headerSection}>
        <h1 className={styles.courseTitle}>{course.title}</h1>
        <span className={styles.courseId}>Course ID: {course.id}</span>
      </header> */}
      <CourseNavbar courseId={course.id} />
      {children}
    </div>
  );
}
