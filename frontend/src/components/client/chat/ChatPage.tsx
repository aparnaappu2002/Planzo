import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
}

export const ChatPage: React.FC = () => {
  const location = useLocation();
  const { clientId: stateClientId, vendorId: stateVendorId, selectedChat } = location.state || {};
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id);
  const [vendorId, setVendorId] = useState<string>(stateVendorId || '');
  const [isSelectedChat, setIsSelectedChat] = useState<boolean>(selectedChat ?? false);
  const [chatId, setChatId] = useState<string>('');
  const userId = clientId || stateClientId;

  // Calculate roomId based on current userId and vendorId
  const roomId = userId && vendorId ? userId + vendorId : '';

  useEffect(() => {
    if (!socket.connected) socket.connect();
    console.log('connecting chat websocket');
    
    const handleConnect = () => {
      console.log('Connected with socket id', socket.id);
      
      // Register user when connected
      if (userId) {
        socket.emit('register', { userId, name: 'Client User' }, (notifications) => {
          console.log('Registration successful, received notifications:', notifications);
        });
      }
      
      // Join room if available
      if (roomId) {
        socket.emit('joinRoom', { roomId });
        console.log('Joined room:', roomId);
      }
    };

    const handleDisconnect = () => {
      console.log('socket disconnected with', socket.id);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // If already connected, register and join room immediately
    if (socket.connected) {
      if (userId) {
        socket.emit('register', { userId, name: 'Client User' }, (notifications) => {
          console.log('Registration successful, received notifications:', notifications);
        });
      }
      
      if (roomId) {
        socket.emit('joinRoom', { roomId });
        console.log('Joined room:', roomId);
      }
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [roomId, userId]);

  const handleSelectChat = (chat: Chat) => {
    console.log('Selecting chat:', chat);
    
    // Set the chat details
    setChatId(chat._id);
    setVendorId(chat.vendorId);
    setIsSelectedChat(true);
    
    // Calculate new room ID
    const newRoomId = userId + chat.vendorId;
    
    // Join the new room
    if (socket.connected) {
      socket.emit('joinRoom', { roomId: newRoomId });
      console.log('Joined new room:', newRoomId);
    }
    
    console.log('Selected chat details:', {
      chatId: chat._id,
      clientId: chat.clientId,
      vendorId: chat.vendorId,
      userId: userId,
      roomId: newRoomId
    });
  };

  // Debug logs
  useEffect(() => {
    console.log('Current state:', {
      chatId,
      userId,
      vendorId,
      roomId,
      isSelectedChat
    });
  }, [chatId, userId, vendorId, roomId, isSelectedChat]);

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
              <p className="text-yellow-100 text-sm">{userId}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatList userId={userId} onSelectChat={handleSelectChat} />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-yellow-200 p-4 shadow-sm">
          {isSelectedChat && vendorId ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">👨‍💼</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-yellow-800">
                  Vendor: {vendorId}
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
          {userId && (vendorId || isSelectedChat) ? (
            <ChatMessages
              key={`${chatId}-${vendorId}-${roomId}`} // Force re-render when values change
              chatId={chatId}
              userId={userId}
              roomId={roomId}
              vendorId={vendorId}
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