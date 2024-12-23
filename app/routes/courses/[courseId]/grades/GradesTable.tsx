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

interface InvalidGrade {
  value: number;
  maxMarks: number;
}

interface GradeInfo {
  finalGrade: number;
  isPartial: boolean;
  gradedAssignments: number;
  totalAssignments: number;
  maxPossibleGrade: number;
  weightedSoFar: number;
  totalWeight: number;
  accumulatedPercentage: number;
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
  const [invalidGrades, setInvalidGrades] = useState(
    new Map<string, InvalidGrade>()
  );

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
    value: string,
    maxMarks: number
  ) => {
    const key = `${studentId}|${assignmentId}`;
    const numericValue = value === "" ? null : parseFloat(value);

    if (value === "") {
      setInvalidGrades((prev) => {
        const newInvalid = new Map(prev);
        newInvalid.delete(key);
        return newInvalid;
      });
      setEditedGrades((prev) => new Map(prev).set(key, numericValue));
      return;
    }

    if (isNaN(numericValue!)) {
      console.error("Invalid grade value:", value);
      return;
    }

    if (numericValue! < 0 || numericValue! > maxMarks) {
      setInvalidGrades((prev) =>
        new Map(prev).set(key, {
          value: numericValue!,
          maxMarks,
        })
      );
    } else {
      setInvalidGrades((prev) => {
        const newInvalid = new Map(prev);
        newInvalid.delete(key);
        return newInvalid;
      });
    }

    setEditedGrades((prev) => new Map(prev).set(key, numericValue));
  };

  const saveGrades = async () => {
    if (invalidGrades.size > 0) {
      alert("Please correct invalid grades before saving.");
      return;
    }

    setSaving(true);
    try {
      const gradesToUpdate = Array.from(editedGrades.entries()).map(
        ([key, marks_achieved]) => {
          const [student_id, assignment_id] = key.split("|");
          return {
            student_id,
            assignment_id,
            marks_achieved,
          };
        }
      );

      const { error } = await supabase.from("grades").upsert(gradesToUpdate);

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

  const calculateGradeInfo = (enrollment: Enrollment): GradeInfo => {
    let totalWeightedMarks = 0;
    let totalWeight = 0;
    let gradedAssignments = 0;
    let unaccountedWeight = 0;
    let accumulatedPercentage = 0;

    initialAssignments.forEach((assignment) => {
      const gradeKey = `${enrollment.student_id}|${assignment.id}`;
      const grade = editedGrades.get(gradeKey) ?? gradeLookup.get(gradeKey);

      if (grade !== undefined && grade !== null) {
        const weightedGrade = (grade / assignment.marks) * assignment.weighting;
        totalWeightedMarks += weightedGrade;
        totalWeight += assignment.weighting;
        gradedAssignments++;
        accumulatedPercentage += weightedGrade;
      } else {
        unaccountedWeight += assignment.weighting;
      }
    });

    const currentGrade =
      totalWeight > 0 ? (totalWeightedMarks / totalWeight) * 100 : 0;
    const maxPossibleGrade =
      totalWeight > 0
        ? ((totalWeightedMarks + (unaccountedWeight * 100) / 100) /
            (totalWeight + unaccountedWeight)) *
          100
        : 100;

    return {
      finalGrade: currentGrade,
      isPartial: gradedAssignments < initialAssignments.length,
      gradedAssignments,
      totalAssignments: initialAssignments.length,
      maxPossibleGrade,
      weightedSoFar: totalWeight,
      totalWeight: totalWeight + unaccountedWeight,
      accumulatedPercentage,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getInputStyle = (gradeKey: string, value: number | null) => {
    const invalidGrade = invalidGrades.get(gradeKey);
    if (invalidGrade) {
      return `${styles.input} ${styles.invalidInput}`;
    }
    return styles.input;
  };

  const getValidationMessage = (gradeKey: string) => {
    const invalidGrade = invalidGrades.get(gradeKey);
    if (invalidGrade) {
      return invalidGrade.value < 0
        ? "Grade cannot be negative"
        : `Grade cannot exceed ${invalidGrade.maxMarks} marks`;
    }
    return null;
  };

  const renderFinalGradeCell = (enrollment: Enrollment) => {
    const gradeInfo = calculateGradeInfo(enrollment);

    return (
      <td className={`${styles.tableBodyCell} ${styles.finalGrade}`}>
        <div className={styles.gradeInfoContainer}>
          <div className={styles.currentGrade}>
            {gradeInfo.finalGrade.toFixed(1)}%
          </div>
          {gradeInfo.isPartial && (
            <div className={styles.gradeContext}>
              <span className={styles.gradeNote}>
                Based on {gradeInfo.gradedAssignments} of{" "}
                {gradeInfo.totalAssignments} assignments (
                {gradeInfo.weightedSoFar}% of {gradeInfo.totalWeight}% total
                weight)
              </span>
              <span className={styles.accumulatedGrade}>
                Accumulated: {gradeInfo.accumulatedPercentage.toFixed(1)}%
              </span>
              <span className={styles.maxGrade}>
                Max possible: {gradeInfo.maxPossibleGrade.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </td>
    );
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
                if (invalidGrades.size > 0) {
                  alert("Please correct invalid grades before saving.");
                  return;
                }
                const confirmSave = window.confirm(
                  "Would you like to save your changes?"
                );
                if (confirmSave) {
                  saveGrades();
                } else {
                  setEditedGrades(new Map());
                  setInvalidGrades(new Map());
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
                  const validationMessage = getValidationMessage(gradeKey);

                  return (
                    <td key={assignment.id} className={styles.tableBodyCell}>
                      {isEditing ? (
                        <div className={styles.gradeInputContainer}>
                          <input
                            className={getInputStyle(gradeKey, grade)}
                            value={editedGrades.get(gradeKey) ?? grade ?? ""}
                            onChange={(e) =>
                              handleGradeChange(
                                enrollment.student_id,
                                assignment.id,
                                e.target.value,
                                assignment.marks
                              )
                            }
                            min={0}
                            max={assignment.marks}
                            step="0.1"
                          />
                          {validationMessage && (
                            <div className={styles.validationMessage}>
                              {validationMessage}
                            </div>
                          )}
                        </div>
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
                {renderFinalGradeCell(enrollment)}
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
