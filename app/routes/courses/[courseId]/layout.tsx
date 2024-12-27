import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import ClientCourseLayout from "./ClientCourseLayout";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) {
  const { courseId } = params;

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (error || !course) {
    console.error("Error fetching course:", error);
    notFound();
  }

  return <ClientCourseLayout course={course}>{children}</ClientCourseLayout>;
}