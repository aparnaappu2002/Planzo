import React, { Component, ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';

interface Notification {
  _id?: string;
  from: { _id: string; name: string };
  message: string;
  read: boolean;
  to: string;
  createdAt: string;
  updatedAt: string;
  senderModel: 'client' | 'vendors';
  receiverModel: 'client' | 'vendors';
  __v?: number;
  type?: 'info';
}

interface NotificationDropdownProps {
  notifications?: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onSelectNotification: (notification: Notification) => void;
  onViewAllNotifications: () => void;
  isToast?: boolean;
  onClose?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class NotificationErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-yellow-600">
          Error loading notifications. Please try again.
        </div>
      );
    }
    return this.props.children;
  }
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications = [],
  onMarkAsRead,
  onSelectNotification,
  onViewAllNotifications,
  isToast = false,
  onClose,
}) => {
  

  // Ensure notifications is always an array and has valid data
  const validNotifications = Array.isArray(notifications) 
    ? notifications
        .filter(n => n && typeof n === 'object' && n.from && n.message)
        .sort((a, b) => {
          // More robust sorting with fallback
          const dateA = new Date(a.createdAt || a.updatedAt || 0);
          const dateB = new Date(b.createdAt || b.updatedAt || 0);
          
          
          
          return dateB.getTime() - dateA.getTime(); // Most recent first
        })
    : [];


  const unreadCount = validNotifications.filter((n) => !n.read).length;

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  };

  const content = (
    <div
      className={`${
        isToast
          ? 'w-80 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-2 z-[9999]'
          : 'w-80 bg-yellow-50 border border-yellow-200 z-[9999]'
      }`}
    >
      {!isToast && (
        <DropdownMenuLabel className="text-yellow-800 font-semibold">
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </DropdownMenuLabel>
      )}
      {!isToast && <DropdownMenuSeparator className="bg-yellow-200" />}
      
      {validNotifications.length === 0 ? (
        <div className="p-4 text-center text-yellow-600">
          {notifications.length === 0 ? 'No notifications' : 'No valid notifications found'}
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {validNotifications.slice(0, isToast ? 1 : 5).map((notification, index) => (
            <div
              key={notification._id || `${notification.createdAt}-${notification.from._id}-${index}`}
              className={`flex flex-col items-start p-3 border-b border-yellow-100 last:border-b-0 ${
                notification.read ? 'bg-yellow-50' : 'bg-yellow-100'
              } hover:bg-yellow-200 cursor-pointer transition-colors`}
              onClick={() => {
                onSelectNotification(notification);
                if (isToast && onClose) {
                  onClose();
                }
              }}
            >
              <div className="flex justify-between w-full items-start">
                <span className="font-medium text-yellow-800 text-sm">
                  {notification.from?.name }
                </span>
                <span className="text-xs text-yellow-500 whitespace-nowrap ml-2">
                  {formatTime(notification.createdAt)}
                </span>
              </div>
              <p className="text-sm text-yellow-600 mt-1 line-clamp-2 break-words w-full">
                {notification.message || 'No message content'}
              </p>
              {!notification.read && notification._id && (
                <button
                  className="text-xs text-yellow-500 hover:text-yellow-700 mt-2 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification._id);
                  }}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
          
          {validNotifications.length > 5 && !isToast && (
            <div className="p-2 text-center">
              <span className="text-xs text-yellow-500">
                Showing 5 of {validNotifications.length} notifications
              </span>
            </div>
          )}
        </div>
      )}
      
      {!isToast && (
        <>
          <DropdownMenuSeparator className="bg-yellow-200" />
          <div
            className="text-yellow-800 hover:bg-yellow-200 p-2 cursor-pointer text-center font-medium"
            onClick={() => {
              onViewAllNotifications();
            }}
          >
            View All Notifications
          </div>
        </>
      )}
      
      {isToast && onClose && (
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-yellow-200">
          <button
            className="text-xs text-yellow-600 hover:text-yellow-800 font-medium"
            onClick={() => {
              onViewAllNotifications();
              onClose();
            }}
          >
            View All
          </button>
          <button
            className="text-xs text-yellow-500 hover:text-yellow-700 font-medium"
            onClick={() => {
              onClose();
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );

  return (
    <NotificationErrorBoundary>
      {isToast ? (
        content
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex items-center gap-1 p-2 rounded-md hover:bg-yellow-100 transition-colors"
              title={`Notifications (${unreadCount} unread)`}
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell className="w-5 h-5 text-yellow-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-[9999] p-0">
            {content}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </NotificationErrorBoundary>
  );
};