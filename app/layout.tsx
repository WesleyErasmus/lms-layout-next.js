import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import "./styles/variables.css";
import styles from './layout.module.css';
import Link from "next/link";
import { mockCourses } from "./data/mockCourses";

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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
                  {mockCourses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/routes/courses/${course.id}`}
                      className={styles.sidebarButton}
                    >
                      {course.id}: {course.title}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  className={`${styles.sidebarButton} ${styles.accountButton}`}
                >
                  Account
                </button>
                <button className={`${styles.sidebarButton} ${styles.logoutButton}`}>
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
