"use client";
import { useEffect } from "react";
import { useCourse } from "@/app/contexts/CourseContext";
import CourseNavbar from "@/app/(dashboard)/courses/components/CourseNavbar";

export default function ClientCourseLayout({
  children,
  course,
}: {
  children: React.ReactNode;
  course: { id: string; title: string };
}) {
  const { setCourse, clearCourse } = useCourse();

  useEffect(() => {
    setCourse(course.id, course.title);
    return () => {
      clearCourse();
    };
  }, [course, setCourse, clearCourse]);

  return (
    <div>
      <CourseNavbar courseId={course.id} />
      {children}
    </div>
  );
}
