
import StudentProfile from "@/app/(dashboard)/students/components/StudentProfile";

export default function StudentProfilePage({
  params,
}: {
  params: { studentId: string };
}) {
  return (
    <div>
      <StudentProfile studentId={params.studentId} />
    </div>
  );
}
