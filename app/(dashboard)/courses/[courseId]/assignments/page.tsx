"use client";

import { useState, useEffect, use, Usable } from "react";
import ExpandableAssignment from "@/app/components/ExpandableAssignment";
import CreateAssessmentDialog from "@/app/components/ui/dialog/CreateAssessmentDialog";
import Button from "@/app/components/ui/button/Button";
import Switch from "@/app/components/ui/toggle/Switch";
import { supabase } from "@/lib/supabase/client";
import type { Assignment, EditableAssignment } from "@/app/types/course.type";
import styles from "./assignments.module.css";

type CourseParams = {
  courseId: string;
};

export default function CourseAssignmentsPage({
  params,
}: {
  params: Usable<CourseParams>;
}) {
  const courseId = (use(params) as { courseId: string }).courseId;
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editedAssignments, setEditedAssignments] = useState(
    new Map<string, Partial<Assignment>>()
  );
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
  const [saving, setSaving] = useState(false);

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

  const handleEditChange = (
    assignmentId: string,
    field: string,
    value: string | number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();
    setEditedAssignments((prev) => {
      const newMap = new Map(prev);
      const currentEdits = newMap.get(assignmentId) || {};
      newMap.set(assignmentId, {
        ...currentEdits,
        [field]: value,
      });
      return newMap;
    });
  };

  const saveEdits = async () => {
    setSaving(true);
    try {
      const updates = Array.from(editedAssignments.entries()).map(
        ([id, changes]) => {
          const originalAssignment = assignments.find(
            (assignment) => assignment.id === id
          );

          if (!originalAssignment) {
            throw new Error(`Assignment with ID ${id} not found`);
          }

          return {
            ...originalAssignment,
            ...changes,
          };
        }
      );

      const { error } = await supabase.from("assignments").upsert(updates);

      if (error) throw error;

      const updatedAssignments = assignments.map((assignment) => {
        const changes = editedAssignments.get(assignment.id);
        return changes ? { ...assignment, ...changes } : assignment;
      });

      setAssignments(updatedAssignments);
      setEditedAssignments(new Map());
    } catch (error) {
      console.error("Error saving assignments:", error);
      alert(
        "Failed to save assignments. Please check the console for details."
      );
    } finally {
      setSaving(false);
    }
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

  const renderEditableAssignment = (assignment: Assignment) => {
    const editedValues = editedAssignments.get(assignment.id) || {};
    const currentValues = {
      ...assignment,
      ...editedValues,
    };

    return {
      ...currentValues,
      title: (
        <input
          className={styles.editInput}
          value={currentValues.title}
          onChange={(e) => {
            e.stopPropagation();
            handleEditChange(assignment.id, "title", e.target.value, e);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      description: (
        <input
          className={styles.editInput}
          value={currentValues.description || ""}
          onChange={(e) => {
            e.stopPropagation();
            handleEditChange(assignment.id, "description", e.target.value, e);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      brief: (
        <input
          className={styles.editInput}
          value={currentValues.brief || ""}
          onChange={(e) => {
            e.stopPropagation();
            handleEditChange(assignment.id, "brief", e.target.value, e);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      marks: (
        <input
          className={styles.editInput}
          type="number"
          value={currentValues.marks}
          onChange={(e) => {
            e.stopPropagation();
            handleEditChange(assignment.id, "marks", Number(e.target.value), e);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      weighting: (
        <input
          className={styles.editInput}
          type="number"
          value={currentValues.weighting}
          onChange={(e) => {
            e.stopPropagation();
            handleEditChange(
              assignment.id,
              "weighting",
              Number(e.target.value),
              e
            );
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      due_date: (
        <input
          className={styles.editInput}
          type="date"
          value={
            currentValues.due_date
              ? new Date(currentValues.due_date).toISOString().split("T")[0]
              : ""
          }
          onChange={(e) => {
            e.stopPropagation();
            handleEditChange(assignment.id, "due_date", e.target.value, e);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Assignments</h1>
        <div className={styles.controls}>
          <div className={styles.switchContainer}>
            <span>Edit Mode</span>
            <Switch
              checked={isEditing}
              onCheckedChange={(checked) => {
                if (!checked && editedAssignments.size > 0) {
                  const confirmSave = window.confirm(
                    "Would you like to save your changes?"
                  );
                  if (confirmSave) {
                    saveEdits();
                  } else {
                    setEditedAssignments(new Map());
                  }
                }
                setIsEditing(checked);
              }}
            />
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            Create Assignment
          </Button>
        </div>
      </div>

      {assignments.map((assignment) => (
        <ExpandableAssignment
          key={assignment.id}
          assignment={
            isEditing
              ? (renderEditableAssignment(assignment) as EditableAssignment)
              : {
                  ...assignment,
                  dueDate: assignment.due_date
                    ? new Date(assignment.due_date)
                    : undefined,
                }
          }
          forceExpanded={isEditing}
        />
      ))}

      <CreateAssessmentDialog
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
      </CreateAssessmentDialog>

      {saving && (
        <div className={styles.savingOverlay}>
          <div className={styles.savingMessage}>Saving assignments...</div>
        </div>
      )}
    </div>
  );
}
