import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import CourseStudentsClient from "./CourseStudentsClient";

interface EnrollmentWithUser {
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default async function CourseStudentsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = params;

  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(
      `
      users (
        id,
        first_name,
        last_name,
        email
      )
    `
    )
    .eq("course_id", courseId)
    .returns<EnrollmentWithUser[]>();

  if (error || !enrollments) {
    console.error("Error fetching student enrollments:", error);
    notFound();
  }

  const students = enrollments.map((enrollment) => enrollment.users);

  return <CourseStudentsClient students={students} />;
}