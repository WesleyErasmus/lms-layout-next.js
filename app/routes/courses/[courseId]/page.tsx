import { redirect } from "next/navigation";

export default function CoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  redirect(`/routes/courses/${params.courseId}/assignments`);
}
