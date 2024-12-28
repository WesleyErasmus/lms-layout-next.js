
import StudentProfile from "@/app/components/StudentProfile";
import styles from "./page.module.css";

export default function StudentProfilePage({
  params,
}: {
  params: { studentId: string };
}) {
  return (
    <div className={styles.pageContainer}>
      <StudentProfile studentId={params.studentId} />
    </div>
  );
}
