"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Switch from "@/app/components/Switch";
import styles from "./GradesTable.module.css";
import type { Assignment, Enrollment, Grade } from "@/app/types/course.types";

interface GradesTableProps {
  initialAssignments: Assignment[];
  initialEnrollments: Enrollment[];
  initialGrades: Grade[];
  courseId: string;
}

export default function GradesTable({
  initialAssignments,
  initialEnrollments,
  initialGrades,
}: GradesTableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [grades, setGrades] = useState(initialGrades);
  const [saving, setSaving] = useState(false);
  const [editedGrades, setEditedGrades] = useState(new Map());

  useEffect(() => {
    console.log("Initial Data:", {
      assignments: initialAssignments,
      enrollments: initialEnrollments,
      grades: initialGrades,
    });
  }, [initialAssignments, initialEnrollments, initialGrades]);

  const gradeLookup = new Map(
    grades?.map((grade) => [
      `${grade.student_id}|${grade.assignment_id}`,
      grade.marks_achieved,
    ])
  );

  const handleGradeChange = (
    studentId: string,
    assignmentId: string,
    value: string
  ) => {
    const key = `${studentId}|${assignmentId}`;
    const numericValue = value === "" ? null : parseFloat(value);

    if (value !== "" && (isNaN(numericValue!) || numericValue! < 0)) {
      console.error("Invalid grade value:", value);
      return;
    }

    setEditedGrades((prev) => new Map(prev).set(key, numericValue));
  };

  const saveGrades = async () => {
    setSaving(true);
    try {
      const gradesToUpdate = Array.from(editedGrades.entries()).map(
        ([key, marks_achieved]) => {
          const [student_id, assignment_id] = key.split("|");

          console.log("Processing grade:", {
            key,
            student_id,
            assignment_id,
            marks_achieved,
          });

          return {
            student_id,
            assignment_id,
            marks_achieved,
          };
        }
      );

      console.log("Final grades to update:", gradesToUpdate);

      const { error } = await supabase.from("grades").upsert(gradesToUpdate);
      console.log("Supabase response:", { error });

      if (error) throw error;

      const updatedGrades = [...grades];
      gradesToUpdate.forEach((newGrade) => {
        const index = updatedGrades.findIndex(
          (g) =>
            g.student_id === newGrade.student_id &&
            g.assignment_id === newGrade.assignment_id
        );
        if (index >= 0) {
          updatedGrades[index] = newGrade;
        } else {
          updatedGrades.push(newGrade);
        }
      });

      setGrades(updatedGrades);
      setEditedGrades(new Map());
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving grades:", error);
      alert("Failed to save grades. Please check the console for details.");
    } finally {
      setSaving(false);
    }
  };

  const calculateFinalGrade = (enrollment: Enrollment) => {
    let totalWeightedMarks = 0;
    let totalWeight = 0;

    initialAssignments.forEach((assignment) => {
      const gradeKey = `${enrollment.student_id}|${assignment.id}`;
      const grade = editedGrades.get(gradeKey) ?? gradeLookup.get(gradeKey);

      if (grade !== undefined && grade !== null) {
        const weightedGrade = (grade / assignment.marks) * assignment.weighting;
        totalWeightedMarks += weightedGrade;
        totalWeight += assignment.weighting;
      }
    });

    return totalWeight > 0 ? (totalWeightedMarks / totalWeight) * 100 : 0;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Grades</h1>
        <div className={styles.switchContainer}>
          <div>Capture Mode</div>
          <Switch
            checked={isEditing}
            onCheckedChange={(checked) => {
              if (!checked && editedGrades.size > 0) {
                const confirmSave = window.confirm(
                  "Would you like to save your changes?"
                );
                if (confirmSave) {
                  saveGrades();
                } else {
                  setEditedGrades(new Map());
                }
              }
              setIsEditing(checked);
            }}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeaderCell}>Student</th>
              {initialAssignments.map((assignment) => (
                <th key={assignment.id} className={styles.tableHeaderCell}>
                  {assignment.title}
                  <br />
                  <span className={styles.studentInfo}>
                    ({assignment.marks} marks, {assignment.weighting}%)
                  </span>
                </th>
              ))}
              <th className={styles.tableHeaderCell}>Final Grade</th>
            </tr>
          </thead>
          <tbody>
            {initialEnrollments.map((enrollment) => (
              <tr key={enrollment.student_id}>
                <td className={`${styles.tableBodyCell} ${styles.studentCell}`}>
                  {enrollment.students.first_name}{" "}
                  {enrollment.students.last_name}
                  <br />
                  <span className={styles.studentInfo}>
                    {enrollment.students.email}
                  </span>
                </td>
                {initialAssignments.map((assignment) => {
                  const gradeKey = `${enrollment.student_id}|${assignment.id}`;
                  const grade =
                    editedGrades.get(gradeKey) ?? gradeLookup.get(gradeKey);
                  const percentage =
                    grade !== undefined && grade !== null
                      ? ((grade / assignment.marks) * 100).toFixed(1)
                      : "-";

                  return (
                    <td key={assignment.id} className={styles.tableBodyCell}>
                      {isEditing ? (
                        <input
                          type="number"
                          className={styles.input}
                          value={editedGrades.get(gradeKey) ?? grade ?? ""}
                          onChange={(e) =>
                            handleGradeChange(
                              enrollment.student_id,
                              assignment.id,
                              e.target.value
                            )
                          }
                          min={0}
                          max={assignment.marks}
                          step="0.1"
                        />
                      ) : grade !== undefined && grade !== null ? (
                        <>
                          {grade}/{assignment.marks}
                          <br />
                          <span className={styles.studentInfo}>
                            ({percentage}%)
                          </span>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                  );
                })}
                <td className={`${styles.tableBodyCell} ${styles.finalGrade}`}>
                  {calculateFinalGrade(enrollment).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {saving && (
        <div className={styles.savingOverlay}>
          <div className={styles.savingMessage}>Saving grades...</div>
        </div>
      )}
    </div>
  );
}
