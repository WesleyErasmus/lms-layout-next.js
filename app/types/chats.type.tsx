export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
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

// export type ChannelType = "direct" | "course" | "group";

// export interface Message {
//   id: string;
//   conversation_id: string;
//   sender_id: string;
//   content: string;
//   status: "sent" | "delivered" | "read";
//   created_at: string;
//   updated_at: string;
//   mentions?: Mention[];
//   reactions?: MessageReaction[];
// }

// export interface Student {
//   id: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   title?: string;
//   created_at: string;
// }

// export interface ConversationParticipant {
//   user_id: string;
//   conversation_id: string;
//   joined_at: string;
//   last_message_read_at: string;
//   student: {
//     first_name: string;
//     last_name: string;
//   };
// }

// export interface Conversation {
//   id: string;
//   title: string | null;
//   description: string | null;
//   is_group: boolean;
//   is_public: boolean;
//   channel_type: ChannelType;
//   course_id?: string;
//   created_by: string;
//   created_at: string;
//   updated_at: string;
//   conversation_participants: ConversationParticipant[];
// }

// export interface ChannelInvite {
//   id: string;
//   channel_id: string;
//   inviter_id: string;
//   invitee_id: string;
//   status: "pending" | "accepted" | "rejected";
//   created_at: string;
//   expires_at: string;
// }

// export interface Mention {
//   id: string;
//   message_id: string;
//   user_id: string;
//   created_at: string;
// }

