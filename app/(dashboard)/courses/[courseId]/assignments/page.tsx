"use client";
import { useState, useEffect, use, Usable } from "react";
import AssignmentCard from "@/app/(dashboard)/courses/[courseId]/assignments/components/AssignmentCard";
import CreateAssessmentDialog from "@/app/(dashboard)/courses/[courseId]/assignments/components/CreateAssessmentDialog";
import Button from "@/app/components/ui/button/Button";
import Switch from "@/app/components/ui/toggle/Switch";
import { supabase } from "@/lib/supabase/client";
import type { Assignment } from "@/app/types/course.type";
import styles from "./styles/page.module.css";

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

  const handleAssignmentCreated = (newAssignment: Assignment) => {
    setAssignments((prev) => [...prev, newAssignment]);
  };

  const handleEditChange = (
    assignmentId: string,
    field: string,
    value: string | number
  ) => {
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Assignments</h1>
        <div className={styles.controls}>
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
            label="Edit Mode"
          />
          <Button onClick={() => setIsDialogOpen(true)}>
            Create Assignment
          </Button>
        </div>
      </div>

      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          isEditing={isEditing}
          editedValues={editedAssignments.get(assignment.id)}
          onEditChange={handleEditChange}
        />
      ))}

      <CreateAssessmentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        courseId={courseId}
        onAssignmentCreated={handleAssignmentCreated}
      />

      {saving && (
        <div className={styles.savingOverlay}>
          <div className={styles.savingMessage}>Saving assignments...</div>
        </div>
      )}
    </div>
  );
}
