import styles from "./StudentTable.module.css";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface TableColumn {
  key: string;
  header: string;
}

interface StudentTableProps {
  title: string;
  students: Student[];
  columns: TableColumn[];
  onProfileClick?: (studentId: string) => void;
  loading?: boolean;
}

export default function StudentTable({
  title,
  students,
  columns,
  onProfileClick,
  loading = false,
}: StudentTableProps) {
  if (loading) {
    return <div className={styles.loading}>Loading students...</div>;
  }

  const renderCell = (column: TableColumn, student: Student) => {
    switch (column.key) {
      case "avatar":
        const initials = `${student.first_name[0]}${student.last_name[0]}`;
        return <div className={styles.avatar}>{initials}</div>;
      case "name":
        return (
          <span className={styles.fullName}>
            {student.first_name} {student.last_name}
          </span>
        );
      case "email":
        return <span className={styles.email}>{student.email}</span>;
      case "profile":
        return (
          <button
            className={styles.profileButton}
            onClick={() => onProfileClick?.(student.id)}
            aria-label="View profile"
          >
            <svg
              className={styles.profileIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 3h7v7" />
              <path d="M14 10L21 3" />
              <path d="M16 21H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h7" />
            </svg>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={styles.tableHeader}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                {columns.map((column) => (
                  <td
                    key={`${student.id}-${column.key}`}
                    className={styles.tableCell}
                  >
                    {renderCell(column, student)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
