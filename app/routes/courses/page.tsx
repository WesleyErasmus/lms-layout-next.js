"client-side";
import CourseCard from "@/app/components/CourseCard";

const Courses = () => {
  return (
    <div>
      <CourseCard
        image={
          "https://plus.unsplash.com/premium_photo-1679517155620-8048e22078b1?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
        title={"Front-end Frameworks (FF-01)"}
        description={
          "This is a short course designed to teach the fundamentals of building enterprise web applications using modern front-end frameworks"
        }
      />
    </div>
  );
};

export default Courses;
