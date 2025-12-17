import React from 'react';
import { useLoadChatsInfinite } from '@/hooks/clientCustomHooks';

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

interface ChatListProps {
  userId: string;
  onSelectChat: (chat: Chat) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ userId, onSelectChat }) => {
  const { data, fetchNextPage, hasNextPage, isLoading, isError } = useLoadChatsInfinite(userId);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasNextPage) {
      fetchNextPage();
    }
  };

  // Helper function to normalize chat data from API response
  const normalizeChat = (rawChat: any): Chat => {
    
    // Extract IDs and names from nested objects
    const senderId = rawChat.senderId?._id || rawChat.senderId;
    const receiverId = rawChat.receiverId?._id || rawChat.receiverId;
    const senderName = rawChat.senderId?.name || 'Unknown';
    const receiverName = rawChat.receiverId?.name || 'Unknown';
    const senderProfileImage = rawChat.senderId?.profileImage;
    const receiverProfileImage = rawChat.receiverId?.profileImage;
    
    
    // Determine which is client and which is vendor
    // The current user (userId) could be either sender or receiver
    let clientId, vendorId, clientName, vendorName, otherPartyName, otherPartyProfileImage;
    
    if (senderId === userId) {
      clientId = senderId;
      vendorId = receiverId;
      clientName = senderName;
      vendorName = receiverName;
      otherPartyName = receiverName;
      otherPartyProfileImage = receiverProfileImage;
    } else {
      clientId = receiverId;
      vendorId = senderId;
      clientName = receiverName;
      vendorName = senderName;
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
      lastMessageTime: rawChat.lastMessageAt || rawChat.lastMessageTime
    };
    
    return normalizedChat;
  };

  const handleChatClick = (rawChat: any) => {
    const normalizedChat = normalizeChat(rawChat);
    onSelectChat(normalizedChat);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-yellow-600 animate-pulse">Loading chats...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">Error loading chats</div>
      </div>
    );
  }

  const chats = data?.pages.flatMap(page => page.chats) || [];

  return (
    <div className="h-full overflow-y-auto" onScroll={handleScroll}>
      <div className="space-y-2 p-2">
        {chats.length === 0 ? (
          <div className="text-center text-yellow-500 py-8">
            <p className="text-lg">No chats yet</p>
            <p className="text-sm">Start a conversation to see it here</p>
          </div>
        ) : (
          <>
            {chats.map(rawChat => {
              const normalizedChat = normalizeChat(rawChat);
              
              return (
                <div
                  key={rawChat._id}
                  className="p-4 bg-yellow-100 hover:bg-yellow-200 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] shadow-sm border border-yellow-200"
                  onClick={() => handleChatClick(rawChat)}
                >
                  <div className="flex justify-between items-start gap-3">
                    {/* Profile Image */}
                    {normalizedChat.otherPartyProfileImage && (
                      <img 
                        src={normalizedChat.otherPartyProfileImage} 
                        alt={normalizedChat.otherPartyName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-300"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-yellow-800 truncate text-lg">
                        {normalizedChat.otherPartyName}
                      </div>
                      <div className="text-sm text-yellow-600 truncate mt-1">
                        {rawChat.lastMessage || "No messages yet"}
                      </div>
                    </div>
                    
                    {rawChat.lastMessageAt && (
                      <div className="text-xs text-yellow-500 whitespace-nowrap">
                        {new Date(rawChat.lastMessageAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              );
            })}
            {hasNextPage && (
              <div className="text-center py-4">
                <div className="text-yellow-600 text-sm animate-pulse">Loading more chats...</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};