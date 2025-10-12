import React, { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { FaPlane } from 'react-icons/fa';

function AssignDroneModal({ isOpen, onClose, onConfirm, drones, orderInfo, loading }) {
    const [selectedDroneId, setSelectedDroneId] = useState('');
    const [maintenanceReason, setMaintenanceReason] = useState('');

    const availableDrones = drones.filter(drone => drone.status === 'Available');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedDroneId) {
            alert('Please select a drone');
            return;
        }
        onConfirm(selectedDroneId);
    };

    const handleClose = () => {
        setSelectedDroneId('');
        setMaintenanceReason('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <FaPlane className="text-[#00BFFF]" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">Assign Drone</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <RxCross2 size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Order Details:</p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-medium text-gray-800">
                                Order #{orderInfo?.orderId?.slice(-8)}
                            </p>
                            <p className="text-sm text-gray-600">
                                {orderInfo?.shopName}
                            </p>
                            <p className="text-sm text-gray-600">
                                Customer: {orderInfo?.customerName}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Available Drone *
                            </label>

                            {availableDrones.length === 0 ? (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-yellow-800 text-sm">
                                        No available drones. Please set a drone to Available status first.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableDrones.map((drone) => (
                                        <label key={drone._id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="drone"
                                                value={drone._id}
                                                checked={selectedDroneId === drone._id}
                                                onChange={(e) => setSelectedDroneId(e.target.value)}
                                                className="mr-3"
                                                disabled={loading}
                                            />
                                            <div className="flex items-center gap-3">
                                                <FaPlane className="text-[#00BFFF]" size={16} />
                                                <div>
                                                    <span className="font-medium">{drone.name}</span>
                                                    <p className="text-xs text-gray-500">
                                                        {drone.lastAssignedAt
                                                            ? `Last assigned: ${new Date(drone.lastAssignedAt).toLocaleDateString('vi-VN')}`
                                                            : 'Never assigned'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-[#00BFFF] text-white rounded-lg hover:bg-[#0090cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || availableDrones.length === 0}
                            >
                                {loading ? 'Assigning...' : 'Assign Drone'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AssignDroneModal;
