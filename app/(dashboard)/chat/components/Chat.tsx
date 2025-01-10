"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import ChatLayout from "./ChatLayout";
import ChatSidebar from "./ChatSidebar";
import ChatContent from "./ChatContent";
import CreateChannelDialog from "./CreateChannelDialog";
import NewMessageModal from "./NewMessageModal";
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

  const createCompleteMessage = (
    content: string,
    currentUser: Student | undefined
  ): Message => {
    return {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversation!,
      sender_id: currentUserId,
      content: content,
      status: "sending",
      created_at: new Date().toISOString(),
      sender: currentUser,
      reactions: [],
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for currentUserId:", currentUserId);

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

        if (convError) throw convError;

        const typedConversations =
          allConversations as unknown as Conversation[];

        const accessibleConversations =
          typedConversations?.filter((conv) => {
            if (conv.is_group) {
              return (
                conv.is_public ||
                conv.conversation_participants.some(
                  (participant) => participant.user_id === currentUserId
                )
              );
            }
            return conv.conversation_participants.some(
              (participant) => participant.user_id === currentUserId
            );
          }) || [];

        setConversations(accessibleConversations);

        const { data: studentsData, error: studentsError } = await supabase
          .from("students")
          .select("id, first_name, last_name, email")
          .order("first_name");

        if (studentsError) throw studentsError;

        setStudents((studentsData as Student[]) || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentUserId]);

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
          if (payload.new.sender_id !== currentUserId) {
            fetchMessages();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversation, currentUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentConversation || !newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    const currentUser = students.find((s) => s.id === currentUserId);
    const optimisticMessage = createCompleteMessage(
      messageContent,
      currentUser
    );
    setMessages((current) => [...current, optimisticMessage]);

    try {
      const { data: insertedMessage, error: insertError } = await supabase
        .from("messages")
        .insert({
          conversation_id: currentConversation,
          sender_id: currentUserId,
          content: messageContent,
          status: "sent",
        })
        .select(
          `
          *,
          sender:students(first_name, last_name),
          reactions:message_reactions(*)
        `
        )
        .single();

      if (insertError) throw insertError;

      setMessages((current) =>
        current.map((msg) =>
          msg.id === optimisticMessage.id ? insertedMessage : msg
        )
      );

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", currentConversation);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((current) =>
        current.filter((msg) => msg.id !== optimisticMessage.id)
      );
    }
  };

  const handleNewMessageCreated = async (recipientId: string) => {
    try {
      const { data: sharedConversations, error: fetchError } = await supabase
        .from("conversation_participants")
        .select(
          `
          conversation_id,
          conversations!inner (
            is_group,
            id
          )
        `
        )
        .eq("user_id", currentUserId)
        .eq("conversations.is_group", false);

      if (fetchError) throw fetchError;

      if (sharedConversations && sharedConversations.length > 0) {
        const conversationIds = sharedConversations.map(
          (c) => c.conversation_id
        );

        const { data: existingConversation, error: checkError } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", recipientId)
          .in("conversation_id", conversationIds)
          .single();

        if (checkError && checkError.code !== "PGRST116") throw checkError;

        if (existingConversation) {
          setCurrentConversation(existingConversation.conversation_id);
          setShowNewMessageModal(false);
          return;
        }
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

      const now = new Date().toISOString();
      const { error: participantsError } = await supabase
        .from("conversation_participants")
        .insert([
          {
            conversation_id: newConversation.id,
            user_id: currentUserId,
            joined_at: now,
            last_read_at: now,
          },
          {
            conversation_id: newConversation.id,
            user_id: recipientId,
            joined_at: now,
            last_read_at: now,
          },
        ]);

      if (participantsError) {
        await supabase
          .from("conversations")
          .delete()
          .eq("id", newConversation.id);
        throw participantsError;
      }

      setCurrentConversation(newConversation.id);
      setShowNewMessageModal(false);
      await refreshConversations();
    } catch (error) {
      console.error("Error managing conversation:", error);
    }
  };

  const handleChannelCreated = async (channelId: string) => {
    setShowCreateChannel(false);
    setCurrentConversation(channelId);
    await refreshConversations();
  };

  const refreshConversations = async () => {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      const typedConversations = data as unknown as Conversation[];

      const accessibleConversations =
        typedConversations?.filter((conv) => {
          if (conv.is_group) {
            return (
              conv.is_public ||
              conv.conversation_participants.some(
                (participant) => participant.user_id === currentUserId
              )
            );
          }
          return conv.conversation_participants.some(
            (participant) => participant.user_id === currentUserId
          );
        }) || [];

      setConversations(accessibleConversations);
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    }
  };

  const channels = conversations.filter((conv) => conv.is_group);
  const directMessages = conversations.filter((conv) => !conv.is_group);

  const sidebar = (
    <ChatSidebar
      channels={channels}
      directMessages={directMessages}
      currentConversation={currentConversation}
      currentUserId={currentUserId}
      onConversationSelect={setCurrentConversation}
      onNewMessage={() => setShowNewMessageModal(true)}
      onNewChannel={() => setShowCreateChannel(true)}
    />
  );

  const content = currentConversation ? (
    <ChatContent
      messages={messages}
      currentUserId={currentUserId}
      newMessage={newMessage}
      onNewMessageChange={setNewMessage}
      onSendMessage={handleSendMessage}
    />
  ) : (
    <div>Select a conversation to start chatting</div>
  );

  return (
    <>
      <ChatLayout sidebar={sidebar} content={content} />

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
    </>
  );
}
