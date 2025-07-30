'use client';

import { Navigation } from '@/components/layout/Navigation';
import { useAuth } from '@/hooks/useClerkAuth';
import Link from 'next/link';
import { MessageSquare, Search, Phone, Video } from 'lucide-react';

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    participant: {
      name: 'Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      status: 'online',
    },
    lastMessage: {
      text: 'Thank you for booking! I\'m looking forward to our session.',
      timestamp: '2 min ago',
      isRead: false,
    },
    serviceType: 'Yoga Instruction',
  },
  {
    id: '2',
    participant: {
      name: 'Michael Chen',
      avatar: '/api/placeholder/40/40',
      status: 'offline',
    },
    lastMessage: {
      text: 'The consultation went great! Let me know if you need anything else.',
      timestamp: '1 hour ago',
      isRead: true,
    },
    serviceType: 'Business Consulting',
  },
];

export default function MessagesPage() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view your messages</h2>
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#00FFAD] focus:ring-1 focus:ring-[#00FFAD] transition-all"
            />
          </div>
        </div>

        {mockConversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
            <p className="text-gray-400 mb-6">
              When you book a service, you can chat with your provider here.
            </p>
            <Link
              href="/explore"
              className="inline-block px-6 py-3 bg-[#00FFAD] text-gray-900 rounded-lg font-semibold hover:bg-[#00FF8C] transition-all"
            >
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {mockConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="block"
              >
                <div className="glass-panel p-6 hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0"></div>
                      {conversation.participant.status === 'online' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {conversation.participant.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-2">
                            {conversation.serviceType}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-[#00FFAD] transition-colors" aria-label="Call">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-[#00FFAD] transition-colors" aria-label="Video call">
                            <Video className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className={`text-sm flex-1 mr-2 ${
                          conversation.lastMessage.isRead ? 'text-gray-400' : 'text-white font-medium'
                        }`}>
                          {conversation.lastMessage.text}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessage.timestamp}
                          </span>
                          {!conversation.lastMessage.isRead && (
                            <div className="w-2 h-2 bg-[#00FFAD] rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}