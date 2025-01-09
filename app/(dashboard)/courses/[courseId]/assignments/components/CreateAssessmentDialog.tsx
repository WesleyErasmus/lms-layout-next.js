import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Assignment } from "@/app/types/course.type";
import styles from "../styles/CreateAssessmentDialog.module.css";
import Button from "@/app/components/ui/button/Button";

interface CreateAssessmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onAssignmentCreated: (newAssignment: Assignment) => void;
}

export default function CreateAssessmentDialog({
  isOpen,
  onClose,
  courseId,
  onAssignmentCreated,
}: CreateAssessmentDialogProps) {
  const [shouldShow, setShouldShow] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    brief: "",
    marks: 0,
    weighting: 0,
    due_date: "",
  });

  useEffect(() => {
    setShouldShow(isOpen);
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirm) return;
    }
    resetForm();
    onClose();
  };

  const resetForm = () => {
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
      alert("Failed to create assignment. Please try again.");
      return;
    }

    onAssignmentCreated(data);
    resetForm();
    onClose();
  };

  if (!shouldShow) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2>Create Assignment</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.content}>
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
        </div>
      </div>
    </div>
  );
}
