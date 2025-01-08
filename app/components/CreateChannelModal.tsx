"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Course } from "@/app/types/chats.type";
import styles from "./CreateChannelModal.module.css";

interface CreateChannelModalProps {
  onClose: () => void;
  onCreateSuccess: (channelId: string) => void;
}

export default function CreateChannelModal({
  onClose,
  onCreateSuccess,
}: CreateChannelModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [channelType, setChannelType] = useState<"group" | "course">("group");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useState(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from("courses").select("*");
      if (!error && data) {
        setCourses(data);
      }
    };

    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user authentication - uncomment when user system is ready
      // const user = await supabase.auth.getUser();
      // const userId = user.data.user?.id;
      // if (!userId) throw new Error("No authenticated user found");

      // Create the channel
      const { data: channel, error: channelError } = await supabase
        .from("conversations")
        .insert({
          title,
          description,
          is_public: isPublic,
          channel_type: channelType,
          course_id: channelType === "course" ? selectedCourse : null,
          created_by: "13c8bf93-01da-4809-a0be-e9735adcf9da",
          is_group: true,
        })
        .select()
        .single();

      if (channelError) throw channelError;

      /* Uncomment when conversation_participants functionality is needed
      // Add creator as participant
      const { error: participantError } = await supabase
        .from("conversation_participants")
        .insert({
          conversation_id: channel.id,
          user_id: userId,
          joined_at: new Date().toISOString(),
          last_read_at: new Date().toISOString(),
          last_message_read_at: new Date().toISOString(),
        });

      if (participantError) throw participantError;

      // If it's a course channel, add all enrolled students
      if (channelType === "course" && selectedCourse) {
        const { data: users, error: usersError } = await supabase
          .from("enrollments")
          .select(`
            student_id,
            users!inner (
              id
            )
          `)
          .eq("course_id", selectedCourse)
          .neq("student_id", userId);

        if (usersError) throw usersError;

        if (users && users.length > 0) {
          const now = new Date().toISOString();
          const participants = users.map((enrollment) => ({
            conversation_id: channel.id,
            user_id: enrollment.student_id,
            joined_at: now,
            last_read_at: now,
            last_message_read_at: now,
          }));

          const { error: bulkParticipantError } = await supabase
            .from("conversation_participants")
            .insert(participants);

          if (bulkParticipantError) throw bulkParticipantError;
        }
      }
      */

      onCreateSuccess(channel.id);
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Create New Channel</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="channelType">Channel Type</label>
            <select
              id="channelType"
              value={channelType}
              onChange={(e) =>
                setChannelType(e.target.value as "group" | "course")
              }
            >
              <option value="group">Group Channel</option>
              <option value="course">Course Channel</option>
            </select>
          </div>

          {channelType === "course" && (
            <div className={styles.formGroup}>
              <label htmlFor="course">Course</label>
              <select
                id="course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required={channelType === "course"}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="title">Channel Name</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Make channel public
            </label>
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
