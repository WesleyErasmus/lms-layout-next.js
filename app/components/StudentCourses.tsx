"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "./StudentCourses.module.css";

interface StudentCourseProps {
  studentId: string;
}

interface CourseWithDetails {
  id: string;
  title: string;
  description: string;
  enrolled_at: string;
  assignments: {
    id: string;
    title: string;
    marks: number;
    weighting: number;
    due_date: string;
    grades: {
      marks_achieved: number | null;
    }[];
  }[];
}

interface EnrollmentResponse {
  course_id: string;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    description: string;
    assignments: {
      id: string;
      title: string;
      marks: number;
      weighting: number;
      due_date: string;
      grades: {
        marks_achieved: number | null;
      }[];
    }[];
  };
}

export default function StudentCourses({ studentId }: StudentCourseProps) {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudentCourses() {
      try {
        const { data, error } = await supabase
          .from("enrollments")
          .select(
            `
            course_id,
            enrolled_at,
            courses (
              id,
              title,
              description,
              assignments (
                id,
                title,
                marks,
                weighting,
                due_date,
                grades (
                  marks_achieved
                )
              )
            )
          `
          )
          .eq("student_id", studentId);

        if (error) throw error;

        const enrollments = data as unknown as EnrollmentResponse[];

        const formattedCourses: CourseWithDetails[] = enrollments.map(
          (enrollment) => ({
            id: enrollment.courses.id,
            title: enrollment.courses.title,
            description: enrollment.courses.description,
            enrolled_at: enrollment.enrolled_at,
            assignments: enrollment.courses.assignments.map((assignment) => ({
              ...assignment,
              grades: assignment.grades.filter((grade) => grade !== null),
            })),
          })
        );

        setCourses(formattedCourses);
      } catch (err) {
        console.error("Error fetching student courses:", err);
        setError("Failed to load student courses and grades");
      } finally {
        setLoading(false);
      }
    }

    if (studentId) {
      fetchStudentCourses();
    }
  }, [studentId]);

  const calculateCourseProgress = (
    assignments: CourseWithDetails["assignments"]
  ) => {
    const completedAssignments = assignments.filter(
      (a) => a.grades.length > 0 && a.grades[0]?.marks_achieved !== null
    );
    return {
      completed: completedAssignments.length,
      total: assignments.length,
      percentage: Math.round(
        (completedAssignments.length / assignments.length) * 100
      ),
    };
  };

  const calculateGrade = (assignments: CourseWithDetails["assignments"]) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    assignments.forEach((assignment) => {
      if (
        assignment.grades.length > 0 &&
        assignment.grades[0]?.marks_achieved !== null
      ) {
        const score =
          (assignment.grades[0].marks_achieved / assignment.marks) *
          assignment.weighting;
        totalWeightedScore += score;
        totalWeight += assignment.weighting;
      }
    });

    return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : null;
  };

  if (loading) {
    return <div className={styles.loading}>Loading courses...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.coursesContainer}>
      <h2 className={styles.sectionTitle}>Enrolled Courses</h2>
      {courses.length === 0 ? (
        <p className={styles.noCourses}>No courses enrolled</p>
      ) : (
        <div className={styles.coursesList}>
          {courses.map((course) => {
            const progress = calculateCourseProgress(course.assignments);
            const grade = calculateGrade(course.assignments);

            return (
              <div key={course.id} className={styles.courseCard}>
                <div className={styles.courseHeader}>
                  <h3 className={styles.courseTitle}>{course.title}</h3>
                  <span className={styles.enrollmentDate}>
                    Enrolled:{" "}
                    {new Date(course.enrolled_at).toLocaleDateString()}
                  </span>
                </div>

                <p className={styles.courseDescription}>{course.description}</p>

                <div className={styles.courseStats}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <div className={styles.statsInfo}>
                    <span>
                      Progress: {progress.completed}/{progress.total}{" "}
                      assignments
                    </span>
                    {grade !== null && (
                      <span className={styles.grade}>
                        Current Grade: {grade.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.assignmentsList}>
                  {course.assignments.map((assignment) => (
                    <div key={assignment.id} className={styles.assignmentItem}>
                      <div className={styles.assignmentHeader}>
                        <span className={styles.assignmentTitle}>
                          {assignment.title}
                        </span>
                        <span className={styles.assignmentDue}>
                          Due:{" "}
                          {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.assignmentDetails}>
                        <span>Weight: {assignment.weighting}%</span>
                        <span>
                          {assignment.grades[0]?.marks_achieved !== undefined
                            ? `Score: ${assignment.grades[0].marks_achieved}/${assignment.marks}`
                            : "Not graded"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
