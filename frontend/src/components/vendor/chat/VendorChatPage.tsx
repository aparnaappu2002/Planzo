import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import socket from '@/hooks/socketHook';
import { VendorChatList } from './VendorChatList';
import { VendorChatMessages } from './VendorChatMessage';
import { RootState } from '@/redux/Store';

interface Chat {
  _id: string;
  clientId: string;
  vendorId: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

export const VendorChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clientId: stateClientId, vendorId: stateVendorId, selectedChat } = location.state || {};
  
  const vendorId = useSelector((state: RootState) => state.vendorSlice.vendor?._id);
  const clientId = useSelector((state: RootState) => state.clientSlice.client?._id);
  
  // Check if client is trying to access vendor chat page
  useEffect(() => {
    if (clientId && !vendorId) {
      // Client is logged in, redirect to client chat page
      navigate('/chat', { 
        state: location.state,
        replace: true 
      });
    }
  }, [clientId, vendorId, navigate, location.state]);
  
  const [clientIdState, setClientIdState] = useState<string>(stateClientId || '');
  const stateRoomId = stateClientId && stateVendorId ? stateClientId + stateVendorId : '';
  const selectedRoomId = clientIdState + vendorId;
  const [isSelectedChat, setIsSelectedChat] = useState<boolean>(selectedChat ?? false);
  const [roomId, setRoomId] = useState<string>(stateRoomId || selectedRoomId);
  const [chatId, setChatId] = useState<string>('');
  const userId = vendorId;

  // Don't render if client is logged in (will redirect)
  if (clientId && !vendorId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-yellow-600 animate-pulse">Redirecting...</div>
      </div>
    );
  }

  // Don't render if no vendor is logged in
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Please log in as a vendor to view chats</div>
      </div>
    );
  }

  useEffect(() => {
    if (!socket.connected) socket.connect();
    console.log('connecting chat websocket');
    
    const handleConnect = () => {
      console.log('Connected with socket id', socket.id);
      
      // Register user when connected
      if (userId) {
        socket.emit('register', { userId, name: 'Vendor User' }, (notifications) => {
          console.log('Registration successful, received notifications:', notifications);
        });
      }
      
      // Join room if available
      if (roomId) {
        socket.emit('joinRoom', { roomId });
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
        socket.emit('register', { userId, name: 'Vendor User' }, (notifications) => {
          console.log('Registration successful, received notifications:', notifications);
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
    const newRoomId = chat.clientId + chat.vendorId;
    
    setChatId(chat._id);
    setRoomId(newRoomId);
    setClientIdState(chat.clientId);
    setIsSelectedChat(true);
    
    // Join the new room
    if (socket.connected) {
      socket.emit('joinRoom', { roomId: newRoomId });
    }
    
    console.log('Selected chat:', {
      chatId: chat._id,
      clientId: chat.clientId,
      vendorId: chat.vendorId,
      roomId: newRoomId
    });
  };

  // Get the current client ID for the receiver
  const currentClientId = clientIdState || stateClientId;

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="w-80 bg-white shadow-xl border-r border-yellow-200 flex flex-col">
        <div className="p-4 border-b border-yellow-200 bg-gradient-to-r from-yellow-500 to-yellow-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-semibold">👨‍💼</span>
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">Vendor Messages</h1>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <VendorChatList userId={userId} onSelectChat={handleSelectChat} />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-yellow-200 p-4 shadow-sm">
          {chatId ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">👤</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-yellow-800">
                  Client: {currentClientId || 'Unknown'}
                </h2>
                <p className="text-sm text-yellow-600">Chat with client</p>
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
          <VendorChatMessages
            chatId={chatId}
            userId={userId}
            roomId={roomId}
            socket={socket}
            receiverId={currentClientId}
            receiverModel="client"
          />
        </div>
      </div>
    </div>
  );
};