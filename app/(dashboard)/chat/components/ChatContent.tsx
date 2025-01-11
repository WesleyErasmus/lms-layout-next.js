import { useRef } from "react";
import styles from "../styles/ChatContent.module.css";
import { Message } from "../../../types/chats.type";
import Avatar from "@/app/components/ui/avatar/Avatar";

interface ChatContentProps {
  messages: Message[];
  currentUserId: string;
  newMessage: string;
  onNewMessageChange: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

export default function ChatContent({
  messages,
  currentUserId,
  newMessage,
  onNewMessageChange,
  onSendMessage,
}: ChatContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className={styles.messages}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.sender_id === currentUserId
                ? styles.sent
                : styles.received
            }`}
          >
            <div className={styles.messageContainer}>
              <Avatar
                firstName={message.sender?.first_name}
                lastName={message.sender?.last_name}
                // profileImageUrl={message.sender?.profile_image_url}
                size="medium"
                className={styles.messageAvatar}
              />
              <div className={styles.messageContent}>
                {message.sender && (
                  <div className={styles.messageHeader}>
                    <span className={styles.sender}>
                      {message.sender.first_name} {message.sender.last_name}
                    </span>
                    <span className={styles.time}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                <div className={styles.content}>{message.content}</div>
                {message.reactions && message.reactions.length > 0 && (
                  <div className={styles.reactions}>
                    {message.reactions.map((reaction) => (
                      <span key={reaction.id} className={styles.reaction}>
                        {reaction.reaction}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={onSendMessage} className={styles.form}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onNewMessageChange(e.target.value)}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Send
        </button>
      </form>
    </>
  );
}
