'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageCircle, User, Search } from 'lucide-react';
import { generateGradient, formatSmartTime, getInitials, triggerHaptic } from '@/lib/ui-utils';

interface Conversation {
  id: string;
  serviceName: string;
  otherUserName: string;
  otherUserId: string;
  lastMessage: {
    text: string;
    timestamp: Timestamp;
    senderId: string;
  };
  unreadCount: number;
  bookingStatus: string;
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.uid);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!currentUserId) return;

    // Query bookings where user is a participant
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('participants', 'array-contains', currentUserId),
      where('status', '==', 'confirmed')
    );

    const unsubscribe = onSnapshot(bookingsQuery, async (bookingsSnapshot) => {
      const conversationsList: Conversation[] = [];

      for (const bookingDoc of bookingsSnapshot.docs) {
        const bookingData = bookingDoc.data();
        const { buyerId, sellerId, serviceName } = bookingData;

        const otherUserId = currentUserId === buyerId ? sellerId : buyerId;

        // Get other user's info
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        const otherUserName = userDoc.exists() ? userDoc.data().name || 'User' : 'User';

        // Get last message for this conversation
        const messagesQuery = query(
          collection(db, 'messages'),
          where('conversationId', '==', bookingDoc.id),
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        // Get unread count
        const unreadQuery = query(
          collection(db, 'messages'),
          where('conversationId', '==', bookingDoc.id),
          where('senderId', '!=', currentUserId)
        );

        // Fetch data using get() instead of creating/destroying listeners
        const [messagesSnapshot, unreadSnapshot] = await Promise.all([
          getDocs(messagesQuery),
          getDocs(unreadQuery)
        ]);

        let lastMessage = null;
        if (!messagesSnapshot.empty) {
          const lastMessageData = messagesSnapshot.docs[0].data();
          lastMessage = {
            text: lastMessageData.text,
            timestamp: lastMessageData.timestamp,
            senderId: lastMessageData.senderId
          };
        }

        // Count unread messages
        let unreadCount = 0;
        unreadSnapshot.forEach((msgDoc: any) => {
          const readBy = msgDoc.data().readBy || [];
          if (!readBy.includes(currentUserId)) {
            unreadCount++;
          }
        });

        if (lastMessage) {
          conversationsList.push({
            id: bookingDoc.id,
            serviceName,
            otherUserName,
            otherUserId,
            lastMessage,
            unreadCount,
            bookingStatus: bookingData.status
          });
        }
      }

      // Sort by most recent message
      conversationsList.sort((a, b) => {
        const aTime = a.lastMessage.timestamp?.toMillis() || 0;
        const bTime = b.lastMessage.timestamp?.toMillis() || 0;
        return bTime - aTime;
      });

      setConversations(conversationsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const handleConversationClick = (conversationId: string) => {
    triggerHaptic();
    router.push(`/messages/${conversationId}`);
  };

  const truncateMessage = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-blue-600" />
          Messages
        </h1>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-shimmer" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-shimmer" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) => {
    const query = searchQuery.toLowerCase();
    return conv.serviceName.toLowerCase().includes(query) ||
           conv.otherUserName.toLowerCase().includes(query) ||
           conv.lastMessage.text.toLowerCase().includes(query);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <MessageCircle className="w-8 h-8 text-blue-600" />
        Messages
      </h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {filteredConversations.length === 0 && searchQuery ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No conversations found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try searching with different keywords
          </p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm animate-fade-in-scale">
          <div className="animate-float">
            <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-600 mb-6">
            Start a conversation when you book your first service ✨
          </p>
          <button
            onClick={() => router.push('/explore')}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover-lift"
          >
            Explore Services
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              className={`bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover-lift tap-highlight-none ${
                conversation.unreadCount > 0 ? 'border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold shadow-sm"
                    style={{ background: generateGradient(conversation.otherUserName) }}
                  >
                    {getInitials(conversation.otherUserName)}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse-ring" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conversation.otherUserName}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatSmartTime(conversation.lastMessage.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 truncate">
                    {conversation.serviceName}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-sm ${
                      conversation.lastMessage.senderId === currentUserId
                        ? 'text-gray-500'
                        : conversation.unreadCount > 0
                        ? 'text-gray-900 font-medium'
                        : 'text-gray-700'
                    }`}>
                      {conversation.lastMessage.senderId === currentUserId && (
                        <span className="text-gray-400">You: </span>
                      )}
                      {truncateMessage(conversation.lastMessage.text)}
                    </p>

                    {/* Unread badge */}
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}