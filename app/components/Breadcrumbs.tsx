"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useNavigation } from "../contexts/NavigationContext";
import { useCourse } from "../contexts/CourseContext";
import { supabase } from "@/lib/supabase/client";
import styles from "./Breadcrumbs.module.css";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { breadcrumbs, setBreadcrumbs } = useNavigation();
  const { courseTitle } = useCourse();
  const [studentName, setStudentName] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentName = async (studentId: string) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("id", studentId)
          .single();

        if (error) throw error;
        if (data) {
          setStudentName(`${data.first_name} ${data.last_name}`);
        }
      } catch (error) {
        console.error("Error fetching student:", error);
        setStudentName(null);
      }
    };

    const generateBreadcrumbs = async () => {
      const pathSegments = pathname
        .split("/")
        .filter((segment) => segment !== "" && segment !== "routes");

      const breadcrumbItems: { label: string; path: string }[] = [];
      let currentPath = "/routes";

      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        currentPath += `/${segment}`;

        if (segment === "courses" && courseTitle) {
          breadcrumbItems.push({
            label: "Courses",
            path: "/",
          });
        } else if (segment === "assignments") {
          breadcrumbItems.push({
            label: "Assignments",
            path: currentPath,
          });
        } else if (segment === "grades") {
          breadcrumbItems.push({
            label: "Grades",
            path: currentPath,
          });
        } else if (segment === "students") {
          breadcrumbItems.push({
            label: "Students",
            path: "/students",
          });
        } else if (i > 0 && pathSegments[i - 1] === "students") {
          await fetchStudentName(segment);
          breadcrumbItems.push({
            label: studentName || `_`,
            path: currentPath,
          });
        }
      }

      if (courseTitle) {
        const courseIndex = breadcrumbItems.findIndex(
          (item) => item.label === "Courses"
        );
        if (courseIndex !== -1) {
          breadcrumbItems.splice(courseIndex + 1, 0, {
            label: courseTitle,
            path: `/courses/${pathSegments[1]}`,
          });
        }
      }

      setBreadcrumbs(breadcrumbItems);
    };

    generateBreadcrumbs();
  }, [pathname, courseTitle, setBreadcrumbs, studentName]);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <ol>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={item.path}>
              {isLast ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <>
                  <Link href={item.path}>{item.label}</Link>
                  <span className={styles.separator}>/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
