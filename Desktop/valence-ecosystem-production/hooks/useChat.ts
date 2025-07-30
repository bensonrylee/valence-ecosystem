import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  doc,
  setDoc,
  serverTimestamp,
  Timestamp,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { sanitizeHtml } from '@/lib/sanitize';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  type: 'user' | 'system';
  readBy?: string[];
}

interface TypingState {
  bookingId: string;
  userId: string;
  isTyping: boolean;
  updatedAt: Timestamp;
}

const MESSAGES_PER_PAGE = 50;

export function useChat(bookingId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [oldestMessageDoc, setOldestMessageDoc] = useState<QueryDocumentSnapshot | null>(null);
  
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTypingUpdateRef = useRef<number>(0);

  // Subscribe to messages
  useEffect(() => {
    if (!bookingId) return;

    setLoading(true);
    
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', bookingId),
      orderBy('timestamp', 'desc'),
      limit(MESSAGES_PER_PAGE)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const newMessages: Message[] = [];
        const docs = snapshot.docs;
        
        // Store the oldest doc for pagination
        if (docs.length > 0) {
          setOldestMessageDoc(docs[docs.length - 1]);
          setHasMore(docs.length === MESSAGES_PER_PAGE);
        } else {
          setHasMore(false);
        }
        
        // Process messages in reverse order (newest first from query, but display oldest first)
        docs.forEach((doc) => {
          newMessages.unshift({ id: doc.id, ...doc.data() } as Message);
        });
        
        setMessages(newMessages);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [bookingId]);

  // Subscribe to typing state
  useEffect(() => {
    if (!bookingId || !currentUserId) return;

    const typingQuery = query(
      collection(db, 'typing'),
      where('bookingId', '==', bookingId)
    );

    const unsubscribe = onSnapshot(typingQuery, (snapshot) => {
      let otherUserTyping = false;
      
      snapshot.forEach((doc) => {
        const data = doc.data() as TypingState;
        // Check if other user is typing and it's recent (within 3 seconds)
        if (data.userId !== currentUserId && data.isTyping) {
          const typingAge = Date.now() - data.updatedAt.toMillis();
          if (typingAge < 3000) {
            otherUserTyping = true;
          }
        }
      });
      
      setIsTyping(otherUserTyping);
    });

    return () => unsubscribe();
  }, [bookingId, currentUserId]);

  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!currentUserId || !text.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: bookingId,
        senderId: currentUserId,
        text: sanitizeHtml(text),
        timestamp: serverTimestamp(),
        type: 'user' as const,
        readBy: [currentUserId]
      });

      // Clear typing state when message is sent
      await setTyping(false);
    } catch (err) {
      console.error('Error sending message:', err);
      throw new Error('Failed to send message');
    }
  }, [bookingId, currentUserId]);

  // Set typing state with debounce
  const setTyping = useCallback(async (typing: boolean) => {
    if (!currentUserId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Debounce to avoid too many writes
    const now = Date.now();
    if (now - lastTypingUpdateRef.current < 500) return;
    lastTypingUpdateRef.current = now;

    try {
      const typingDocId = `${bookingId}_${currentUserId}`;
      const typingRef = doc(db, 'typing', typingDocId);
      
      await setDoc(typingRef, {
        bookingId,
        userId: currentUserId,
        isTyping: typing,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Auto-clear typing state after 2.5 seconds
      if (typing) {
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 2500);
      }
    } catch (err) {
      console.error('Error updating typing state:', err);
    }
  }, [bookingId, currentUserId]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!currentUserId) return;

    try {
      // Update all unread messages in this conversation
      const unreadMessages = messages.filter(
        msg => msg.senderId !== currentUserId && (!msg.readBy || !msg.readBy.includes(currentUserId))
      );

      const updatePromises = unreadMessages.map(msg => {
        const messageRef = doc(db, 'messages', msg.id);
        return updateDoc(messageRef, {
          readBy: [...(msg.readBy || []), currentUserId]
        });
      });

      await Promise.all(updatePromises);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [messages, currentUserId]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!oldestMessageDoc || !hasMore || loadingMore) return;

    setLoadingMore(true);
    
    try {
      const moreQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', bookingId),
        orderBy('timestamp', 'desc'),
        startAfter(oldestMessageDoc),
        limit(MESSAGES_PER_PAGE)
      );

      const snapshot = await getDocs(moreQuery);
      const olderMessages: Message[] = [];
      
      if (snapshot.docs.length > 0) {
        setOldestMessageDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
        
        snapshot.docs.forEach((doc) => {
          olderMessages.unshift({ id: doc.id, ...doc.data() } as Message);
        });
        
        setMessages(prev => [...olderMessages, ...prev]);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more messages:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [bookingId, oldestMessageDoc, hasMore, loadingMore]);

  return {
    messages,
    sendMessage,
    isTyping,
    setTyping,
    markAsRead,
    loading,
    error,
    currentUserId,
    hasMore,
    loadingMore,
    loadMoreMessages
  };
}