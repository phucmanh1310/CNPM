// src/components/Toast.jsx
import React, { useEffect, useState } from 'react';
import { FaCheck, FaExclamationTriangle, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';

function Toast({
    message,
    type = 'success', // success, error, warning, info
    isVisible,
    onClose,
    duration = 3000
}) {
    const [isShowing, setIsShowing] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsShowing(true);
            const timer = setTimeout(() => {
                setIsShowing(false);
                setTimeout(onClose, 300); // Wait for animation to finish
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheck className="w-5 h-5 text-green-600" />;
            case 'error':
                return <FaTrash className="w-5 h-5 text-red-600" />;
            case 'warning':
                return <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />;
            case 'info':
                return <FaShoppingCart className="w-5 h-5 text-blue-600" />;
            default:
                return <FaCheck className="w-5 h-5 text-green-600" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-green-50 border-green-200';
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className={`
                ${getBgColor()} 
                border rounded-lg shadow-lg p-4 max-w-sm
                transform transition-all duration-300 ease-in-out
                ${isShowing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}>
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{message}</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsShowing(false);
                            setTimeout(onClose, 300);
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <IoClose className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Toast;
