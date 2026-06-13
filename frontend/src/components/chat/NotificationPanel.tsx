'use client';
import { useNotificationStore } from '@/store/notification.store';
import apiClient from '@/lib/api.client';

interface Props {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: Props) {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const handleMarkAsRead = async (id: string) => {
    await apiClient.put(`/notifications/${id}/read`);
    markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await apiClient.put('/notifications/read-all');
    markAllAsRead();
  };

  return (
    <div className="absolute top-16 left-4 right-4 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 max-h-96 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
            aria-label="Close notifications"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

     <div className="overflow-y-auto flex-1">
  {notifications.length === 0 ? (
    <div className="flex items-center justify-center h-24">
      <p className="text-gray-400 text-sm">No notifications</p>
    </div>
  ) : (
    <div>
      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => !n.isRead && handleMarkAsRead(n.id)}
          className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${
            !n.isRead ? 'bg-blue-50' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">
              {n.type === 'new_message'
                ? `New message${n.payload?.senderName ? ` from ${n.payload.senderName}` : ''}`
                : n.type}
            </p>
            {n.payload?.preview && (
              <p className="text-xs text-gray-400 truncate">{n.payload.preview}</p>
            )}
            <p className="text-xs text-gray-300 mt-0.5">
              {new Date(n.createdAt).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          {!n.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
          )}
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  );
}