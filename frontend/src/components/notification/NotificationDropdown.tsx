import React, { Component, ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Trash2, X } from 'lucide-react';

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
  onDeleteNotification: (notificationId: string) => void;
  onClearAllNotifications?: () => void;
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
    console.error('Notification Error:', error, errorInfo);
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
  onDeleteNotification,
  onClearAllNotifications,
  isToast = false,
  onClose,
}) => {
  // Generate unique key for notification
  const getNotificationKey = (notification: Notification, index: number): string => {
    if (notification._id) {
      return notification._id;
    }
    // Fallback to a combination of available unique properties
    return `notification-${notification.from._id}-${notification.createdAt}-${index}`;
  };
console.log(notifications)
  // Ensure notifications is always an array and has valid data
  const validNotifications = Array.isArray(notifications) 
    ? notifications
        .filter(n => n && typeof n === 'object' && n.from && n.message)
        .sort((a, b) => {
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

  const handleDelete = (e: React.MouseEvent, notificationId: string | undefined) => {
    e.stopPropagation();
    if (notificationId) {
      onDeleteNotification(notificationId);
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
        <>
          <div className="flex items-center justify-between px-2 py-2">
            <DropdownMenuLabel className="text-yellow-800 font-semibold p-0">
              Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
            </DropdownMenuLabel>
            {validNotifications.length > 0 && onClearAllNotifications && (
              <button
                className="text-xs text-red-500 hover:text-red-700 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearAllNotifications();
                }}
                title="Clear all notifications"
              >
                Clear All
              </button>
            )}
          </div>
          <DropdownMenuSeparator className="bg-yellow-200" />
        </>
      )}
      
      {validNotifications.length === 0 ? (
        <div className="p-4 text-center text-yellow-600">
          {notifications.length === 0 ? 'No notifications' : 'No valid notifications found'}
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {validNotifications.slice(0, isToast ? 1 : 5).map((notification, index) => (
            <div
              key={getNotificationKey(notification, index)}
              className={`flex flex-col items-start p-3 border-b border-yellow-100 last:border-b-0 ${
                notification.read ? 'bg-yellow-50' : 'bg-yellow-100'
              } hover:bg-yellow-200 cursor-pointer transition-colors relative group`}
              onClick={() => {
                onSelectNotification(notification);
                if (isToast && onClose) {
                  onClose();
                }
              }}
            >
              {/* Delete button */}
              

              <div className="flex justify-between w-full items-start pr-8">
                <span className="font-medium text-yellow-800 text-sm">
                  {notification.from?.name || 'Unknown'}
                </span>
                <span className="text-xs text-yellow-500 whitespace-nowrap ml-2">
                  {formatTime(notification.createdAt)}
                </span>
              </div>
              
              <p className="text-sm text-yellow-600 mt-1 line-clamp-2 break-words w-full pr-6">
                {notification.message || 'No message content'}
              </p>
              
              
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