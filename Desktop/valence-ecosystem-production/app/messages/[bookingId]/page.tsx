'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ChatInterface from '@/components/chat/ChatInterface';
import { ChatErrorBoundary } from '@/components/chat/ChatErrorBoundary';

export default function BookingMessagesPage({ params }: { params: { bookingId: string } }) {
  const { bookingId } = params;
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      setCurrentUserId(user.uid);

      // Fetch booking to get provider name
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
          throw new Error('Booking not found');
        }

        const bookingData = bookingSnap.data();
        const { sellerId, buyerId } = bookingData;

        // Security: Only allow buyer or seller to access this chat
        if (user.uid !== buyerId && user.uid !== sellerId) {
          console.error('Unauthorized access to booking chat');
          router.push('/unauthorized');
          return;
        }

        // Determine if current user is buyer or seller to show correct name
        const otherUserId = user.uid === buyerId ? sellerId : buyerId;
        
        const userRef = doc(db, 'users', otherUserId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProviderName(userSnap.data().name || 'User');
        }
      } catch (err) {
        console.error('Failed to load booking/provider:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [bookingId, router]);

  if (loading || !currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <ChatErrorBoundary>
        <ChatInterface 
          bookingId={bookingId} 
          currentUserId={currentUserId} 
          providerName={providerName} 
        />
      </ChatErrorBoundary>
    </div>
  );
}