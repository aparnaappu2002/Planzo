import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import socket from '@/hooks/socketHook';
import { ChatList } from './ChatList';
import { ChatMessages } from './ChatMessage';

interface Chat {
  _id: string;
  clientId: string;
  vendorId: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface RootState {
  clientSlice: {
    client?: {
      _id: string;
    };
  };
  vendorSlice: {
    vendor?: {
      _id: string;
    };
  };
}

export const ChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientId: stateClientId, vendorId: stateVendorId, selectedChat } = location.state || {};
  
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id);
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  
  // Check if vendor is trying to access client chat page
  useEffect(() => {
    if (vendorId && !clientId) {
      // Vendor is logged in, redirect to vendor chat page
      navigate('/vendor/chat', { 
        state: location.state,
        replace: true 
      });
    }
  }, [vendorId, clientId, navigate, location.state]);
  
  const [vendorIdState, setVendorIdState] = useState<string>(stateVendorId || '');
  const [isSelectedChat, setIsSelectedChat] = useState<boolean>(selectedChat ?? false);
  const [chatId, setChatId] = useState<string>('');
  const userId = clientId || stateClientId;

  // Calculate roomId based on current userId and vendorId
  const roomId = userId && vendorIdState ? userId + vendorIdState : '';

  // Don't render if vendor is logged in (will redirect)
  if (vendorId && !clientId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-yellow-600 animate-pulse">Redirecting...</div>
      </div>
    );
  }

  // Don't render if no user is logged in
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Please log in to view chats</div>
      </div>
    );
  }

  useEffect(() => {
    if (!socket.connected) socket.connect();
    
    const handleConnect = () => {
      
      // Register user when connected
      if (userId) {
        socket.emit('register', { userId, name: 'Client User' }, (notifications) => {
        });
      }
      
      // Join room if available
      if (roomId) {
        socket.emit('joinRoom', { roomId });
      }
    };

    const handleDisconnect = () => {
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // If already connected, register and join room immediately
    if (socket.connected) {
      if (userId) {
        socket.emit('register', { userId, name: 'Client User' }, (notifications) => {
        });
      }
      
      if (roomId) {
        socket.emit('joinRoom', { roomId });
      }
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [roomId, userId]);

  const handleSelectChat = (chat: Chat) => {
    
    // Set the chat details
    setChatId(chat._id);
    setVendorIdState(chat.vendorId);
    setIsSelectedChat(true);
    
    // Calculate new room ID
    const newRoomId = userId + chat.vendorId;
    
    // Join the new room
    if (socket.connected) {
      socket.emit('joinRoom', { roomId: newRoomId });
    }
    
    
  };

  // Debug logs
  useEffect(() => {
    
  }, [chatId, userId, vendorIdState, roomId, isSelectedChat]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="w-80 bg-white shadow-xl border-r border-yellow-200 flex flex-col">
        <div className="p-4 border-b border-yellow-200 bg-gradient-to-r from-yellow-500 to-yellow-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-semibold">👤</span>
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">Messages</h1>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatList userId={userId} onSelectChat={handleSelectChat} />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-yellow-200 p-4 shadow-sm">
          {isSelectedChat && vendorIdState ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">👨‍💼</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-yellow-800">
                  Vendor: {vendorIdState}
                </h2>
                <p className="text-sm text-yellow-600">
                  Chat ID: {chatId || 'New conversation'}
                </p>
                <p className="text-xs text-yellow-500">
                  Room: {roomId}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-yellow-500">
              <div className="text-2xl mb-2">💬</div>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          {userId && (vendorIdState || isSelectedChat) ? (
            <ChatMessages
              key={`${chatId}-${vendorIdState}-${roomId}`}
              chatId={chatId}
              userId={userId}
              roomId={roomId}
              vendorId={vendorIdState}
              socket={socket}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-yellow-50">
              <div className="text-center text-yellow-500">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg font-medium">Welcome to Messages</p>
                <p className="text-sm mt-2">Select a chat from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};