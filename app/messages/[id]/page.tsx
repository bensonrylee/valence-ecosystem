'use client';

import { Navigation } from '@/components/layout/Navigation';
import { ChatInterface } from '@/components/messaging/ChatInterface';
import { useAuth } from '@/hooks/useClerkAuth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MessageConversationPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view messages</h2>
          <Link
            href="/auth/sign-in"
            className="inline-block px-6 py-3 bg-[#00FFAD] text-gray-900 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/messages"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to messages
          </Link>
        </div>

        <ChatInterface
          conversationId={params.id}
          currentUserId={user.id}
          recipientName="Sarah Johnson"
          recipientImage="/api/placeholder/40/40"
        />
      </div>
    </div>
  );
}