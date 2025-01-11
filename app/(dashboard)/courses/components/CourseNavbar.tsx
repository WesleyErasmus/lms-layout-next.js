import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./CourseNavbar.module.css";

const CourseNavbar = ({ courseId }: { courseId: string }) => {
  const pathname = usePathname();

  const isCurrentPage = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className={styles.navbar}>
      <div>
        <ul className={styles.menu}>
          <li className={styles.menuItem}>
            <Link
              className={styles.menuItemLink}
              href={`/courses/${courseId}/assignments`}
              aria-current={
                isCurrentPage(`/courses/${courseId}/assignments`)
                  ? "page"
                  : undefined
              }
            >
              Assignments
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link
              className={styles.menuItemLink}
              href={`/courses/${courseId}/students`}
              aria-current={
                isCurrentPage(`/courses/${courseId}/students`)
                  ? "page"
                  : undefined
              }
            >
              Students
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link
              className={styles.menuItemLink}
              href={`/courses/${courseId}/grades`}
              aria-current={
                isCurrentPage(`/courses/${courseId}/grades`)
                  ? "page"
                  : undefined
              }
            >
              Grades
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default CourseNavbar;
