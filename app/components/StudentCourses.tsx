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
    grade: number | null;
  }[];
}

interface EnrollmentResponse {
  course_id: string;
  enrolled_at: string;
  courses: {
    id: string;
    title: string;
    description: string;
  };
}

export default function StudentCourses({ studentId }: StudentCourseProps) {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudentCourses() {
      try {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("enrollments")
          .select(
            `
            course_id,
            enrolled_at,
            courses (
              id,
              title,
              description
            )
          `
          )
          .eq("student_id", studentId);

        if (enrollmentError) throw enrollmentError;

        const enrollments = enrollmentData as unknown as EnrollmentResponse[];

        const coursesWithDetails = await Promise.all(
          enrollments.map(async (enrollment) => {
            const { data: assignmentsData, error: assignmentsError } =
              await supabase
                .from("assignments")
                .select(
                  `
                id,
                title,
                marks,
                weighting,
                due_date
              `
                )
                .eq("course_id", enrollment.course_id);

            if (assignmentsError) throw assignmentsError;
            const assignmentsWithGrades = await Promise.all(
              assignmentsData.map(async (assignment) => {
                const { data: gradeData, error: gradeError } = await supabase
                  .from("grades")
                  .select("marks_achieved")
                  .eq("assignment_id", assignment.id)
                  .eq("student_id", studentId)
                  .single();

                if (gradeError && gradeError.code !== "PGRST116") {
                  throw gradeError;
                }

                return {
                  ...assignment,
                  grade: gradeData?.marks_achieved ?? null,
                };
              })
            );

            return {
              id: enrollment.courses.id,
              title: enrollment.courses.title,
              description: enrollment.courses.description,
              enrolled_at: enrollment.enrolled_at,
              assignments: assignmentsWithGrades,
            };
          })
        );

        setCourses(coursesWithDetails);
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
    const completedAssignments = assignments.filter((a) => a.grade !== null);
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
      if (assignment.grade !== null) {
        const score =
          (assignment.grade / assignment.marks) * assignment.weighting;
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
                          {assignment.grade !== null
                            ? `Score: ${assignment.grade}/${assignment.marks}`
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
