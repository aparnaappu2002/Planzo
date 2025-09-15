import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLoadMessageInfinite } from '@/hooks/clientCustomHooks';
import { motion, AnimatePresence } from 'framer-motion';
import { Socket } from 'socket.io-client';
import { useInfiniteScrollObserver } from '@/hooks/useInfiniteScrollObserver';

interface MessageEntity {
  seen?: boolean;
  messageContent: string;
  sendedTime?: Date;
  senderId: string;
  senderModel: 'client' | 'vendors';
}

interface MessageTypeFromBackend {
  _id?: string;
  chatId: string;
  seen: boolean;
  messageContent: string;
  sendedTime: string;
  senderId: string;
  senderModel: 'client' | 'vendors';
}

interface ChatMessagesProps {
  chatId: string;
  userId: string;
  roomId: string;
  vendorId: string;
  socket: Socket;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  chatId,
  userId,
  roomId,
  vendorId,
  socket,
}) => {
  const queryClient = useQueryClient();
  const { data, fetchNextPage, hasNextPage, isLoading, isError, isFetchingNextPage } =
    useLoadMessageInfinite(chatId, { enabled: !!chatId });
  const [messages, setMessages] = useState<MessageTypeFromBackend[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Initialize infinite scroll observer
  const { getObserverRef, disconnect } = useInfiniteScrollObserver();

  useEffect(() => {
    if (data) {
      const fetchedMessages = data.pages.flatMap(page => page.messages) || [];
      // Sort messages by timestamp to ensure correct chronological order
      const sortedMessages = fetchedMessages.sort((a, b) =>
        new Date(a.sendedTime).getTime() - new Date(b.sendedTime).getTime()
      );

      setMessages(prev => {
        const existingIds = new Set(prev.map(msg => msg._id));
        const newMessages = sortedMessages.filter(msg => !existingIds.has(msg._id || ''));

        // Merge and sort all messages
        const allMessages = [...prev, ...newMessages].sort((a, b) =>
          new Date(a.sendedTime).getTime() - new Date(b.sendedTime).getTime()
        );

        return allMessages;
      });
    }
  }, [data]);

  useEffect(() => {
    // Scroll to bottom for new messages, not when loading older messages
    if (messagesContainerRef.current && !isFetchingNextPage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isFetchingNextPage]);

  // Set up infinite scroll observer
  useEffect(() => {
    if (loaderRef.current && hasNextPage) {
      try {
        getObserverRef(loaderRef.current, {
          hasNextPage,
          fetchNextPage,
          isFetchingNextPage,
          isLoading,
        });
      } catch (error) {
        console.error('Failed to set up infinite scroll observer:', error);
      }
    }
    return () => {
      disconnect();
    };
  }, [getObserverRef, disconnect, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading]);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleConnect = () => {
      console.log('Connected with socket id', socket.id);

      // Register user when connected
      if (userId) {
        socket.emit('register', { userId, name: 'Client User' }, (notifications) => {
          console.log('Registration successful, received notifications:', notifications);
        });
      }

      // Join room when connected
      if (roomId) {
        socket.emit('joinRoom', { roomId });
      }
    };

    const handleReceiveMessage = (data: MessageTypeFromBackend) => {
      console.log('message from backend', data);
      setMessages(prev => {
        if (prev.some(msg => msg._id === data._id)) return prev;
        // Add new message and sort by timestamp
        const updatedMessages = [...prev, data].sort((a, b) =>
          new Date(a.sendedTime).getTime() - new Date(b.sendedTime).getTime()
        );
        return updatedMessages;
      });
    };

    const handleDisconnect = () => {
      console.log('socket disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('disconnect', handleDisconnect);

    // Register and join room immediately if already connected
    if (socket.connected) {
      if (userId) {
        socket.emit('register', { userId, name: 'Client User' }, (notifications) => {
          console.log('Registration successful, received notifications:', notifications);
        });
      }

      if (roomId) {
        socket.emit('joinRoom', { roomId });
      }
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, roomId, userId]);

  const sendMessage = (message: string) => {
    const sendMessage: MessageEntity = {
      messageContent: message,
      senderId: userId,
      senderModel: 'client',
      sendedTime: new Date(),
    };

    const messageData = {
      sendMessage,
      roomId,
      receiverId: vendorId,
      receiverModel: 'vendors',
    };

    console.log('Sending message data:', messageData);

    socket.emit('sendMessage', messageData, (response: MessageTypeFromBackend | { error: boolean; message: string }) => {
      console.log('Server response:', response);

      // Handle error response
      if (response && typeof response === 'object' && 'error' in response && response.error) {
        console.error('Error sending message:', response.message);
        alert('Failed to send message: ' + response.message);
        return;
      }

      // Handle successful response
      const newMessage = response as MessageTypeFromBackend;
      if (newMessage && newMessage._id) {
        setMessages(prev => {
          // Prevent duplicates
          if (prev.some(msg => msg._id === newMessage._id)) return prev;
          // Add new message and sort by timestamp
          const updatedMessages = [...prev, newMessage].sort((a, b) =>
            new Date(a.sendedTime).getTime() - new Date(b.sendedTime).getTime()
          );
          return updatedMessages;
        });

        // Invalidate chat queries to refresh chat list
        queryClient.invalidateQueries({ queryKey: ['chats', userId] });
      }
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const input = form.querySelector('input') as HTMLInputElement;
    const content = input.value.trim();

    if (content && roomId && vendorId) {
      sendMessage(content);
      input.value = '';
    } else {
      console.warn('Missing required data:', { content: !!content, roomId: !!roomId, vendorId: !!vendorId });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-yellow-50">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#fbbf24 #fef3c7' }}
      >
        {isFetchingNextPage && (
          <div className="sticky top-0 bg-yellow-50 p-2 text-center z-10">
            <div className="text-yellow-600 text-sm animate-pulse">Loading older messages...</div>
          </div>
        )}
        {hasNextPage && (
          <div ref={loaderRef} className="h-1" />
        )}
        <AnimatePresence>
          {messages.length === 0 && !chatId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-yellow-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg font-medium">Start a new conversation</p>
                <p className="text-sm mt-2">Type a message below to begin chatting</p>
              </div>
            </div>
          ) : isLoading && messages.length === 0 && chatId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-yellow-600 animate-pulse">Loading messages...</div>
            </div>
          ) : isError && chatId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600">Error loading messages</div>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message._id || `msg-${index}-${message.sendedTime}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md p-3 rounded-2xl shadow-sm ${
                    message.senderId === userId
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-br-sm'
                      : 'bg-white text-yellow-800 rounded-bl-sm border border-yellow-200 shadow-md'
                  }`}
                >
                  <p className="text-sm break-words">{message.messageContent}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.senderId === userId ? 'text-yellow-100' : 'text-yellow-500'
                    }`}
                  >
                    {new Date(message.sendedTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {message.seen && (
                    <p className="text-xs text-yellow-400">Seen</p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white border-t border-yellow-200 sticky bottom-0 z-20"
      >
        <div className="flex items-center space-x-2 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder={
              !vendorId
                ? 'Select a vendor to start chatting'
                : !roomId
                ? 'Connecting to chat...'
                : 'Type a message...'
            }
            className="flex-1 p-3 rounded-xl border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-yellow-800 placeholder-yellow-500 transition-all duration-200"
            disabled={!vendorId || !roomId}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!vendorId || !roomId}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform ${
              vendorId && roomId
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={
              !vendorId
                ? 'Select a vendor to send messages'
                : !roomId
                ? 'Connecting to chat room...'
                : 'Send message'
            }
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};