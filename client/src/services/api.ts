import apiClient from "./apiClient";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  credits: number;
  avg_rating?: string;
  total_reviews?: number;
}

export interface Skill {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Expert";
  description: string;
}

export interface BarterRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  requester_skill_id: string;
  receiver_skill_id: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  message?: string;
  created_at: string;
  // Nested data for UI convenience
  requester?: User;
  receiver?: User;
  requester_skill?: Skill;
  receiver_skill?: Skill;
}

export interface Message {
  id: string;
  barter_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

// API Functions
export const skillService = {
  async addOffered(skill: any) {
    return apiClient.post("/api/skills/offered", skill);
  },
  async addWanted(skill: any) {
    return apiClient.post("/api/skills/wanted", skill);
  },
  async getMyOffered() {
    return apiClient.get("/api/skills/offered");
  },
  async getMyWanted() {
    return apiClient.get("/api/skills/wanted");
  },
};

export const barterService = {
  async createRequest(data: any) {
    return apiClient.post("/api/barter/request", data);
  },
  async getRequests() {
    return apiClient.get("/api/barter/requests");
  },
  async updateStatus(id: string, status: string) {
    return apiClient.patch(`/api/barter/${id}`, { status });
  },
  async completeBarter(id: string) {
    return apiClient.patch(`/api/barter/${id}/complete`);
  },
};

export const chatService = {
  async getHistory(barterId: string) {
    return apiClient.get(`/api/chat/${barterId}/messages`);
  },
};

export const matchService = {
  async getMatches() {
    return apiClient.get("/api/match");
  },
};

export const reviewService = {
  async addReview(data: { barter_id: string; rating: number; comment: string }) {
    return apiClient.post("/api/reviews", data);
  },
  async getUserProfile(userId: string) {
    return apiClient.get(`/api/reviews/${userId}`);
  },
};

// Placeholder data to fix build errors - should be replaced with real API calls
export const allSkills = [
  "React", "Node.js", "Python", "UI/UX Design", "Digital Marketing", 
  "Graphic Design", "Data Science", "Public Speaking", "Spanish", "Guitar"
];

export const users: any[] = [];
export const creditTransactions: any[] = [];
export const currentUser: any = null; // Still needed by some pages temporarily

// Re-export types for backward compatibility if needed, 
// but we should update pages to use these functions.
