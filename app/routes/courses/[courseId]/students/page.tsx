import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import styles from "./students.module.css";
import type { Student } from "@/app/types/course.types";

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
      students(id, first_name, last_name, email)
    `
    )
    .eq("course_id", courseId)
    .returns<EnrollmentWithStudent[]>();

  if (error || !enrollments) {
    console.error("Error fetching student enrollments:", error);
    notFound();
  }

  return (
    <div>
      <h1 className={styles.heading}>Students</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((enrollment) => {
            const student = enrollment.students;
            const fullName = `${student.first_name} ${student.last_name}`;
            const initials = `${student.first_name[0]}${student.last_name[0]}`;

            return (
              <tr key={student.id}>
                <td>
                  <div className={styles.placeholder}>{initials}</div>
                </td>
                <td>{fullName}</td>
                <td>{student.email}</td>
                <td>
                  <button>Go To Profile</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
