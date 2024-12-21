"use client";
import React, { useState } from "react";
import styles from "./ExpandableAssignment.module.css";
import type { Assignment } from "../types/course.types";

interface ExpandableAssignmentProps {
  assignment: Assignment;
}

const ExpandableAssignment = ({ assignment }: ExpandableAssignmentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={styles.assignmentContainer}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div>
        <h3 className={styles.assignmentTitle}>{assignment.title}</h3>

        {isExpanded && (
          <div>
            <p>
              <strong>Brief:</strong> {assignment.brief}
            </p>
            <p className={styles.assignmentDescription}>
              {assignment.description}
            </p>
          </div>
        )}
      </div>
      <div>
        {assignment.dueDate && (
          <p className={styles.assignmentDueDate}>
            Due: {assignment.dueDate.toLocaleDateString()}
          </p>
        )}

        {isExpanded && (
          <div>
            {assignment.marks && <p>Total Marks: {assignment.marks}</p>}
            {assignment.weighting && (
              <p>Assignment Weight: {assignment.weighting}%</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableAssignment;
