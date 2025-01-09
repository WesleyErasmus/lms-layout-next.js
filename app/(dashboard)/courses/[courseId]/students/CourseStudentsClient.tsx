"use client";
import StudentTable from "@/app/components/ui/table/StudentTable";
import { useRouter } from "next/navigation";
import type { Student } from "@/app/types/course.type";

interface CourseStudentsClientProps {
  students: Student[];
}

export default function CourseStudentsClient({
  students,
}: CourseStudentsClientProps) {
  const router = useRouter();

  const tableColumns = [
    { key: "avatar", header: "Avatar" },
    { key: "name", header: "Student Name" },
    { key: "email", header: "Contact Email" },
    { key: "profile", header: "Actions" },
  ];

  return (
    <StudentTable
      title="Course Participants"
      columns={tableColumns}
      students={students}
      onProfileClick={(studentId) => {
        router.push(`/routes/students/${studentId}`);
      }}
    />
  );
}
