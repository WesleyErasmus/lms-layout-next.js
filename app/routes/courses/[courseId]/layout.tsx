import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import styles from "./layout.module.css";
import CourseNavbar from "@/app/components/CourseNavbar";
// import type { PageParams } from "@/app/types/params";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) {
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.courseId)
    .single();

  if (error || !course) {
    console.error("Error fetching course:", error);
    notFound();
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerSection}>
        <h1 className={styles.courseTitle}>{course.title}</h1>
        <span className={styles.courseId}>Course ID: {course.id}</span>
      </header>
      <CourseNavbar courseId={course.id} />
      {children}
    </div>
  );
}
