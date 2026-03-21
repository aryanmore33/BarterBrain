// API service - prepared for backend integration
// Currently using dummy data

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  credits: number;
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  rating: number;
  reviewCount: number;
}

export interface Skill {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Expert";
  description: string;
  type: "offered" | "wanted";
}

export interface BarterRequest {
  id: string;
  fromUser: User;
  toUser: User;
  skillOffered: string;
  skillWanted: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
  messages: Message[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface CreditTransaction {
  id: string;
  type: "earned" | "spent";
  amount: number;
  description: string;
  date: string;
}

// Dummy data
export const currentUser: User = {
  id: "1",
  name: "Alex Morgan",
  email: "alex@example.com",
  avatar: "",
  bio: "Full-stack developer passionate about design and teaching. Love exchanging knowledge!",
  credits: 150,
  skillsOffered: [
    { id: "s1", name: "React.js", level: "Expert", description: "Modern React with hooks, context, and advanced patterns", type: "offered" },
    { id: "s2", name: "TypeScript", level: "Expert", description: "Type-safe JavaScript development", type: "offered" },
    { id: "s3", name: "UI/UX Design", level: "Intermediate", description: "Figma, wireframing, prototyping", type: "offered" },
  ],
  skillsWanted: [
    { id: "s4", name: "Piano", level: "Beginner", description: "Want to learn piano basics", type: "wanted" },
    { id: "s5", name: "Photography", level: "Beginner", description: "Learn portrait and landscape photography", type: "wanted" },
  ],
  rating: 4.8,
  reviewCount: 24,
};

export const users: User[] = [
  currentUser,
  {
    id: "2", name: "Sarah Chen", email: "sarah@example.com", avatar: "",
    bio: "Music teacher and photographer. Always looking to learn new tech skills.",
    credits: 200,
    skillsOffered: [
      { id: "s6", name: "Piano", level: "Expert", description: "Classical and jazz piano", type: "offered" },
      { id: "s7", name: "Photography", level: "Expert", description: "Portrait, landscape, and event photography", type: "offered" },
    ],
    skillsWanted: [
      { id: "s8", name: "React.js", level: "Beginner", description: "Want to build web apps", type: "wanted" },
    ],
    rating: 4.9, reviewCount: 31,
  },
  {
    id: "3", name: "Marcus Johnson", email: "marcus@example.com", avatar: "",
    bio: "Graphic designer and yoga instructor. Believe in lifelong learning.",
    credits: 85,
    skillsOffered: [
      { id: "s9", name: "Graphic Design", level: "Expert", description: "Branding, logos, print design", type: "offered" },
      { id: "s10", name: "Yoga", level: "Intermediate", description: "Vinyasa and Hatha yoga", type: "offered" },
    ],
    skillsWanted: [
      { id: "s11", name: "TypeScript", level: "Beginner", description: "Want to learn typed JS", type: "wanted" },
      { id: "s12", name: "UI/UX Design", level: "Beginner", description: "Digital product design", type: "wanted" },
    ],
    rating: 4.6, reviewCount: 18,
  },
  {
    id: "4", name: "Priya Patel", email: "priya@example.com", avatar: "",
    bio: "Data scientist who loves cooking and languages.",
    credits: 320,
    skillsOffered: [
      { id: "s13", name: "Python", level: "Expert", description: "Data science, ML, automation", type: "offered" },
      { id: "s14", name: "Cooking", level: "Expert", description: "Indian and fusion cuisine", type: "offered" },
    ],
    skillsWanted: [
      { id: "s15", name: "React.js", level: "Intermediate", description: "Frontend for data dashboards", type: "wanted" },
      { id: "s16", name: "Graphic Design", level: "Beginner", description: "Basic design skills", type: "wanted" },
    ],
    rating: 4.7, reviewCount: 22,
  },
  {
    id: "5", name: "James Wilson", email: "james@example.com", avatar: "",
    bio: "Fitness trainer and amateur chef. Tech curious.",
    credits: 95,
    skillsOffered: [
      { id: "s17", name: "Fitness Training", level: "Expert", description: "Strength, HIIT, and nutrition", type: "offered" },
      { id: "s18", name: "Cooking", level: "Intermediate", description: "Mediterranean and healthy cooking", type: "offered" },
    ],
    skillsWanted: [
      { id: "s19", name: "Photography", level: "Beginner", description: "Food and fitness photography", type: "wanted" },
      { id: "s20", name: "Python", level: "Beginner", description: "Automate fitness tracking", type: "wanted" },
    ],
    rating: 4.5, reviewCount: 15,
  },
];

export const barterRequests: BarterRequest[] = [
  {
    id: "r1", fromUser: users[1], toUser: currentUser,
    skillOffered: "Piano", skillWanted: "React.js",
    status: "pending", createdAt: "2025-03-18T10:00:00Z",
    messages: [
      { id: "m1", senderId: "2", text: "Hi Alex! I'd love to exchange piano lessons for React tutoring. Are you interested?", timestamp: "2025-03-18T10:00:00Z" },
      { id: "m2", senderId: "1", text: "Hey Sarah! That sounds great. How often were you thinking?", timestamp: "2025-03-18T10:30:00Z" },
      { id: "m3", senderId: "2", text: "Maybe twice a week? 1 hour each session?", timestamp: "2025-03-18T11:00:00Z" },
    ],
  },
  {
    id: "r2", fromUser: users[2], toUser: currentUser,
    skillOffered: "Graphic Design", skillWanted: "TypeScript",
    status: "pending", createdAt: "2025-03-17T14:00:00Z",
    messages: [],
  },
  {
    id: "r3", fromUser: currentUser, toUser: users[3],
    skillOffered: "React.js", skillWanted: "Cooking",
    status: "accepted", createdAt: "2025-03-15T09:00:00Z",
    messages: [
      { id: "m4", senderId: "1", text: "Hi Priya! Would you be up for trading cooking lessons for React help?", timestamp: "2025-03-15T09:00:00Z" },
      { id: "m5", senderId: "4", text: "Absolutely! I've been wanting to learn React for my projects.", timestamp: "2025-03-15T09:45:00Z" },
    ],
  },
  {
    id: "r4", fromUser: currentUser, toUser: users[4],
    skillOffered: "UI/UX Design", skillWanted: "Fitness Training",
    status: "completed", createdAt: "2025-02-20T08:00:00Z",
    messages: [],
  },
];

export const creditTransactions: CreditTransaction[] = [
  { id: "t1", type: "earned", amount: 25, description: "Completed barter with James Wilson - UI/UX Design", date: "2025-03-10" },
  { id: "t2", type: "spent", amount: 10, description: "Premium skill listing boost", date: "2025-03-08" },
  { id: "t3", type: "earned", amount: 50, description: "Welcome bonus", date: "2025-03-01" },
  { id: "t4", type: "earned", amount: 25, description: "Referral bonus - invited Sarah Chen", date: "2025-02-28" },
  { id: "t5", type: "spent", amount: 15, description: "Unlocked advanced matching", date: "2025-02-25" },
  { id: "t6", type: "earned", amount: 75, description: "Completed 5 barters milestone", date: "2025-02-20" },
];

export const allSkills = [
  "React.js", "TypeScript", "Python", "JavaScript", "Node.js", "Go", "Rust",
  "UI/UX Design", "Graphic Design", "Photography", "Video Editing",
  "Piano", "Guitar", "Singing", "Music Production",
  "Cooking", "Baking", "Yoga", "Fitness Training", "Meditation",
  "Spanish", "French", "Japanese", "Mandarin",
  "Writing", "Public Speaking", "Marketing", "SEO",
];
