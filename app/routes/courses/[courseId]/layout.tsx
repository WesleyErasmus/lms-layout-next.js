// import CourseNavbar from "@/app/components/CourseNavbar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {/* <CourseNavbar />  */}
      <div>{children}</div>
    </div>
  );
};

export default layout;
