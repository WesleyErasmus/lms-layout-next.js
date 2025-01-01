"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "./Chat.module.css";
import type { Message, Student, Conversation } from "./types";

interface ChatProps {
  currentUserId: string;
}

export default function Chat({ currentUserId }: ChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showStudents, setShowStudents] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations and students
  useEffect(() => {
    async function fetchData() {
      // Fetch conversations
      const { data: conversationsData, error: conversationsError } =
        await supabase
          .from("conversations")
          .select(
            `
          id,
          title,
          is_group,
          updated_at,
          conversation_participants(
            user_id,
            student:students(
              first_name,
              last_name
            )
          )
        `
          )
          .order("updated_at", { ascending: false });

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError);
      } else {
        setConversations(conversationsData || []);
      }

      // Fetch all students
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, first_name, last_name, email")
        .order("first_name", { ascending: true });

      if (studentsError) {
        console.error("Error fetching students:", studentsError);
      } else {
        setStudents(studentsData || []);
      }

      // Show students list if there are no conversations
      setShowStudents(!conversationsData?.length);
    }

    fetchData();
  }, []);

  // Fetch messages for current conversation
  useEffect(() => {
    if (!currentConversation) return;

    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversation)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data);
      scrollToBottom();
    }

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation:${currentConversation}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${currentConversation}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentConversation || !newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: currentConversation,
      sender_id: currentUserId,
      content: newMessage,
      status: "sent",
    });

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    setNewMessage("");
  };

  const startNewConversation = async (recipientId: string) => {
    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id, conversation_participants!inner(user_id)")
      .or(
        `and(conversation_participants.user_id.eq.${currentUserId},conversation_participants.user_id.eq.${recipientId})`
      );

    if (existingConversation?.length) {
      setCurrentConversation(existingConversation[0].id);
      setShowStudents(false);
      return;
    }

    // Create new conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        is_group: false,
      })
      .select()
      .single();

    if (conversationError) {
      console.error("Error creating conversation:", conversationError);
      return;
    }

    // Add participants
    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: conversation.id, user_id: currentUserId },
        { conversation_id: conversation.id, user_id: recipientId },
      ]);

    if (participantsError) {
      console.error("Error adding participants:", participantsError);
      return;
    }

    // Refresh conversations list
    const { data: updatedConversations } = await supabase
      .from("conversations")
      .select(
        `
        id,
        title,
        is_group,
        updated_at,
        conversation_participants(
          user_id,
          student:students(
            first_name,
            last_name
          )
        )
      `
      )
      .order("updated_at", { ascending: false });

    if (updatedConversations) {
      setConversations(updatedConversations);
    }

    setCurrentConversation(conversation.id);
    setShowStudents(false);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button
            className={styles.toggleButton}
            onClick={() => setShowStudents(!showStudents)}
          >
            {showStudents ? "Show Conversations" : "New Chat"}
          </button>
        </div>
        <div className={styles.conversationsList}>
          {showStudents
            ? // Display list of students
              students
                .filter((student) => student.id !== currentUserId)
                .map((student) => (
                  <div
                    key={student.id}
                    className={styles.conversationItem}
                    onClick={() => startNewConversation(student.id)}
                  >
                    <div className={styles.conversationHeader}>
                      {student.first_name} {student.last_name}
                    </div>
                    <div className={styles.lastMessage}>{student.email}</div>
                  </div>
                ))
            : // Display existing conversations
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`${styles.conversationItem} ${
                    currentConversation === conversation.id ? styles.active : ""
                  }`}
                  onClick={() => setCurrentConversation(conversation.id)}
                >
                  <div className={styles.conversationHeader}>
                    {conversation.is_group ? (
                      <span>{conversation.title}</span>
                    ) : (
                      <span>
                        {conversation.participants
                          .filter((p) => p.user_id !== currentUserId)
                          .map(
                            (p) =>
                              `${p.student.first_name} ${p.student.last_name}`
                          )
                          .join(", ")}
                      </span>
                    )}
                  </div>
                  <div className={styles.lastMessage}>
                    {new Date(conversation.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
        </div>
      </div>

      <div className={styles.chatMain}>
        {currentConversation ? (
          <>
            <div className={styles.messagesContainer}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${
                    message.sender_id === currentUserId
                      ? styles.sent
                      : styles.received
                  }`}
                >
                  <div className={styles.messageContent}>{message.content}</div>
                  <div className={styles.messageTime}>
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className={styles.messageForm}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className={styles.messageInput}
              />
              <button type="submit" className={styles.sendButton}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div className={styles.noChat}>
            {showStudents
              ? "Select a student to start a new conversation"
              : "Select a conversation to start chatting"}
          </div>
        )}
      </div>
    </div>
  );
}
