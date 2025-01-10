import { redirect } from "next/navigation";

export default function CoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  redirect(`/courses/${params.courseId}/assignments`);
}
