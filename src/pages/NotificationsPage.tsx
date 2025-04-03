import React from 'react';
import { Bell, Check, Trash, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNotifications } from '../hooks/useNotifications';
import { formatDate } from '../lib/utils';
import { toast } from 'react-hot-toast';

const NotificationsPage: React.FC = () => {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      toast.error('Failed to mark notification as read');
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
      console.error(error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
      console.error(error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="h-5 w-5 text-yellow-500" />;
      case 'threshold':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'mention':
        return <Bell className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {notifications.some(n => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            icon={<Check className="h-4 w-4" />}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500 mt-1">
              You don't have any notifications at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-200">
              {notifications.map(notification => (
                <li
                  key={notification.id}
                  className={`py-4 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0 flex">
                      {!notification.read && (
                        <button
                          type="button"
                          className="mr-2 text-blue-600 hover:text-blue-800"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
