export interface Assignment {
  id: string;
  title: string;
  marks: number;
  weighting: number;
  due_date: Date
  dueDate?: Date
  brief: string
  description: string
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Enrollment {
  student_id: string;
  students: Student;
}

export interface Grade {
  student_id: string;
  assignment_id: string;
  marks_achieved: number;
}

