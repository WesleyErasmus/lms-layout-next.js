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

  if (isEditing) {
    return (
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <input
            className={styles.editInput}
            value={currentValues.title}
            onChange={(e) => {
              e.stopPropagation();
              onEditChange(assignment.id, "title", e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </h3>
        <div className={styles.cardContent}>
          <div className={styles.brief}>
            <strong>Brief:</strong>{" "}
            <input
              className={styles.editInput}
              value={currentValues.brief || ""}
              onChange={(e) => {
                e.stopPropagation();
                onEditChange(assignment.id, "brief", e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className={styles.description}>
            <input
              className={styles.editInput}
              value={currentValues.description || ""}
              onChange={(e) => {
                e.stopPropagation();
                onEditChange(assignment.id, "description", e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className={styles.metadata}>
            <div className={styles.dueDate}>
              <input
                className={styles.editInput}
                type="date"
                value={
                  currentValues.due_date
                    ? new Date(currentValues.due_date)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  e.stopPropagation();
                  onEditChange(assignment.id, "due_date", e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  width: "100%",
                  cursor: "pointer",
                }}
              />
            </div>
            <div className={styles.marks}>
              Total Marks:{" "}
              <input
                className={styles.editInput}
                type="number"
                value={currentValues.marks}
                onChange={(e) => {
                  e.stopPropagation();
                  onEditChange(assignment.id, "marks", Number(e.target.value));
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className={styles.weight}>
              Assignment Weight:{" "}
              <input
                className={styles.editInput}
                type="number"
                value={currentValues.weighting}
                onChange={(e) => {
                  e.stopPropagation();
                  onEditChange(
                    assignment.id,
                    "weighting",
                    Number(e.target.value)
                  );
                }}
                onClick={(e) => e.stopPropagation()}
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
            <div className={styles.dueDate}>
              Due: {new Date(currentValues.due_date).toLocaleDateString()}
            </div>
          )}
          <div className={styles.marks}>Total Marks: {currentValues.marks}</div>
          <div className={styles.weight}>
            Assignment Weight: {currentValues.weighting}%
          </div>
        </div>
      </div>
    </div>
  );
}

// import {
//   type Assignment,
//   type EditableAssignment,
// } from "@/app/types/course.type";
// import styles from "../styles/AssignmentCard.module.css";

// interface AssignmentCardProps {
//   assignment: Assignment | EditableAssignment;
// }

// export default function AssignmentCard({
//   assignment,
// }: AssignmentCardProps) {
//   const isEditableAssignment = (
//     assignment: Assignment | EditableAssignment
//   ): assignment is EditableAssignment => {
//     return (assignment as EditableAssignment).title instanceof Object;
//   };

//   return (
//     <div className={styles.card}>
//       <h3 className={styles.cardTitle}>
//         {isEditableAssignment(assignment) ? assignment.title : assignment.title}
//       </h3>
//       <div className={styles.cardContent}>
//         <div className={styles.brief}>
//           <strong>Brief:</strong>{" "}
//           {isEditableAssignment(assignment)
//             ? assignment.brief
//             : assignment.brief}
//         </div>
//         <div className={styles.description}>
//           {isEditableAssignment(assignment)
//             ? assignment.description
//             : assignment.description}
//         </div>
//         <div className={styles.metadata}>
//           {assignment.due_date && (
//             <div className={styles.dueDate}>
//               {isEditableAssignment(assignment)
//                 ? assignment.due_date
//                 : `Due: ${new Date(assignment.due_date).toLocaleDateString()}`}
//             </div>
//           )}
//           <div className={styles.marks}>
//             Total Marks:{" "}
//             {isEditableAssignment(assignment)
//               ? assignment.marks
//               : assignment.marks}
//           </div>
//           <div className={styles.weight}>
//             Assignment Weight:{" "}
//             {isEditableAssignment(assignment)
//               ? assignment.weighting
//               : `${assignment.weighting}%`}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
