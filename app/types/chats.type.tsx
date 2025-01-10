export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string | null;
}

interface Participant {
  user_id: string;
  student: Student;
}

export type ChannelType = "group" | "course";

export interface Conversation {
  id: string;
  title: string | null;
  is_group: boolean;
  channel_type?: string;
  description?: string;
  is_public?: boolean;
  updated_at: string;
  conversation_participants: Participant[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  status?: string;
  sender?: {
    first_name: string;
    last_name: string;
  };
  reactions?: Array<{
    id: string;
    reaction: string;
  }>;
}

export interface ChatProps {
  currentUserId: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  students_count: number;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface ChannelInvite {
  id: string;
  channel_id: string;
  inviter_id: string;
  invitee_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  expires_at: string;
}
