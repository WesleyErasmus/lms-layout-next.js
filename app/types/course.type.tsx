import { JSX } from "react";

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

export interface EditableAssignment
  extends Omit<
    Assignment,
    "title" | "marks" | "weighting" | "due_date" | "brief" | "description"
  > {
  title: JSX.Element;
  marks: JSX.Element;
  weighting: JSX.Element;
  due_date: JSX.Element;
  brief: JSX.Element;
  description: JSX.Element;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string | null;
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

