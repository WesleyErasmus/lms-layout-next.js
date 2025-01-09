"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
// import { Message, Conversation, MessageReaction } from "@/app/types/chats.type";
import { Message, Conversation } from "@/app/types/chats.type";
import { useParams } from "next/navigation";
import styles from "./ChannelChat.module.css";

export default function ChannelChat() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [channel, setChannel] = useState<Conversation | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const channelId = params.channelId as string;

    // Fetch channel details
    const fetchChannel = async () => {
      const { data: channelData, error: channelError } = await supabase
        .from("conversations")
        .select(
          `
          *,
          conversation_participants (
            user_id,
            student:students(first_name, last_name)
          )
        `
        )
        .eq("id", channelId)
        .single();

      if (channelError) {
        console.error("Error fetching channel:", channelError);
        return;
      }

      setChannel(channelData);
      setParticipants(
        channelData.conversation_participants.map((p: { user_id: string; }) => p.user_id)
      );
    };

    // Fetch messages
    const fetchMessages = async () => {
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:students(first_name, last_name),
          reactions:message_reactions(*)
        `
        )
        .eq("conversation_id", channelId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return;
      }

      setMessages(messagesData || []);
      setIsLoading(false);
      scrollToBottom();
    };

    fetchChannel();
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${channelId}`,
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
  }, [params.channelId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: params.channelId,
      content: newMessage,
      sender_id: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    setNewMessage("");
  };

  const addReaction = async (messageId: string, reaction: string) => {
    const { error } = await supabase.from("message_reactions").insert({
      message_id: messageId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      reaction,
    });

    if (error) {
      console.error("Error adding reaction:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <h2>{channel?.title || "Chat"}</h2>
        <p>{channel?.description}</p>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div key={message.id} className={styles.messageWrapper}>
            <div className={styles.message}>
              <div className={styles.messageHeader}>
                <span className={styles.sender}>
                  {message.sender.first_name} {message.sender.last_name}
                </span>
                <span className={styles.time}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className={styles.messageContent}>{message.content}</div>
              <div className={styles.reactions}>
                {message.reactions?.map((reaction) => (
                  <span key={reaction.id} className={styles.reaction}>
                    {reaction.reaction}
                  </span>
                ))}
                <button
                  className={styles.addReaction}
                  onClick={() => addReaction(message.id, "👍")}
                >
                  +
                </button>
              </div>
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
    </div>
  );
}
