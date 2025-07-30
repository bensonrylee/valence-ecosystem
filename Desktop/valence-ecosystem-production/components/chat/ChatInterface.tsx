'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import { Send, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { sanitizeHtml } from '@/lib/sanitize';

interface ChatInterfaceProps {
  bookingId: string;
  currentUserId: string;
  providerName?: string;
}

export default function ChatInterface({ bookingId, currentUserId, providerName }: ChatInterfaceProps) {
  const router = useRouter();
  const {
    messages,
    sendMessage,
    isTyping,
    setTyping,
    markAsRead,
    loading,
    error,
    hasMore,
    loadingMore,
    loadMoreMessages
  } = useChat(bookingId);

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    markAsRead();
  }, [messages, markAsRead]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const messageText = input;
    setInput(''); // Clear input immediately for better UX
    
    try {
      await sendMessage(messageText);
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch (err) {
      // Restore input on error
      setInput(messageText);
      console.error('Failed to send message:', err);
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'h:mm a');
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      {providerName && (
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="font-semibold text-gray-900">{providerName}</h3>
          <p className="text-sm text-gray-500">Active now</p>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pb-4">
            <button
              onClick={loadMoreMessages}
              disabled={loadingMore}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              {loadingMore ? 'Loading...' : 'Load earlier messages'}
            </button>
          </div>
        )}
        {messages.map((msg) => {
          const isOwnMessage = msg.senderId === currentUserId;
          const isSystem = msg.type === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center my-4">
                <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {msg.text.includes('completed') && <CheckCircle className="w-3 h-3 text-green-600" />}
                  <span>{msg.text}</span>
                </div>
                {msg.text.includes('leave a review') && (
                  <div className="mt-3">
                    <button
                      onClick={() => router.push(`/bookings/${bookingId}/complete`)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Leave a Review →
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{sanitizeHtml(msg.text)}</p>
                <p 
                  className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatMessageTime(msg.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value.trim()) {
                setTyping(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}