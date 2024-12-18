import React from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabase/client";

export default async function Home() {
  const { data: courses, error } = await supabase.from("courses").select("*");

  if (error) {
    console.error("Error fetching courses:", error);
    return <div>Error loading courses</div>;
  }
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Courses</h1>
      <div className={styles.gridLayout}>
        {courses.map((course) => (
          <Link
            className={styles.courseLink}
            key={course.id}
            href={`/routes/courses/${course.id}`}
          >
            <div className={styles.courseCard}>
              <div className={styles.imagePlaceholder}>
                <h2 className={styles.courseTitle}>{course.title}</h2>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.courseId}>Course ID: {course.id}</p>
                <p className={styles.courseDescription}>{course.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
