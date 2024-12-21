import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import "./styles/variables.css";
import styles from "./layout.module.css";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js LMS",
  description: "Playing around in Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: courses, error } = await supabase.from("courses").select("*");

  if (error) {
    console.error("Error fetching courses:", error);
    return <div>Error loading courses</div>;
  }
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className={styles.dashboardLayout}>
          <aside className={styles.sidebar}>
            <div className={styles.flexContainer}>
              <div>
                <div className={styles.jumbotron}>
                  <Link href="/" className={styles.sidebarTitle}>
                    <h1>Next.js LMS 🪐</h1>
                  </Link>
                </div>
                <nav className={styles.sidebarMenu}>
                  {courses.map((course) => (
                    <div key={course.id} className={styles.sidebarButton}>
                      <Link
                        className={styles.buttonCourseTitle}
                        href={`/routes/courses/${course.id}/assignments`}
                      >
                        {course.title}
                      </Link>
                      <div className={styles.buttonSubLinksContainer}>
                        <Link
                          href={`/routes/courses/${course.id}/assignments`}
                          className={styles.buttonLinks}
                        >
                          <span>Assignments</span>
                        </Link>
                        <span>{" | "}</span>
                        <Link
                          href={`/routes/courses/${course.id}/grades`}
                          className={styles.buttonLinks}
                        >
                          
                          <span>Grades</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </nav>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.sidebarButton} ${styles.accountButton}`}
                >
                  Account
                </button>
                <button
                  className={`${styles.sidebarButton} ${styles.logoutButton}`}
                >
                  Logout
                </button>
              </div>
            </div>
          </aside>
          <main className={styles.dashboardContent}>{children}</main>
        </div>
      </body>
    </html>
  );
}
