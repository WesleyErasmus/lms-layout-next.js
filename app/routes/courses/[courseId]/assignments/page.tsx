import ExpandableAssignment from "@/app/components/ExpandableAssignment";
import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import type { Assignment } from "@/app/types/course.types";
import type { PageParams } from "@/app/types/params";

export default async function CourseAssignmentsPage({ params }: PageParams) {
  const { data: course, error } = await supabase
    .from("courses")
    .select("*, assignments(*)")
    .eq("id", params.courseId)
    .single();

  if (error || !course) {
    console.error("Error fetching course:", error);
    notFound();
  }

  return (
    <div>
      <h1>Assignments</h1>
      {course.assignments.map((assignment: Assignment) => (
        <ExpandableAssignment
          key={assignment.id}
          assignment={{
            ...assignment,
            dueDate: assignment.due_date
              ? new Date(assignment.due_date)
              : undefined,
          }}
        />
      ))}
    </div>
  );
}
