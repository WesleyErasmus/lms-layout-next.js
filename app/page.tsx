import React from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabase/client";
import CourseCard from "./components/ui/card/CourseCard";


export default async function Home() {
  const { data: courses, error } = await supabase.from("courses").select("*");

  if (error) {
    console.error("Error fetching courses:", error);
    return <div>Error loading courses</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Courses</h1>
        <p className={styles.subtitle}>
          Access your enrolled courses and assignments
        </p>
      </div>

      <div className={styles.gridLayout}>
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}/assignments`}
            className={styles.courseLink}
          >
            <CourseCard
              title={course.title}
              description={course.description}
              category={`Course ID: ${course.id}`}
              href={`/courses/${course.id}/assignments`}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
