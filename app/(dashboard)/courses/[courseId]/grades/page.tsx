import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import GradesTable from "./GradesTable";
import type { PageParams } from "@/app/types/params.type";

export default async function CourseGradesPage({ params }: PageParams) {
  const { courseId } = await params;

  const [assignmentsResult, enrollmentsResult, gradesResult] =
    await Promise.all([
      supabase.from("assignments").select("*").eq("course_id", courseId),

      supabase
        .from("enrollments")
        .select(
          `
        *,
        students (
          id,
          first_name,
          last_name,
          email
        )
      `
        )
        .eq("course_id", courseId),

      supabase.from("grades").select("*"),
    ]);

  if (
    assignmentsResult.error ||
    enrollmentsResult.error ||
    gradesResult.error ||
    !assignmentsResult.data ||
    !enrollmentsResult.data
  ) {
    console.error(
      "Error fetching data:",
      assignmentsResult.error || enrollmentsResult.error || gradesResult.error
    );
    notFound();
  }

  return (
    <div className="p-4">
      <GradesTable
        initialAssignments={assignmentsResult.data}
        initialEnrollments={enrollmentsResult.data}
        initialGrades={gradesResult.data || []}
        courseId={courseId}
      />
    </div>
  );
}
