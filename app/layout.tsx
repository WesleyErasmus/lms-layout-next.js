import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles/dashboard-layout.css";
import Link from "next/link";

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

interface MenuItem {
  menuItemName: string;
  link: string;
}

const menuItems: MenuItem[] = [
  { menuItemName: "Courses", link: "/routes/courses" },
  { menuItemName: "Modules", link: "/routes/modules" },
  { menuItemName: "Assessments", link: "/routes/assessments" },
  { menuItemName: "Resources", link: "/routes/resources" },
  { menuItemName: "Classrooms", link: "/routes/classrooms" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="dashboard-layout">
          <aside className="sidebar">
            <div className="sidebar-inner-flex">
              <div>
                <div className="sidebar-jumbotron">
                  <Link href="/" className="sidebar-title">
                    <h1>Next.js LMS 🪐</h1>
                  </Link>
                </div>
                <nav className="sidebar-menu-container">
                  {menuItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.link}
                      className="sidebar-menu-button"
                    >
                      {item.menuItemName}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="sidebar-button-group">
                <button className="sidebar-menu-button settings-button">
                  Settings
                </button>
                <button className="sidebar-menu-button logout-button">
                  Logout
                </button>
              </div>
            </div>
          </aside>
          <main className="dashboard-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
