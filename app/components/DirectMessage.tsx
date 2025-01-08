// // app/components/DirectMessage.tsx
// "use client";

// import { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabase/client';
// import { Student } from '@/app/types/chats.type';
// import styles from './DirectMessage.module.css';

// interface DirectMessageProps {
//   currentUserId: string;
//   onConversationSelect: (conversationId: string) => void;
// }

// export default function DirectMessage({ 
//   currentUserId, 
//   onConversationSelect 
// }: DirectMessageProps) {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [students, setStudents] = useState<Student[]>([]);
//   const [recentChats, setRecentChats] = useState<{
//     id: string;
//     user: Student;
//     lastMessage: string;
//     timestamp: string;
//   }[]>([]);

//   useEffect(() => {
//     const fetchRecentChats = async () => {
//       const { data: conversations, error } = await supabase
//         .from('conversations')
//         .select(`
//           id,
//           conversation_participants!inner(
//             user_id,
//             student:students(*)
//           ),
//           messages(
//             content,
//             created_at
//           )
//         `)
//         .eq('channel_type', 'direct')
//         .order('updated_at', { ascending: false });

//       if (error) {
//         console.error('Error fetching recent