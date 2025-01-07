"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "./Chat.module.css";
import type {
  Student,
  Conversation,
  Message,
  ChatProps,
} from "../types/chats.type";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [conversationsResponse, studentsResponse] = await Promise.all([
          supabase
            .from("conversations")
            .select(
              `
              id,
              title,
              is_group,
              updated_at,
              conversation_participants!inner(
                user_id,
                student:students!inner(
                  id,
                  first_name,
                  last_name,
                  email
                )
              )
            `
            )
            .order("updated_at", { ascending: false }),
          supabase
            .from("students")
            .select("id, first_name, last_name, email")
            .order("first_name"),
        ]);

        if (conversationsResponse.error) throw conversationsResponse.error;
        if (studentsResponse.error) throw studentsResponse.error;

        setConversations(conversationsResponse.data as Conversation[]);
        setStudents(studentsResponse.data);
        setShowStudents(!conversationsResponse.data.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!currentConversation) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", currentConversation)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentConversation || !newMessage.trim()) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      conversation_id: currentConversation,
      sender_id: currentUserId,
      content: newMessage.trim(),
      status: "sending",
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [...current, tempMessage]);
    setNewMessage("");
    scrollToBottom();

    try {
      await supabase.from("messages").insert({
        conversation_id: currentConversation,
        sender_id: currentUserId,
        content: tempMessage.content,
        status: "sent",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((current) =>
        current.filter((msg) => msg.id !== tempMessage.id)
      );
    }
  };

  const startNewConversation = async (recipientId: string) => {
    try {
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("is_group", false)
        .contains("participant_ids", [currentUserId, recipientId]);

      if (existingConversation?.length) {
        setCurrentConversation(existingConversation[0].id);
        setShowStudents(false);
        return;
      }

      const { data: newConversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          is_group: false,
          created_by: currentUserId,
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      await supabase.from("conversation_participants").insert([
        { conversation_id: newConversation.id, user_id: currentUserId },
        { conversation_id: newConversation.id, user_id: recipientId },
      ]);

      setCurrentConversation(newConversation.id);
      setShowStudents(false);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <aside className={styles.sidebar}>
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
            ? students
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
            : conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`${styles.conversationItem} ${
                    currentConversation === conversation.id ? styles.active : ""
                  }`}
                  onClick={() => setCurrentConversation(conversation.id)}
                >
                  <div className={styles.conversationHeader}>
                    {conversation.is_group
                      ? conversation.title
                      : conversation.conversation_participants
                          .filter((p) => p.user_id !== currentUserId)
                          .map(
                            (p) =>
                              `${p.student.first_name} ${p.student.last_name}`
                          )
                          .join(", ")}
                  </div>
                  <div className={styles.lastMessage}>
                    {new Date(conversation.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
        </div>
      </aside>

      <main className={styles.chatMain}>
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
            <form onSubmit={handleSendMessage} className={styles.messageForm}>
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
      </main>
    </div>
  );
}
