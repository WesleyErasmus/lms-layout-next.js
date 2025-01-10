"use client";

import { ReactNode } from "react";
import styles from "../styles/ChatLayout.module.css";

interface ChatLayoutProps {
  sidebar: ReactNode;
  content: ReactNode;
}

export default function ChatLayout({ sidebar, content }: ChatLayoutProps) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>{sidebar}</aside>
      <main className={styles.main}>{content}</main>
    </div>
  );
}
