import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "./layout.module.css";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import Breadcrumbs from "../components/ui/breadcrumbs/Breadcrumbs";
import { AuthProvider } from "../contexts/AuthContext";
import { CourseProvider } from "../contexts/CourseContext";
import { NavigationProvider } from "../contexts/NavigationContext";
import LogoutButton from "../components/ui/button/LogoutButton";

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

export default async function DashboardLayout({
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
    <html lang="en" data-theme="light">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <CourseProvider>
            <NavigationProvider>
              <div className={styles.dashboardLayout}>
                <nav className={styles.navbar}>
                  <div className={styles.navbarInner}>
                    <div className={styles.jumbotron}>
                      <Link href="/" className={styles.sidebarTitle}>
                        <h1>Next.js LMS</h1>
                      </Link>
                    </div>
                    <div className={styles.navbarContentFlex}>
                      <div>
                        <Breadcrumbs />
                      </div>
                      <div className={styles.navbarRightMenu}>
                        <LogoutButton />
                      </div>
                    </div>
                  </div>
                </nav>
                <aside className={styles.sidebar}>
                  <div className={styles.flexContainer}>
                    <div>
                      <nav className={styles.sidebarMenu}>
                        {courses.map((course) => (
                          <div key={course.id} className={styles.sidebarButton}>
                            <Link
                              className={styles.buttonCourseTitle}
                              href={`/courses/${course.id}/assignments`}
                            >
                              {course.title}
                            </Link>
                            <div className={styles.buttonSubLinksContainer}>
                              <Link
                                href={`/courses/${course.id}/assignments`}
                                className={styles.buttonLinks}
                              >
                                <span>Assignments</span>
                              </Link>
                              <span>{" | "}</span>
                              <Link
                                href={`/courses/${course.id}/students`}
                                className={styles.buttonLinks}
                              >
                                <span>Students</span>
                              </Link>
                              <span>{" | "}</span>
                              <Link
                                href={`/courses/${course.id}/grades`}
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
                      <Link
                        href={`/students`}
                        className={styles.buttonCourseTitle}
                      >
                        <button
                          className={`${styles.sidebarButton} ${styles.accountButton}`}
                        >
                          Students
                        </button>
                      </Link>
                      <Link href={`/chat`} className={styles.buttonCourseTitle}>
                        <button
                          className={`${styles.sidebarButton} ${styles.logoutButton}`}
                        >
                          Messages
                        </button>
                      </Link>
                    </div>
                  </div>
                </aside>
                <main className={styles.dashboardContent}>{children}</main>
              </div>
            </NavigationProvider>
          </CourseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
