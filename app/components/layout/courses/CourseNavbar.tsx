import React from "react";
import Link from "next/link";
import styles from "./CourseNavbar.module.css";

const CourseNavbar = ({ courseId }: { courseId: string }) => {
  return (
    <nav className={styles.navbar}>
      <div>
        <ul className={styles.menu}>
          <li className={styles.menuItem}>
            <Link className={styles.menuItemLink} href={`/courses/${courseId}/assignments`}>
              Assignments
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link className={styles.menuItemLink} href={`/courses/${courseId}/students`}>Students</Link>
          </li>
          <li className={styles.menuItem}>
            <Link className={styles.menuItemLink} href={`/courses/${courseId}/grades`}>Grades</Link>
          </li>
        </ul>
      </div>
      <div className={styles.navButtons}>
        <button className={styles.settingsButton}>Course Settings</button>
      </div>
    </nav>
  );
};

export default CourseNavbar;
