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
  requester?: User;
  receiver?: User;
  requester_skill?: Skill;
  receiver_skill?: Skill;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  thumbnail_url?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  created_at: string;
}

export interface MessageReceipt {
  id: string;
  message_id: string;
  user_id: string;
  status: "sent" | "delivered" | "read";
  delivered_at?: string | null;
  read_at?: string | null;
  created_at: string;

  name: string;
  profile_pic?: string | null;
}

export interface ReplyMessage {
  id: string;

  ciphertext: string | null;
  iv: string | null;
  auth_tag: string | null;

  message_type:
  | "text"
  | "image"
  | "file"
  | "audio"
  | "video"
  | "system";

  deleted_at?: string | null;

  sender_name: string;
}

export interface Message {

  id: string;

  barter_id: string;

  sender_id: string;

  ciphertext: string | null;

  iv: string | null;

  auth_tag: string | null;

  message_type:
  | "text"
  | "image"
  | "file"
  | "audio"
  | "video"
  | "system";

  reply_to_message_id?: string | null;

  status:
  | "sent"
  | "delivered"
  | "read";

  edited: boolean;

  deleted_for_everyone: boolean;

  edited_at?: string | null;

  deleted_at?: string | null;

  created_at: string;

  updated_at?: string;

  sender_name?: string;

  sender_profile_pic?: string | null;

  attachments?: MessageAttachment[];

  receipts?: MessageReceipt[];

  reply_message?: ReplyMessage | null;
}

export interface Call {
  id: string;
  barter_request_id: string;
  initiator_id: string;
  status: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

export const keyApiService = {
  async registerPublicKey(data: { publicKey: string; algorithm: string;}) {
    return apiClient.post("/api/keys/register", data)
  },
  async getMyKey() {
    return apiClient.get("/api/keys/me")
  },
  async getSessionKey(barterId: string) {
    return apiClient.get(`/api/keys/session/${barterId}`)
  },
  async rotateSessionKey(barterId: string) {
    return apiClient.post(`/api/keys/session/${barterId}/rotate`)
  }
}

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
  }
};

export const barterService = {
  async createRequest(data: any) {
    return apiClient.post("/api/barter/request", data);
  },

  async getRequests() {
    return apiClient.get("/api/barter/requests");
  },

  async updateStatus(id: string, status: string) {
    return apiClient.patch(`/api/barter/${id}`, {
      status
    });
  },

  async completeBarter(id: string) {
    return apiClient.patch(`/api/barter/${id}/complete`);
  }
};

export const chatService = {

  async getMessages(barterId: string) {
    return apiClient.get(`/api/chat/${barterId}/messages`);
  }

};

export const callService = {

  async getCall(callId: string) {
    return apiClient.get(`/api/call/${callId}`);
  },

  async getParticipants(callId: string) {
    return apiClient.get(`/api/call/${callId}/participants`);
  },

  async getLogs(callId: string) {
    return apiClient.get(`/api/call/${callId}/logs`);
  }

};

export const matchService = {

  async getMatches() {
    return apiClient.get("/api/match");
  }

};

export const reviewService = {

  async addReview(data: {
    barter_id: string;
    rating: number;
    comment: string;
  }) {
    return apiClient.post("/api/reviews", data);
  },

  async getUserProfile(userId: string) {
    return apiClient.get(`/api/reviews/${userId}`);
  }

};

export const allSkills = [
  "React",
  "Node.js",
  "Python",
  "UI/UX Design",
  "Digital Marketing",
  "Graphic Design",
  "Data Science",
  "Public Speaking",
  "Spanish",
  "Guitar"
];

export const users: any[] = [];

export const creditTransactions: any[] = [];

export const currentUser: any = null;