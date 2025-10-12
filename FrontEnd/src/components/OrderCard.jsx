import React, { useState } from 'react';
import { formatCurrency } from '../utils/currency';
import CancelOrderModal from './CancelOrderModal';

function OrderCard({ order, userRole, onStatusUpdate, onCancelOrder, onConfirmDelivery }) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedShopOrder, setSelectedShopOrder] = useState(null);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'preparing': return 'bg-orange-100 text-orange-800';
            case 'prepared': return 'bg-indigo-100 text-indigo-800';
            case 'drone assigned': return 'bg-cyan-100 text-cyan-800';
            case 'out for delivery': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getNextStatus = (currentStatus) => {
        switch (currentStatus) {
            case 'pending': return 'confirmed';
            case 'confirmed': return 'preparing';
            case 'preparing': return 'prepared';
            case 'prepared': return 'drone assigned'; // This will be handled by drone assignment
            case 'drone assigned': return 'out for delivery'; // Auto-transition
            case 'out for delivery': return 'delivered';
            default: return null;
        }
    };

    const handleCancelClick = (shopOrder) => {
        setSelectedShopOrder(shopOrder);
        setShowCancelModal(true);
    };

    const handleCancelConfirm = (cancelReason) => {
        onCancelOrder(order._id, selectedShopOrder._id, cancelReason);
        setShowCancelModal(false);
        setSelectedShopOrder(null);
    };

    const handleCancelClose = () => {
        setShowCancelModal(false);
        setSelectedShopOrder(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                        Order #{order._id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-[#00BFFF]">
                        {formatCurrency(order.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-600">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                </div>
            </div>

            <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">Delivery Address:</p>
                <p className="text-sm font-medium">{order.deliveryAddress.text}</p>
            </div>

            {userRole === 'user' && (
                <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Customer:</p>
                    <p className="text-sm font-medium">{order.user?.name}</p>
                </div>
            )}

            {order.shopOrder.map((shopOrder, index) => (
                <div key={index} className="border-t pt-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-800">
                            {shopOrder.shop?.name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shopOrder.status)}`}>
                            {shopOrder.status}
                        </span>
                    </div>

                    {userRole === 'owner' && (
                        <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-1">Customer:</p>
                            <p className="text-sm font-medium">{order.user?.name}</p>
                            <p className="text-xs text-gray-500">{order.user?.mobile}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        {shopOrder.shopOrderItems.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={item.item?.image}
                                        alt={item.name}
                                        className="w-8 h-8 rounded object-cover"
                                    />
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-gray-500">x{item.quantity}</span>
                                </div>
                                <span className="font-medium">
                                    {formatCurrency(item.price * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                        <span className="text-sm font-medium">Subtotal:</span>
                        <span className="font-bold text-[#00BFFF]">
                            {formatCurrency(shopOrder.subtotal)}
                        </span>
                    </div>

                    {shopOrder.status === 'cancelled' && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                            <p className="text-sm font-medium text-red-800 mb-1">The order has been canceled</p>
                            <p className="text-sm text-red-600">Reason: {shopOrder.cancelReason}</p>
                            {shopOrder.cancelledAt && (
                                <p className="text-xs text-red-500 mt-1">
                                    Cancelled at: {new Date(shopOrder.cancelledAt).toLocaleString('vi-VN')}
                                </p>
                            )}
                        </div>
                    )}

                    {userRole === 'owner' && shopOrder.status !== 'delivered' && shopOrder.status !== 'cancelled' && (
                        <div className="mt-3 space-y-2">
                            {/* Regular status update button */}
                            {shopOrder.status !== 'prepared' && shopOrder.status !== 'drone assigned' && (
                                <button
                                    onClick={() => {
                                        const nextStatus = getNextStatus(shopOrder.status);
                                        if (nextStatus) {
                                            onStatusUpdate(order._id, shopOrder._id, nextStatus);
                                        }
                                    }}
                                    className="w-full bg-[#00BFFF] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#0090cc] transition-colors"
                                >
                                    {shopOrder.status === 'pending' && 'Confirm Order'}
                                    {shopOrder.status === 'confirmed' && 'Start Preparing'}
                                    {shopOrder.status === 'preparing' && 'Mark as Prepared'}
                                    {shopOrder.status === 'out for delivery' && 'Mark as Delivered'}
                                </button>
                            )}

                            {/* Assign Drone button for prepared orders */}
                            {shopOrder.status === 'prepared' && (
                                <button
                                    onClick={() => {
                                        // This will trigger drone assignment modal
                                        // For now, we'll update status to drone assigned
                                        onStatusUpdate(order._id, shopOrder._id, 'drone assigned');
                                    }}
                                    className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                                >
                                    Assign Drone
                                </button>
                            )}

                            {/* Drone assigned status info */}
                            {shopOrder.status === 'drone assigned' && (
                                <div className="w-full bg-cyan-100 text-cyan-800 py-2 px-4 rounded-lg text-center font-medium">
                                    Drone Assigned - Preparing for Delivery
                                </div>
                            )}

                            {/* Chỉ hiển thị nút Cancel khi status là pending */}
                            {shopOrder.status === 'pending' && (
                                <button
                                    onClick={() => handleCancelClick(shopOrder)}
                                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
                                >
                                    Cancel order
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Customer Actions */}
            {userRole === 'user' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    {order.shopOrder.some(shopOrder => shopOrder.status === 'out for delivery') && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Delivery Status:</h4>
                            {order.shopOrder.map((shopOrder, index) => (
                                shopOrder.status === 'out for delivery' && (
                                    <div key={index} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-purple-800">{shopOrder.shop?.name}</p>
                                            <p className="text-sm text-purple-600">Drone is on the way to your location</p>
                                        </div>
                                        <button
                                            onClick={() => onConfirmDelivery(order._id, shopOrder._id)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                        >
                                            Confirm Received
                                        </button>
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    {order.shopOrder.every(shopOrder => shopOrder.status === 'delivered') && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                            <p className="text-green-800 font-medium">✅ All orders have been delivered successfully!</p>
                        </div>
                    )}
                </div>
            )}

            <CancelOrderModal
                isOpen={showCancelModal}
                onClose={handleCancelClose}
                onConfirm={handleCancelConfirm}
                orderInfo={{
                    orderId: order._id,
                    shopName: selectedShopOrder?.shop?.name,
                    customerName: order.user?.name
                }}
                loading={false}
            />
        </div>
    );
}

export default OrderCard;
