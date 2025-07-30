'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/primitives/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: Date;
  is_read: boolean;
}

interface ChatInterfaceProps {
  conversationId: string;
  currentUserId: string;
  recipientName: string;
  recipientImage?: string;
}

export function ChatInterface({ 
  conversationId, 
  currentUserId, 
  recipientName,
  recipientImage 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: currentUserId,
      recipient_id: 'recipient',
      created_at: new Date(),
      is_read: false,
    };

    setMessages([...messages, tempMessage]);
    setNewMessage('');

    // TODO: Send message via API
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] overflow-hidden" padding="none">
      {/* Chat Header */}
      <div className="glass-panel border-0 rounded-t-2xl rounded-b-none px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            {recipientImage ? (
              <img src={recipientImage} alt={recipientName} className="w-full h-full rounded-full" />
            ) : (
              <span className="text-gray-400 text-sm font-semibold">
                {recipientName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">{recipientName}</h3>
            <p className="text-xs text-gray-400">Online</p>
          </div>
        </div>
        <button 
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0D0D0D]/50">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isCurrentUser = message.sender_id === currentUserId;
            const showTimestamp = index === 0 || 
              new Date(messages[index - 1].created_at).getDate() !== new Date(message.created_at).getDate();

            return (
              <React.Fragment key={message.id}>
                {showTimestamp && (
                  <div className="text-center my-4">
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                      {format(new Date(message.created_at), 'MMMM d')}
                    </span>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? 'bg-[#00FFAD] text-gray-900'
                        : 'glass-panel'
                    }`}
                  >
                    <p className={`text-sm ${isCurrentUser ? 'text-gray-900' : 'text-white'}`}>
                      {message.content}
                    </p>
                    <div className={`flex items-center gap-1 mt-1 justify-end`}>
                      <span className={`text-xs ${isCurrentUser ? 'text-gray-700' : 'text-gray-400'}`}>
                        {format(new Date(message.created_at), 'HH:mm')}
                      </span>
                      {isCurrentUser && (
                        message.is_read ? (
                          <CheckCheck className="w-3 h-3 text-gray-700" />
                        ) : (
                          <Check className="w-3 h-3 text-gray-700" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-panel px-4 py-2 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-0" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-150" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-300" />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="glass-panel border-0 rounded-b-2xl rounded-t-none p-4">
        <div className="flex items-end gap-3">
          <button 
            className="text-gray-400 hover:text-[#00FFAD] transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full glass-input resize-none max-h-32"
              rows={1}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className={`p-2 rounded-xl transition-all ${
              newMessage.trim()
                ? 'bg-[#00FFAD] text-gray-900'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </Card>
  );
}