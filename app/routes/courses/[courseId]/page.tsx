import { mockCourses } from "@/app/data/mockCourses";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import CourseNavbar from "@/app/components/CourseNavbar";

export default function CoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = mockCourses.find((course) => course.id === params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerSection}>
        <h1 className={styles.courseTitle}>{course.title}</h1>
        <span className={styles.courseId}>Course ID: {course.id}</span>
      </header>

      <CourseNavbar />
      <section className={styles.courseAssignments}>
        <button className={styles.newAssignment}>+ New Assignment</button>
        {course.assignments.map((assignment) => (
          <div key={assignment.id} className={styles.assignmentContainer}>
            <div>
              <h3 className={styles.assignmentTitle}>{assignment.title}</h3>
              <p className={styles.assignmentDescription}>
                {assignment.description}
              </p>
            </div>
            <div>
              {assignment.dueDate && (
                <p className={styles.assignmentDueDate}>
                  Due: {assignment.dueDate.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </section>
      <section className={styles.courseDetails}>
        {/* <p>Number of Students: {course.students}</p> */}
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { courseId: string };
}) {
  const course = mockCourses.find((course) => course.id === params.courseId);

  return {
    title: course ? `${course.title} | Next.js LMS` : "Course Not Found",
  };
}

export async function generateStaticParams() {
  return mockCourses.map((course) => ({
    courseId: course.id,
  }));
}
