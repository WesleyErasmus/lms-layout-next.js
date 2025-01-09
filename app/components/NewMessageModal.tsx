import { useState } from "react";
import styles from "./NewMessageModal.module.css";
import type { Student } from "../types/chats.type";

interface NewMessageModalProps {
  students: Student[];
  onClose: () => void;
  onSelect: (studentId: string) => void;
}

export default function NewMessageModal({
  students,
  onClose,
  onSelect,
}: NewMessageModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>New Message</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <div className={styles.studentsList}>
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className={styles.studentItem}
                onClick={() => onSelect(student.id)}
              >
                <div className={styles.studentName}>
                  {student.first_name} {student.last_name}
                </div>
                <div className={styles.studentEmail}>{student.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
