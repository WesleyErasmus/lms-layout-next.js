import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import CourseNavbar from "@/app/components/CourseNavbar";
import ExpandableAssignment from "@/app/components/ExpandableAssignment";

export default async function CourseContent({
  params,
}: {
  params: { courseId: string };
}) {
  const { data: course, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      assignments(*)
    `
    )
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

      <CourseNavbar />
      <section className={styles.courseAssignments}>
        <button className={styles.newAssignment}>+ New Assignment</button>
        {course.assignments.map((assignment) => (
          <ExpandableAssignment key={assignment.id} assignment={assignment} />
        ))}
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { courseId: string };
}) {
  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("id", params.courseId)
    .single();

  return {
    title: course ? `${course.title} | Next.js LMS` : "Course Not Found",
  };
}

export async function generateStaticParams() {
  const { data: courses } = await supabase.from("courses").select("id");

  return (
    courses?.map((course) => ({
      courseId: course.id,
    })) || []
  );
}
