import React, { useState, useEffect, useRef } from 'react';
import { useLoadChatsInfiniteVendor } from '@/hooks/vendorCustomHooks';
import { useInfiniteScrollObserver } from '@/hooks/useInfiniteScrollObserver';

interface Chat {
  _id: string;
  clientId: string;
  vendorId: string;
  lastMessage?: string;
  lastMessageTime?: string;
  clientName?: string;
  vendorName?: string;
  otherPartyName?: string;
  otherPartyProfileImage?: string;
}

interface VendorChatListProps {
  userId: string;
  onSelectChat: (chat: Chat) => void;
}

export const VendorChatList: React.FC<VendorChatListProps> = ({ userId, onSelectChat }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useLoadChatsInfiniteVendor(userId);
    console.log("VendorChats:",data)
  const loaderRef = useRef<HTMLDivElement>(null);
  const { getObserverRef, disconnect } = useInfiniteScrollObserver();
  const chats = data?.pages.flatMap(page => page.chats) || [];

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

  // Helper function to normalize chat data from API response
  const normalizeChat = (rawChat: any): Chat => {
    console.log('Vendor - Raw chat from API:', rawChat);

    // Extract IDs and names from nested objects
    const senderId = rawChat.senderId?._id || rawChat.senderId;
    const receiverId = rawChat.receiverId?._id || rawChat.receiverId;
    const senderName = rawChat.senderId?.name || 'Unknown';
    const receiverName = rawChat.receiverId?.name || 'Unknown';
    const senderProfileImage = rawChat.senderId?.profileImage;
    const receiverProfileImage = rawChat.receiverId?.profileImage;

    console.log('Vendor - Extracted IDs:', { senderId, receiverId, userId });

    // For vendor side, determine which is client and which is vendor
    // The current user (userId) is the vendor, so the other party is the client
    let clientId, vendorId, clientName, vendorName, otherPartyName, otherPartyProfileImage;
    
    if (senderId === userId) {
      vendorId = senderId;
      clientId = receiverId;
      vendorName = senderName;
      clientName = receiverName;
      otherPartyName = receiverName;
      otherPartyProfileImage = receiverProfileImage;
    } else {
      vendorId = receiverId;
      clientId = senderId;
      vendorName = receiverName;
      clientName = senderName;
      otherPartyName = senderName;
      otherPartyProfileImage = senderProfileImage;
    }

    const normalizedChat = {
      _id: rawChat._id,
      clientId: clientId,
      vendorId: vendorId,
      clientName: clientName,
      vendorName: vendorName,
      otherPartyName: otherPartyName,
      otherPartyProfileImage: otherPartyProfileImage,
      lastMessage: rawChat.lastMessage,
      lastMessageTime: rawChat.lastMessageAt || rawChat.lastMessageTime,
    };

    console.log('Vendor - Normalized chat:', normalizedChat);
    return normalizedChat;
  };

  const handleChatClick = (rawChat: any) => {
    const normalizedChat = normalizeChat(rawChat);
    onSelectChat(normalizedChat);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-yellow-600 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p>Loading chats...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-600 text-center">
          <div className="text-xl mb-2">⚠️</div>
          <p>Error loading chats</p>
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-yellow-500 text-center">
          <div className="text-2xl mb-2">💬</div>
          <p>No chats available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-1 p-2">
        {chats.map((rawChat) => {
          const normalizedChat = normalizeChat(rawChat);

          return (
            <div
              key={rawChat._id}
              className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border border-yellow-200 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              onClick={() => handleChatClick(rawChat)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {normalizedChat.otherPartyProfileImage ? (
                    <img 
                      src={normalizedChat.otherPartyProfileImage} 
                      alt={normalizedChat.otherPartyName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-yellow-300"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                      <span className="text-yellow-700 text-sm font-semibold">👤</span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-yellow-800">
                      {normalizedChat.otherPartyName}
                    </div>
                    <div className="text-xs text-yellow-600">Client</div>
                  </div>
                </div>
                {rawChat.lastMessageAt && (
                  <div className="text-xs text-yellow-500">
                    {new Date(rawChat.lastMessageAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
              <div className="text-sm text-yellow-600 truncate pl-13">
                {rawChat.lastMessage || 'No messages yet'}
              </div>
            </div>
          );
        })}

        {hasNextPage && <div ref={loaderRef} className="h-1" />}

        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full mr-2"></div>
            <span className="text-yellow-600 text-sm">Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
};