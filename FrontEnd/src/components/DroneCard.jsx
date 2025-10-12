import React from 'react';
import { FaPlane, FaCog, FaCheckCircle, FaClock } from 'react-icons/fa';

function DroneCard({ drone, onStatusUpdate, onAssignOrder }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-800 border-green-200';
            case 'Busy': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Maintenance': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Available': return <FaCheckCircle className="text-green-600" />;
            case 'Busy': return <FaClock className="text-blue-600" />;
            case 'Maintenance': return <FaCog className="text-red-600" />;
            default: return <FaPlane className="text-gray-600" />;
        }
    };

    const getLastAssignedText = () => {
        if (!drone.lastAssignedAt) return 'Never assigned';
        const date = new Date(drone.lastAssignedAt);
        return `Last assigned: ${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className={`bg-white rounded-lg border-2 p-4 shadow-sm hover:shadow-md transition-all duration-200 ${getStatusColor(drone.status)}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                        <FaPlane size={20} className="text-[#00BFFF]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{drone.name}</h3>
                        <p className="text-sm opacity-75">{getLastAssignedText()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusIcon(drone.status)}
                    <span className="font-medium">{drone.status}</span>
                </div>
            </div>

            {drone.status === 'Busy' && drone.assignedOrderId && (
                <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                        <strong>Assigned to Order:</strong> #{drone.assignedOrderId.slice(-8)}
                    </p>
                </div>
            )}

            {drone.status === 'Maintenance' && drone.maintenanceReason && (
                <div className="mb-3 p-2 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">
                        <strong>Reason:</strong> {drone.maintenanceReason}
                    </p>
                </div>
            )}

            <div className="flex gap-2">
                {drone.status === 'Available' && (
                    <button
                        onClick={() => onStatusUpdate(drone._id, 'Maintenance')}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                        Set Maintenance
                    </button>
                )}

                {drone.status === 'Maintenance' && (
                    <button
                        onClick={() => onStatusUpdate(drone._id, 'Available')}
                        className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                        Set Available
                    </button>
                )}

                {drone.status === 'Available' && (
                    <button
                        onClick={() => onAssignOrder(drone)}
                        className="flex-1 px-3 py-2 bg-[#00BFFF] text-white rounded-lg hover:bg-[#0090cc] transition-colors text-sm font-medium"
                    >
                        Assign Order
                    </button>
                )}
            </div>
        </div>
    );
}

export default DroneCard;
