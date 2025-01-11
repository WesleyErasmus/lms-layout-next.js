"use client"

import { useRouter } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/auth-client";
import { useState } from "react";
import styles from "./LogoutButton.module.css";

const LogoutButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createAuthClient();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      data-loading={isLoading}
      className={styles.logoutButton}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
};

export default LogoutButton;
