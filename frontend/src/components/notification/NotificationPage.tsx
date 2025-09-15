import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import socket from '@/hooks/socketHook';
import { addNotifications,addSingleNotification } from '@/redux/slices/notification/notificationSlice';
import Navbar from '../client/navbar/Navbar';
import { NotificationDropdown } from './NotificationDropdown';
import { RootState } from '@/redux/Store';

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
  type: 'info';
}

export const NotificationPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  const client = useSelector((state: RootState) => state.clientSlice.client);
  const vendor = useSelector((state: RootState) => state.vendorSlice.vendor);
  const notifications = useSelector((state: RootState) => state.notificationSlice?.notifications || []);

  const user = path === 'vendor' ? vendor : client;
  const userId = user?._id;
  const [newNotification, setNewNotification] = useState<Notification | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (!socket.connected) socket.connect();
    console.log('Connecting socket for notifications');

    const handleConnect = () => {
      console.log('Connected with socket id', socket.id);

      // Register user
      socket.emit('register', { userId: user._id, name: user.name }, (data: Notification[]) => {
        console.log('Registration successful, received notifications:', data);
        dispatch(addNotifications(data || []));
      });
    };

    const handleDisconnect = () => {
      console.log('Socket disconnected with', socket.id);
    };

    const handleNewNotification = (data: Notification) => {
      console.log('New notification received:', data);
      const notification: Notification = {
        ...data,
        type: 'info',
      };
      setNewNotification(notification);
      dispatch(addSingleNotification(data));
      setShowNotification(true);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('notification', handleNewNotification);

    // Register if already connected
    if (socket.connected) {
      socket.emit('register', { userId: user._id, name: user.name }, (data: Notification[]) => {
        console.log('Registration successful, received notifications:', data);
        dispatch(addNotifications(data || []));
      });
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('notification', handleNewNotification);
    };
  }, [user, dispatch, navigate]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
        setNewNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(addSingleNotification({ _id: notificationId, read: true }));
    socket.emit('markNotificationAsRead', { notificationId });
  };

  const handleSelectNotification = (notification: Notification) => {
    if (!notification.read && notification._id) {
      handleMarkAsRead(notification._id);
    }
    navigate(path === 'vendor' ? '/vendor/chat' : '/chat', {
      state: { vendorId: notification.from._id, selectedChat: true },
    });
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
  };

  // Debug logs
  useEffect(() => {
    console.log('Current state:', {
      userId,
      path,
      notifications,
      newNotification,
      showNotification,
    });
  }, [userId, path, notifications, newNotification, showNotification]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      
      {showNotification && newNotification && (
        <div className="fixed top-20 right-4 z-50">
          <NotificationDropdown
            notifications={[newNotification]}
            onMarkAsRead={handleMarkAsRead}
            onSelectNotification={handleSelectNotification}
            onViewAllNotifications={handleViewAllNotifications}
            isToast
            onClose={() => setShowNotification(false)}
          />
        </div>
      )}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-yellow-800">
          <div className="text-6xl mb-4">🔔</div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-lg mt-2 text-yellow-600">
            View your notifications in the dropdown above
          </p>
        </div>
      </div>
    </div>
  );
};