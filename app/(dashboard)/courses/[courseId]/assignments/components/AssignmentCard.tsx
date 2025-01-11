import { type Assignment } from "@/app/types/course.type";
import styles from "../styles/AssignmentCard.module.css";

interface AssignmentCardProps {
  assignment: Assignment;
  isEditing: boolean;
  editedValues?: Partial<Assignment>;
  onEditChange: (
    assignmentId: string,
    field: string,
    value: string | number
  ) => void;
}

export default function AssignmentCard({
  assignment,
  isEditing,
  editedValues = {},
  onEditChange,
}: AssignmentCardProps) {
  const currentValues = {
    ...assignment,
    ...editedValues,
  };

  const handleInputChange = (field: string, value: string | number) => {
    onEditChange(assignment.id, field, value);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (isEditing) {
    return (
      <div className={styles.card} onClick={handleClick}>
        <h3 className={styles.cardTitle}>
          <input
            className={styles.input}
            value={currentValues.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
        </h3>
        <div className={styles.cardContent}>
          <div className={styles.brief}>
            <strong>Brief:</strong>{" "}
            <input
              className={styles.input}
              value={currentValues.brief || ""}
              onChange={(e) => handleInputChange("brief", e.target.value)}
            />
          </div>
          <div className={styles.description}>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              value={currentValues.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>
          <div className={styles.metadata}>
            <div className={`${styles.metadataItem} ${styles.dueDate}`}>
              <input
                className={styles.input}
                type="date"
                value={
                  currentValues.due_date
                    ? new Date(currentValues.due_date)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) => handleInputChange("due_date", e.target.value)}
              />
            </div>
            <div className={`${styles.metadataItem} ${styles.marks}`}>
              <input
                className={styles.input}
                type="number"
                value={currentValues.marks}
                onChange={(e) =>
                  handleInputChange("marks", Number(e.target.value))
                }
              />
            </div>
            <div className={`${styles.metadataItem} ${styles.weight}`}>
              <input
                className={styles.input}
                type="number"
                value={currentValues.weighting}
                onChange={(e) =>
                  handleInputChange("weighting", Number(e.target.value))
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{currentValues.title}</h3>
      <div className={styles.cardContent}>
        <div className={styles.brief}>
          <strong>Brief:</strong> {currentValues.brief}
        </div>
        <div className={styles.description}>{currentValues.description}</div>
        <div className={styles.metadata}>
          {currentValues.due_date && (
            <div className={`${styles.metadataItem} ${styles.dueDate}`}>
              Due: {new Date(currentValues.due_date).toLocaleDateString()}
            </div>
          )}
          <div className={`${styles.metadataItem} ${styles.marks}`}>
            Total Marks: {currentValues.marks}
          </div>
          <div className={`${styles.metadataItem} ${styles.weight}`}>
            Assignment Weight: {currentValues.weighting}%
          </div>
        </div>
      </div>
    </div>
  );
}
