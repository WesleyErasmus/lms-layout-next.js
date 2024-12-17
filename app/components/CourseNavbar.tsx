import React from "react";
import styles from "./CourseNavbar.module.css";

const CourseNavbar = () => {
  return (
    <nav className={styles.navbar}>
      <div>
        <ul className={styles.menu}>
          <li className={styles.menuItem}>Assignments</li>
          <li className={styles.menuItem}>Students</li>
          <li className={styles.menuItem}>Grades</li>
        </ul>
      </div>
      <div className={styles.navButtons}>
        <button className={styles.editAssignments}>Edit Assignments</button>
        <button className={styles.settingsButton}>Course Settings</button>
      </div>
    </nav>
  );
};

export default CourseNavbar;
