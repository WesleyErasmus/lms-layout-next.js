"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type CourseContextType = {
  courseId: string | null;
  courseTitle: string | null;
  setCourse: (id: string, title: string) => void;
  clearCourse: () => void;
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState<string | null>(null);

  const setCourse = (id: string, title: string) => {
    setCourseId(id);
    setCourseTitle(title);
  };

    const clearCourse = () => {
      setCourseId(null);
      setCourseTitle(null);
    };

  return (
    <CourseContext.Provider
      value={{ courseId, courseTitle, setCourse, clearCourse }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
};
