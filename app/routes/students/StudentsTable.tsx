"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Student } from "@/app/types/course.type";
import styles from "./students.module.css";
import { useRouter } from "next/navigation";

export default function StudentsTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const { data, error } = await supabase
          .from("students")
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

  const router = useRouter();

  const handleProfileClick = (studentId: string) => {
    router.push(`/routes/students/${studentId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading students...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Students</h1>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeaderCell}>Full Name</th>
              <th className={styles.tableHeaderCell}>Email</th>
              <th className={styles.tableHeaderCell}>Profile Link</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className={`${styles.tableBodyCell} ${styles.studentCell}`}>
                  {student.first_name} {student.last_name}
                </td>
                <td className={styles.tableBodyCell}>
                  <span className={styles.studentInfo}>{student.email}</span>
                </td>
                <td className={styles.tableBodyCell}>
                  <button
                    className={styles.profileButton}
                    onClick={() => handleProfileClick(student.id)}
                    aria-label="View profile"
                  >
                    <svg
                      className={styles.profileIcon}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 3h7v7" />
                      <path d="M14 10L21 3" />
                      <path d="M16 21H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h7" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
