import React from 'react';
import { RxCross2 } from 'react-icons/rx';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

function NotificationToast({ notification, onClose }) {
    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FaCheckCircle className="text-green-500" />;
            case 'error': return <FaTimesCircle className="text-red-500" />;
            case 'warning': return <FaExclamationCircle className="text-yellow-500" />;
            default: return <FaInfoCircle className="text-blue-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200';
            case 'error': return 'bg-red-50 border-red-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    const getTextColor = (type) => {
        switch (type) {
            case 'success': return 'text-green-800';
            case 'error': return 'text-red-800';
            case 'warning': return 'text-yellow-800';
            default: return 'text-blue-800';
        }
    };

    return (
        <div className={`fixed top-20 right-4 z-50 max-w-sm w-full ${getBgColor(notification.type)} border rounded-lg shadow-lg p-4 animate-slide-in`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${getTextColor(notification.type)}`}>
                        {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {notification.timestamp.toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                <button
                    onClick={() => onClose(notification.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <RxCross2 size={16} />
                </button>
            </div>
        </div>
    );
}

export default NotificationToast;
