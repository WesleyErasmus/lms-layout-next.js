export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate?: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  assignments: Assignment[];
  students: number;
}

export const mockCourses: Course[] = [
  {
    id: "cs101",
    title: "Introduction to Programming",
    description: "Learn the fundamentals of programming using Python",
    students: 45,
    assignments: [
      {
        id: "cs101-assign1",
        title: "Python Basics Homework",
        description: "Create a simple calculator using Python functions",
        dueDate: new Date("2024-02-15"),
      },
      {
        id: "cs101-assign2",
        title: "Data Structures Mini-Project",
        description:
          "Implement a basic list and dictionary manipulation program",
        dueDate: new Date("2024-03-01"),
      },
    ],
  },
  {
    id: "web-dev-200",
    title: "Full Stack Web Development",
    description:
      "Comprehensive course covering frontend and backend technologies",
    students: 62,
    assignments: [
      {
        id: "web-dev-assign1",
        title: "Frontend Design Challenge",
        description:
          "Create a responsive landing page using HTML, CSS, and JavaScript",
        dueDate: new Date("2024-02-20"),
      },
      {
        id: "web-dev-assign2",
        title: "Backend API Development",
        description: "Build a RESTful API with Express.js and MongoDB",
        dueDate: new Date("2024-03-10"),
      },
    ],
  },
  {
    id: "data-sci-301",
    title: "Data Science Fundamentals",
    description:
      "Introduction to data analysis, machine learning, and statistical modeling",
    students: 38,
    assignments: [
      {
        id: "data-sci-assign1",
        title: "Data Cleaning Project",
        description: "Prepare and clean a real-world dataset using Pandas",
        dueDate: new Date("2024-02-25"),
      },
    ],
  },
  {
    id: "cyber-sec-401",
    title: "Cybersecurity Essentials",
    description:
      "Learn network security, ethical hacking, and defensive strategies",
    students: 29,
    assignments: [
      {
        id: "cyber-sec-assign1",
        title: "Network Security Analysis",
        description: "Conduct a security audit of a simulated network",
        dueDate: new Date("2024-03-05"),
      },
      {
        id: "cyber-sec-assign2",
        title: "Ethical Hacking Challenge",
        description:
          "Identify and report vulnerabilities in a test environment",
        dueDate: new Date("2024-03-15"),
      },
    ],
  },
  {
    id: "ai-ml-500",
    title: "Advanced AI and Machine Learning",
    description:
      "Deep dive into artificial intelligence and machine learning algorithms",
    students: 25,
    assignments: [
      {
        id: "ai-ml-assign1",
        title: "Machine Learning Model",
        description: "Develop and train a predictive machine learning model",
        dueDate: new Date("2024-03-20"),
      },
    ],
  },
  {
    id: "cloud-comp-250",
    title: "Cloud Computing Fundamentals",
    description: "Understanding cloud infrastructure, AWS, and Azure services",
    students: 41,
    assignments: [
      {
        id: "cloud-comp-assign1",
        title: "Cloud Deployment Project",
        description: "Deploy a web application using AWS or Azure services",
        dueDate: new Date("2024-02-28"),
      },
    ],
  },
  {
    id: "mobile-dev-350",
    title: "Mobile App Development",
    description: "Create cross-platform mobile applications using React Native",
    students: 36,
    assignments: [
      {
        id: "mobile-dev-assign1",
        title: "Mobile UI Design",
        description: "Design and prototype a mobile application interface",
        dueDate: new Date("2024-03-08"),
      },
      {
        id: "mobile-dev-assign2",
        title: "React Native App Development",
        description: "Build a functional mobile app with React Native",
        dueDate: new Date("2024-03-22"),
      },
    ],
  },
  {
    id: "blockchain-450",
    title: "Blockchain and Cryptocurrency",
    description: "Technical and economic aspects of blockchain technology",
    students: 22,
    assignments: [
      {
        id: "blockchain-assign1",
        title: "Smart Contract Development",
        description: "Create a basic smart contract using Solidity",
        dueDate: new Date("2024-03-12"),
      },
    ],
  },
  {
    id: "ux-design-200",
    title: "UX Design Principles",
    description:
      "User experience design, prototyping, and user research methods",
    students: 47,
    assignments: [
      {
        id: "ux-design-assign1",
        title: "User Research Project",
        description:
          "Conduct user research and create a comprehensive UX report",
        dueDate: new Date("2024-02-22"),
      },
      {
        id: "ux-design-assign2",
        title: "Prototype Design",
        description: "Design an interactive prototype for a mobile application",
        dueDate: new Date("2024-03-07"),
      },
    ],
  },
  {
    id: "game-dev-400",
    title: "Game Development Masterclass",
    description: "Learn game design and development using Unity and C#",
    students: 33,
    assignments: [
      {
        id: "game-dev-assign1",
        title: "Game Design Document",
        description: "Create a comprehensive game design document",
        dueDate: new Date("2024-03-18"),
      },
    ],
  },
];
