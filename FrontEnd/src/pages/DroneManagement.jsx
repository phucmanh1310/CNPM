import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { FaPlane } from 'react-icons/fa';
import useGetShopDrones from '../hooks/useGetShopDrones';
import DroneCard from '../components/DroneCard';
import AssignDroneModal from '../components/AssignDroneModal';
import Toast from '../components/Toast';
import axios from 'axios';
import { serverURL } from '../App';

function DroneManagement() {
    const navigate = useNavigate();
    const { myShopData } = useSelector(state => state.owner);
    const { drones, loading, error, refetch } = useGetShopDrones(myShopData?._id);

    const [updating, setUpdating] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDrone, setSelectedDrone] = useState(null);

    const handleStatusUpdate = async (droneId, newStatus) => {
        try {
            setUpdating(true);
            await axios.put(`${serverURL}/api/drone/updateStatus/${droneId}`, {
                status: newStatus
            }, { withCredentials: true });

            refetch();
            setToast({
                show: true,
                message: `Drone status updated to ${newStatus}`,
                type: 'success'
            });
        } catch (error) {
            console.error('Error updating drone status:', error);
            setToast({
                show: true,
                message: error.response?.data?.message || 'Failed to update drone status',
                type: 'error'
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleAssignOrder = (drone) => {
        setSelectedDrone(drone);
        setShowAssignModal(true);
    };

    const handleAssignConfirm = async (droneId) => {
        try {
            setUpdating(true);
            // This will be handled by the order management system
            // For now, just close the modal
            setShowAssignModal(false);
            setSelectedDrone(null);
            setToast({
                show: true,
                message: 'Drone assignment will be handled in order management',
                type: 'info'
            });
        } catch (error) {
            console.error('Error assigning drone:', error);
            setToast({
                show: true,
                message: 'Failed to assign drone',
                type: 'error'
            });
        } finally {
            setUpdating(false);
        }
    };

    if (!myShopData) {
        return (
            <div className="min-h-screen bg-[#fff9f6] pt-[100px] pb-[50px] px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <h2 className="text-xl font-semibold text-gray-600 mb-4">No Shop Found</h2>
                        <p className="text-gray-500 mb-6">You need to create a shop first to manage drones.</p>
                        <button
                            onClick={() => navigate('/create-edit-shop')}
                            className="px-6 py-2 bg-[#00BFFF] text-white rounded-lg hover:bg-[#0090cc] transition-colors"
                        >
                            Create Shop
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fff9f6] pt-[100px] pb-[50px] px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-[#00BFFF] text-lg">Loading drones...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#fff9f6] pt-[100px] pb-[50px] px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Drones</h2>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={refetch}
                            className="px-6 py-2 bg-[#00BFFF] text-white rounded-lg hover:bg-[#0090cc] transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const availableDrones = drones.filter(drone => drone.status === 'Available').length;
    const busyDrones = drones.filter(drone => drone.status === 'Busy').length;
    const maintenanceDrones = drones.filter(drone => drone.status === 'Maintenance').length;

    return (
        <div className="min-h-screen bg-[#fff9f6] pt-[100px] pb-[50px] px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                        onClick={() => navigate('/')}
                        title="Back to Home"
                    >
                        <IoIosArrowRoundBack size={24} className="text-[#00BFFF]" />
                    </button>
                    <div className="flex items-center gap-3">
                        <FaPlane size={32} className="text-[#00BFFF]" />
                        <h1 className="text-3xl font-bold text-gray-800">Drone Management</h1>
                    </div>
                </div>

                {/* Shop Info */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{myShopData.name}</h2>
                    <p className="text-gray-600">{myShopData.address}, {myShopData.city}</p>
                </div>

                {/* Drone Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{availableDrones}</div>
                        <div className="text-sm text-green-700">Available</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{busyDrones}</div>
                        <div className="text-sm text-blue-700">Busy</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{maintenanceDrones}</div>
                        <div className="text-sm text-red-700">Maintenance</div>
                    </div>
                </div>

                {/* Drones Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {drones.map((drone) => (
                        <DroneCard
                            key={drone._id}
                            drone={drone}
                            onStatusUpdate={handleStatusUpdate}
                            onAssignOrder={handleAssignOrder}
                        />
                    ))}
                </div>

                {/* Assign Drone Modal */}
                <AssignDroneModal
                    isOpen={showAssignModal}
                    onClose={() => {
                        setShowAssignModal(false);
                        setSelectedDrone(null);
                    }}
                    onConfirm={handleAssignConfirm}
                    drones={drones}
                    orderInfo={{
                        orderId: 'sample-order-id',
                        shopName: myShopData.name,
                        customerName: 'Sample Customer'
                    }}
                    loading={updating}
                />

                {/* Toast */}
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.show}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            </div>
        </div>
    );
}

export default DroneManagement;
