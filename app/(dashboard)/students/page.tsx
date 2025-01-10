"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Student } from "@/app/types/course.type";
import StudentTable from "@/app/components/ui/table/StudentTable";

export default function StudentsPage() {
 const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchStudents() {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("last_name", { ascending: true });

        if (error) throw error;
        setStudents(data || []);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  const handleProfileClick = (studentId: string) => {
    router.push(`/students/${studentId}`);
  };

  const tableColumns = [
    { key: "avatar", header: "Avatar" },
    { key: "name", header: "Student Name" },
    { key: "email", header: "Email" },
    { key: "profile", header: "Profile" },
  ];

  return (
    <div>
      <StudentTable
        title="Students"
        columns={tableColumns}
        students={students}
        onProfileClick={handleProfileClick}
        loading={loading}
      />
    </div>
  );
}
