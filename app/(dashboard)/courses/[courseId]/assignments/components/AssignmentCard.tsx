import {
  type Assignment,
  type EditableAssignment,
} from "@/app/types/course.type";
import styles from "../styles/AssignmentCard.module.css";

interface AssignmentCardProps {
  assignment: Assignment | EditableAssignment;
}

export default function AssignmentCard({
  assignment,
}: AssignmentCardProps) {
  const isEditableAssignment = (
    assignment: Assignment | EditableAssignment
  ): assignment is EditableAssignment => {
    return (assignment as EditableAssignment).title instanceof Object;
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>
        {isEditableAssignment(assignment) ? assignment.title : assignment.title}
      </h3>
      <div className={styles.cardContent}>
        <div className={styles.brief}>
          <strong>Brief:</strong>{" "}
          {isEditableAssignment(assignment)
            ? assignment.brief
            : assignment.brief}
        </div>
        <div className={styles.description}>
          {isEditableAssignment(assignment)
            ? assignment.description
            : assignment.description}
        </div>
        <div className={styles.metadata}>
          {assignment.due_date && (
            <div className={styles.dueDate}>
              {isEditableAssignment(assignment)
                ? assignment.due_date
                : `Due: ${new Date(assignment.due_date).toLocaleDateString()}`}
            </div>
          )}
          <div className={styles.marks}>
            Total Marks:{" "}
            {isEditableAssignment(assignment)
              ? assignment.marks
              : assignment.marks}
          </div>
          <div className={styles.weight}>
            Assignment Weight:{" "}
            {isEditableAssignment(assignment)
              ? assignment.weighting
              : `${assignment.weighting}%`}
          </div>
        </div>
      </div>
    </div>
  );
}
