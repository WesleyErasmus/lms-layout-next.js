"use client";

import styles from "../styles/ChatSidebar.module.css";
import { Conversation } from "../../../types/chats.type";

interface ChatSidebarProps {
  channels: Conversation[];
  directMessages: Conversation[];
  currentConversation: string | null;
  currentUserId: string;
  onConversationSelect: (id: string) => void;
  onNewMessage: () => void;
  onNewChannel: () => void;
}

export default function ChatSidebar({
  channels,
  directMessages,
  currentConversation,
  currentUserId,
  onConversationSelect,
  onNewMessage,
  onNewChannel,
}: ChatSidebarProps) {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.buttonGroup}>
          <button className={styles.button} onClick={onNewMessage}>
            + New Message
          </button>
          <button className={styles.button} onClick={onNewChannel}>
            + New Channel
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>Channels</div>
          <div className={styles.list}>
            {channels.map((channel) => (
              <div
                key={channel.id}
                className={`${styles.item} ${
                  currentConversation === channel.id ? styles.active : ""
                }`}
                onClick={() => onConversationSelect(channel.id)}
              >
                # {channel.title}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>Direct Messages</div>
          <div className={styles.list}>
            {directMessages.map((conversation) => (
              <div
                key={conversation.id}
                className={`${styles.item} ${
                  currentConversation === conversation.id ? styles.active : ""
                }`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                {conversation.conversation_participants
                  .filter((p) => p.user_id !== currentUserId)
                  .map((p) => `${p.student.first_name} ${p.student.last_name}`)
                  .join(", ")}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
