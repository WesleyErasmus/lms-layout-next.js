import { useMemo } from "react";
import styles from "./Avatar.module.css";

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string | null;
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function Avatar({
  firstName = "",
  lastName = "",
  profileImageUrl,
  size = "medium",
  className = "",
}: AvatarProps) {
  const initials = useMemo(() => {
    const firstInitial = firstName ? firstName[0] : "";
    const lastInitial = lastName ? lastName[0] : "";
    return (firstInitial + lastInitial).toUpperCase();
  }, [firstName, lastName]);

  const getRandomColor = useMemo(() => {
    const name = firstName + lastName;
    const colors = [
      "#FF6B6B", 
      "#4ECDC4", 
      "#45B7D1", 
      "#96CEB4", 
      "#D4A5A5", 
      "#9B59B6", 
      "#E67E22", 
      "#1ABC9C", 
    ];
    const index = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  }, [firstName, lastName]);

  if (profileImageUrl) {
    return (
      <div className={`${styles.avatar} ${styles[size]} ${className}`}>
        <img
          src={profileImageUrl}
          alt={`${firstName} ${lastName}`}
          className={styles.image}
        />
      </div>
    );
  }

  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${className}`}
      style={{ backgroundColor: getRandomColor }}
    >
      <span className={styles.initials}>{initials}</span>
    </div>
  );
}
