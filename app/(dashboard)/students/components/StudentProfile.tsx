"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "../styles/StudentProfile.module.css";
import StudentCourses from "./StudentCourses";
import Switch from "@/app/components/ui/toggle/Switch";
import Button from "@/app/components/ui/button/Button";
import Avatar from "@/app/components/Avatar";

export interface StudentProfileProps {
  studentId: string;
}

interface StudentDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  title: string | null;
  dob: string | null;
  id_number: string | null;
  phone_number: string | null;
  student_code: string | null;
}

export default function StudentProfile({ studentId }: StudentProfileProps) {
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [editedStudent, setEditedStudent] = useState<Partial<StudentDetails>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchStudentDetails() {
      try {
        const { data, error } = await supabase
          .from("users")
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

  const handleEditChange = (field: string, value: string) => {
    setEditedStudent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveChanges = async () => {
    if (!student) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update(editedStudent)
        .eq("id", student.id);

      if (error) throw error;

      setStudent((prev) => (prev ? { ...prev, ...editedStudent } : prev));
      setEditedStudent({});
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving student details:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderEditableField = (
    label: string,
    field: keyof StudentDetails,
    type: string = "text",
    readOnly: boolean = false
  ) => {
    if (!student) return null;

    const value = editedStudent[field] ?? student[field] ?? "";
    const displayValue =
      type === "date" && value
        ? new Date(value).toISOString().split("T")[0]
        : value;

    return (
      <div className={styles.infoItem}>
        <span className={styles.label}>{label}</span>
        {isEditing && !readOnly ? (
          <input
            type={type}
            className={styles.editInput}
            value={displayValue}
            onChange={(e) => handleEditChange(field, e.target.value)}
          />
        ) : (
          <span className={styles.value}>
            {type === "date" && value
              ? new Date(value).toLocaleDateString()
              : value || "Not provided"}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading student profile...</div>;
  }

  if (error || !student) {
    return <div className={styles.error}>{error || "Student not found"}</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            <Avatar
              firstName={editedStudent.first_name || student.first_name}
              lastName={editedStudent.last_name || student.last_name}
              size="large"
              className={styles.avatar}
            />
          </div>
          <h1 className={styles.studentName}>
            {editedStudent.first_name || student.first_name}{" "}
            {editedStudent.last_name || student.last_name}
          </h1>
        </div>
        <div className={styles.controls}>
          <Switch
            checked={isEditing}
            onCheckedChange={(checked) => {
              if (!checked && Object.keys(editedStudent).length > 0) {
                const confirmSave = window.confirm(
                  "Would you like to save your changes?"
                );
                if (confirmSave) {
                  saveChanges();
                } else {
                  setEditedStudent({});
                }
              }
              setIsEditing(checked);
            }}
            label="Edit Mode"
          />
          {isEditing && Object.keys(editedStudent).length > 0 && (
            <Button onClick={saveChanges}>Save Changes</Button>
          )}
        </div>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>Contact Information</h2>
          <div className={styles.infoGrid}>
            {renderEditableField("Title", "title")}
            {renderEditableField("First Name", "first_name")}
            {renderEditableField("Last Name", "last_name")}
            {renderEditableField("Email", "email")}
            {renderEditableField("Phone Number", "phone_number")}
            {renderEditableField("Student ID", "id", "text", true)}
            {renderEditableField("Student Code", "student_code")}
          </div>
        </div>

        <div className={styles.infoSection}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>
          <div className={styles.infoGrid}>
            {renderEditableField("ID Number", "id_number")}
            {renderEditableField("Date of Birth", "dob", "date")}
            {renderEditableField("Joined", "created_at", "date", true)}
          </div>
        </div>
      </div>

      <StudentCourses studentId={studentId} />

      {saving && (
        <div className={styles.savingOverlay}>
          <div className={styles.savingMessage}>Saving changes...</div>
        </div>
      )}
    </div>
  );
}
