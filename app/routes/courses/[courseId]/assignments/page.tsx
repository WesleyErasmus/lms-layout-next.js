"use client";

import { useState, useEffect, use } from "react";
import ExpandableAssignment from "@/app/components/ExpandableAssignment";
import Dialog from "@/app/components/Dialog";
import Button from "@/app/components/Button";
import { supabase } from "@/lib/supabase/client";
import type { Assignment } from "@/app/types/course.types";
import styles from "./assignments.module.css";

export default function CourseAssignmentsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const courseId = use(params).courseId;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    brief: "",
    marks: 0,
    weighting: 0,
    due_date: "",
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      const { data: course, error } = await supabase
        .from("courses")
        .select("*, assignments(*)")
        .eq("id", courseId)
        .single();

      if (error) {
        console.error("Error fetching course:", error);
        return;
      }

      setAssignments(course.assignments);
    };

    fetchAssignments();
  }, [courseId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from("assignments")
      .insert({
        ...formData,
        course_id: courseId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating assignment:", error);
      return;
    }

    setAssignments((prev) => [...prev, data]);
    setIsDialogOpen(false);
    setFormData({
      id: "",
      title: "",
      description: "",
      brief: "",
      marks: 0,
      weighting: 0,
      due_date: "",
    });
    setHasUnsavedChanges(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Assignments</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Create Assignment</Button>
      </div>

      {assignments.map((assignment) => (
        <ExpandableAssignment
          key={assignment.id}
          assignment={{
            ...assignment,
            dueDate: assignment.due_date
              ? new Date(assignment.due_date)
              : undefined,
          }}
        />
      ))}

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create Assignment"
        hasUnsavedChanges={hasUnsavedChanges}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="id">Assignment ID</label>
            <input
              id="id"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="brief">Brief</label>
            <input
              id="brief"
              name="brief"
              value={formData.brief}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="marks">Marks</label>
            <input
              id="marks"
              name="marks"
              type="number"
              value={formData.marks}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="weighting">Weighting</label>
            <input
              id="weighting"
              name="weighting"
              type="number"
              value={formData.weighting}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="due_date">Due Date</label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleInputChange}
            />
          </div>
          <Button type="submit">Create</Button>
        </form>
      </Dialog>
    </div>
  );
}
