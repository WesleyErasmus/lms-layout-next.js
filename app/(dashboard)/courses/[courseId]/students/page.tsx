import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import CourseStudentsClient from "./CourseStudentsClient";
import type { Student } from "@/app/types/course.type";

interface EnrollmentWithStudent {
  students: Student;
}

export default async function CourseStudentsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = await params;

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(
      `
      users(id, first_name, last_name, email)
    `
    )
    .eq("course_id", courseId)
    .returns<EnrollmentWithStudent[]>();

  if (error || !enrollments) {
    console.error("Error fetching student enrollments:", error);
    notFound();
  }

  const students = enrollments.map((enrollment) => enrollment.students);

  return <CourseStudentsClient students={students} />;
}
