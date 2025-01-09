"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import styles from "./Chat.module.css";
import NewMessageModal from "../../../components/NewMessageModal";
import CreateChannelDialog from "../../../components/ui/dialog/CreateChannelDialog";
import type {
  Student,
  Conversation,
  Message,
  ChatProps,
} from "../../../types/chats.type";

export default function Chat({ currentUserId }: ChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [conversationsResponse, studentsResponse] = await Promise.all([
  //         supabase
  //           .from("conversations")
  //           .select(
  //             `
  //             id,
  //             title,
  //             is_group,
  //             channel_type,
  //             description,
  //             is_public,
  //             updated_at,
  //             conversation_participants!inner(
  //               user_id,
  //               student:students!inner(
  //                 id,
  //                 first_name,
  //                 last_name,
  //                 email
  //               )
  //             )
  //           `
  //           )
  //           .order("updated_at", { ascending: false }),
  //         supabase
  //           .from("students")
  //           .select("id, first_name, last_name, email")
  //           .order("first_name"),
  //       ]);

  //       if (conversationsResponse.error) throw conversationsResponse.error;
  //       if (studentsResponse.error) throw studentsResponse.error;

  //       setConversations(conversationsResponse.data);
  //       setStudents(studentsResponse.data);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for currentUserId:", currentUserId);

        // First, let's check all conversations
        const { data: allConversations, error: convError } = await supabase
          .from("conversations")
          .select(
            `
            id,
            title,
            is_group,
            channel_type,
            description,
            is_public,
            updated_at,
            conversation_participants (
              user_id,
              student:students (
                id,
                first_name,
                last_name,
                email
              )
            )
          `
          )
          .order("updated_at", { ascending: false });

        console.log("All conversations:", allConversations);
        console.log("Conversations error:", convError);

        if (convError) throw convError;

        // Filter conversations based on access
        const accessibleConversations =
          allConversations?.filter((conv) => {
            // Public channels are accessible to all
            if (conv.is_group && conv.is_public) return true;

            // Check if user is a participant
            return conv.conversation_participants.some(
              (participant) => participant.user_id === currentUserId
            );
          }) || [];

        console.log("Accessible conversations:", accessibleConversations);

        setConversations(accessibleConversations);

        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("id, first_name, last_name, email")
          .order("first_name");

        if (studentsError) throw studentsError;
        console.log("Students data:", studentsData);

        setStudents(studentsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentUserId]);

  //  useEffect(() => {
  //    console.log("Conversations state updated:", conversations);
  //    console.log(
  //      "Channels:",
  //      conversations.filter((conv) => conv.is_group)
  //    );
  //    console.log(
  //      "Direct Messages:",
  //      conversations.filter((conv) => !conv.is_group)
  //    );
  //  }, [conversations]);

  useEffect(() => {
    if (!currentConversation) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select(
            `
            *,
            sender:students(first_name, last_name),
            reactions:message_reactions(*)
          `
          )
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
      const { error } = await supabase.from("messages").insert({
        conversation_id: currentConversation,
        sender_id: currentUserId,
        content: tempMessage.content,
        status: "sent",
      });

      if (error) throw error;

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", currentConversation);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((current) =>
        current.filter((msg) => msg.id !== tempMessage.id)
      );
    }
  };

  const handleNewMessageCreated = async (recipientId: string) => {
    try {
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("is_group", false)
        .contains("participant_ids", [currentUserId, recipientId]);

      if (existingConversation?.length) {
        setCurrentConversation(existingConversation[0].id);
        setShowNewMessageModal(false);
        return;
      }

      const { data: newConversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          is_group: false,
          created_by: currentUserId,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      await supabase.from("conversation_participants").insert([
        { conversation_id: newConversation.id, user_id: currentUserId },
        { conversation_id: newConversation.id, user_id: recipientId },
      ]);

      setCurrentConversation(newConversation.id);
      setShowNewMessageModal(false);
      await refreshConversations();
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const handleChannelCreated = async (channelId: string) => {
    setShowCreateChannel(false);
    setCurrentConversation(channelId);
    await refreshConversations();
  };

  const refreshConversations = async () => {
    const { data: updatedConversations } = await supabase
      .from("conversations")
      .select(
        `
        id,
        title,
        is_group,
        channel_type,
        description,
        is_public,
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
      .order("updated_at", { ascending: false });

    if (updatedConversations) {
      setConversations(updatedConversations);
    }
  };

  const channels = conversations.filter((conv) => conv.is_group);
  const directMessages = conversations.filter((conv) => !conv.is_group);

  return (
    <div className={styles.chatContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.buttonGroup}>
            <button
              className={styles.toggleButton}
              onClick={() => setShowNewMessageModal(true)}
            >
              + New Message
            </button>
            <button
              className={styles.toggleButton}
              onClick={() => setShowCreateChannel(true)}
            >
              + New Channel
            </button>
          </div>
        </div>

        <div className={styles.sidebarContent}>
          <div className={styles.sectionHeader}>Channels</div>
          <div className={styles.sectionList}>
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`${styles.sidebarItem} ${
                  currentConversation === channel.id ? styles.active : ""
                }`}
                onClick={() => setCurrentConversation(channel.id)}
              >
                # {channel.title}
              </div>
            ))}
          </div>

          <div className={styles.sectionHeader}>Direct Messages</div>
          <div className={styles.sectionList}>
            {directMessages.map((conversation) => (
              <div
                key={conversation.id}
                className={`${styles.sidebarItem} ${
                  currentConversation === conversation.id ? styles.active : ""
                }`}
                onClick={() => setCurrentConversation(conversation.id)}
              >
                {conversation.conversation_participants
                  .filter((p) => p.user_id !== currentUserId)
                  .map((p) => `${p.student.first_name} ${p.student.last_name}`)
                  .join(", ")}
              </div>
            ))}
          </div>
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
                  {message.sender && (
                    <div>
                      <div className={styles.messageSender}>
                        {message.sender.first_name} {message.sender.last_name}
                        <span className={styles.messageTime}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className={styles.messageContent}>{message.content}</div>
                  {message.reactions && message.reactions.length > 0 && (
                    <div className={styles.messageReactions}>
                      {message.reactions.map((reaction) => (
                        <span key={reaction.id} className={styles.reaction}>
                          {reaction.reaction}
                        </span>
                      ))}
                    </div>
                  )}
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
            Select a conversation to start chatting
          </div>
        )}
      </main>

      {showNewMessageModal && (
        <NewMessageModal
          students={students.filter((student) => student.id !== currentUserId)}
          onClose={() => setShowNewMessageModal(false)}
          onSelect={handleNewMessageCreated}
        />
      )}

      {showCreateChannel && (
        <CreateChannelDialog
          onClose={() => setShowCreateChannel(false)}
          onCreateSuccess={handleChannelCreated}
        />
      )}
    </div>
  );
}
