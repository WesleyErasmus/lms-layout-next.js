"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "./StudentProfile.module.css";

export interface StudentProfileProps {
  studentId: string;
}

interface StudentDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

export default function StudentProfile({ studentId }: StudentProfileProps) {
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudentDetails() {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("id", studentId)
          .single();

        if (error) throw error;
        setStudent(data);
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError("Failed to load student details");
      } finally {
        setLoading(false);
      }
    }

    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  if (loading) {
    return <div className={styles.loading}>Loading student profile...</div>;
  }

  if (error || !student) {
    return <div className={styles.error}>{error || "Student not found"}</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            {student.first_name[0]}
            {student.last_name[0]}
          </div>
        </div>
        <h1 className={styles.studentName}>
          {student.first_name} {student.last_name}
        </h1>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>Contact Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{student.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Student ID</span>
              <span className={styles.value}>{student.id}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Joined</span>
              <span className={styles.value}>
                {new Date(student.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
