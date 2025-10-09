import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from 'react-icons/io';
import { IoLocationSharp, IoSearchOutline, IoMapOutline } from 'react-icons/io5';
import { TbCurrentLocation } from 'react-icons/tb';
import { FaMapMarkerAlt, FaRoute, FaCreditCard } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { MdDeliveryDining } from 'react-icons/md';
import { FaMobileScreenButton } from 'react-icons/fa6';
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents, Popup } from "react-leaflet";
import L from 'leaflet';
import {
    getCurrentLocation,
    geocodeAddress,
    getAddressSuggestions,
    clearSuggestions,
    setLocation,
    reverseGeocodeFromCoordinates
} from '../redux/mapSlice';
import { ClipLoader } from 'react-spinners';

// Debounce hook
function useDebounce(callback, delay) {
    const timerRef = useRef(null);
    return (...args) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => callback(...args), delay);
    };
}

// Icon tùy chỉnh cho delivery
const deliveryIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#00BFFF" stroke="#fff" stroke-width="2"/>
            <path d="M16 8l4 8h-3v8h-2v-8h-3l4-8z" fill="#fff"/>
        </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});
//hàm render marker dragable 
function DraggableMarker({ position, onDragEnd, address }) {
    const markerRef = useRef(null);
    return (
        <Marker
            draggable
            icon={deliveryIcon}
            position={[position.lat, position.lon]}
            eventHandlers={{
                dragend: () => {
                    const marker = markerRef.current;
                    if (marker) {
                        const { lat, lng } = marker.getLatLng();
                        onDragEnd({ lat, lon: lng });
                    }
                }
            }}
            ref={markerRef}
        >
            <Popup>
                <div className="text-center">
                    <FaMapMarkerAlt className="text-[#00BFFF] mx-auto mb-2" size={20} />
                    <div className="font-semibold text-sm">Địa điểm giao hàng</div>
                    <div className="text-xs text-gray-600 mt-1">{address || "Đang cập nhật..."}</div>
                </div>
            </Popup>
        </Marker>
    );
}
//hàm render map click để chọn vị trí
function MapClickHandler({ onSelect }) {
    useMapEvents({
        click(e) {
            onSelect({ lat: e.latlng.lat, lon: e.latlng.lng });
        }
    });
    return null;
}

// Component để force re-render map khi location thay đổi
function MapUpdater({ center, zoom }) {
    const map = useMapEvents({});

    useEffect(() => {
        if (center && center.lat && center.lon) {
            map.setView([center.lat, center.lon], zoom);
        }
    }, [center.lat, center.lon, zoom, map]);

    return null;
}
//main checkout
function CheckOut() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { location, address, suggestions, loading, searchLoading } = useSelector(state => state.map);
    const { cartItems } = useSelector((state) => state.user);
    const [inputAddress, setInputAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [mapType, setMapType] = useState('roadmap'); // roadmap, satellite, terrain
    const [showCoordinates, setShowCoordinates] = useState(false);

    // Key để force re-render MapContainer khi location thay đổi
    const [mapKey, setMapKey] = useState(0);

    // Tính toán tổng tiền
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;

    useEffect(() => {
        if (!location.lat || !location.lon) {
            dispatch(getCurrentLocation());
        }
    }, [dispatch, location.lat, location.lon]);

    useEffect(() => {
        setInputAddress(address || "");
    }, [address]);

    // Force re-render map khi location thay đổi
    useEffect(() => {
        setMapKey(prev => prev + 1);
    }, [location.lat, location.lon]);

    const debouncedSuggest = useDebounce((text) => {
        dispatch(getAddressSuggestions({ query: text, currentLocation: location }));
    }, 400);

    const onChangeAddress = (e) => {
        const val = e.target.value;
        setInputAddress(val);
        if (val.length >= 3) {
            debouncedSuggest(val);
        } else {
            dispatch(clearSuggestions());
        }
    };

    const onPickSuggestion = (sug) => {
        setInputAddress(sug.formatted);
        // Sử dụng originalFormatted để geocode chính xác hơn
        dispatch(geocodeAddress({
            address: sug.originalFormatted || sug.formatted,
            currentLocation: location
        }));
        dispatch(clearSuggestions());
        // Force re-render map ngay lập tức
        setMapKey(prev => prev + 1);
    };

    const onSearch = () => {
        if (inputAddress.trim()) {
            dispatch(geocodeAddress({ address: inputAddress.trim(), currentLocation: location }));
            // Force re-render map sau khi search
            setMapKey(prev => prev + 1);
        }
    };

    const onUseCurrent = () => {
        dispatch(getCurrentLocation());
    };

    const onMapPick = (pos) => {
        dispatch(setLocation(pos));
        dispatch(reverseGeocodeFromCoordinates(pos));
    };

    const onMarkerDrag = (pos) => {
        dispatch(setLocation(pos));
        dispatch(reverseGeocodeFromCoordinates(pos));
    };

    // Loading state cho map
    if (loading && (!location.lat || !location.lon)) {
        return (
            <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center">
                <div className="text-center">
                    <ClipLoader size={50} color="#00BFFF" />
                    <p className="mt-4 text-gray-600">Đang tải bản đồ...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
            <div className='absolute top-[20px] left-[20px] z-[1000] cursor-pointer' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={35} className='text-[#00BFFF]' />
            </div>

            <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h1>
                {/**Map section */}
                <section>
                    <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>
                        <IoLocationSharp size={20} className='text-[#00BFFF]' />
                        Delivery Location
                    </h2>

                    <div className='relative mb-3'>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent transition-all"
                                    placeholder='Tìm kiếm địa chỉ, địa danh...'
                                    value={inputAddress}
                                    onChange={onChangeAddress}
                                    onFocus={() => { if (inputAddress) debouncedSuggest(inputAddress); }}
                                />
                                <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>

                            <button
                                className='bg-[#00BFFF] hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-md hover:shadow-lg'
                                onClick={onSearch}
                                disabled={searchLoading}
                                title="Tìm kiếm địa chỉ"
                            >
                                {searchLoading ? <ClipLoader size={18} color="#fff" /> : <IoSearchOutline size={18} />}
                            </button>

                            <button
                                className='bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-md hover:shadow-lg'
                                onClick={onUseCurrent}
                                disabled={loading}
                                title="Vị trí hiện tại"
                            >
                                {loading ? <ClipLoader size={18} color="#fff" /> : <TbCurrentLocation size={18} />}
                            </button>
                        </div>

                        {/* Dropdown suggestions với UI đẹp hơn */}
                        {suggestions?.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-2 shadow-xl max-h-80 overflow-y-auto z-50">
                                <div className="p-2">
                                    <div className="text-xs text-gray-500 mb-2 px-2">Gợi ý địa chỉ:</div>
                                    {suggestions.map((s, idx) => (
                                        <div key={idx}
                                            className="flex items-start gap-3 p-3 cursor-pointer hover:bg-blue-50 rounded-lg transition-colors group"
                                            onClick={() => onPickSuggestion(s)}>
                                            <div className="flex-shrink-0 mt-1">
                                                <FaMapMarkerAlt className="text-[#00BFFF] group-hover:text-blue-600" size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-sm text-gray-900 group-hover:text-blue-900">
                                                    {s.formatted}
                                                </div>
                                                {s.confidence && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Độ tin cậy: {Math.round(s.confidence)}%
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Map với key để force re-render - Cải thiện UI */}
                    <div className="rounded-xl overflow-hidden border border-gray-300 mt-4 shadow-lg">
                        {/* Map Controls */}
                        <div className="flex justify-between items-center bg-white px-4 py-2 border-b">
                            <div className="flex items-center gap-2">
                                <IoMapOutline className="text-[#00BFFF]" size={18} />
                                <span className="text-sm font-medium text-gray-700">Bản đồ giao hàng</span>
                            </div>
                            <div className="flex gap-2">
                                {/* Map Type Selector */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setMapType('roadmap')}
                                        className={`px-2 py-1 text-xs rounded-md transition-colors ${mapType === 'roadmap' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        Bản đồ
                                    </button>
                                    <button
                                        onClick={() => setMapType('satellite')}
                                        className={`px-2 py-1 text-xs rounded-md transition-colors ${mapType === 'satellite' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        Vệ tinh
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowCoordinates(!showCoordinates)}
                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                                    title="Hiện/ẩn tọa độ"
                                >
                                    <FaRoute size={12} />
                                    Tọa độ
                                </button>

                                <button
                                    onClick={onUseCurrent}
                                    disabled={loading}
                                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                                    title="Vị trí hiện tại"
                                >
                                    <TbCurrentLocation size={14} />
                                    Vị trí tôi
                                </button>
                            </div>
                        </div>

                        <div className='h-80 w-full relative'>
                            <MapContainer
                                key={mapKey}
                                className={'w-full h-full'}
                                center={[location.lat, location.lon]}
                                zoom={16}
                                scrollWheelZoom={true}
                                zoomControl={true}
                                doubleClickZoom={true}
                                style={{ zIndex: 1 }}
                            >
                                {/* Dynamic tile layer based on map type */}
                                {mapType === 'roadmap' && (
                                    <TileLayer
                                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                                        subdomains='abcd'
                                        maxZoom={20}
                                    />
                                )}

                                {mapType === 'satellite' && (
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                                        url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                                        maxZoom={19}
                                    />
                                )}

                                {/* Fallback tile layer */}
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                    maxZoom={19}
                                />

                                <MapUpdater center={location} zoom={16} />
                                <DraggableMarker position={location} onDragEnd={onMarkerDrag} address={address} />
                                <MapClickHandler onSelect={onMapPick} />
                            </MapContainer>

                            {/* Loading overlay */}
                            {searchLoading && (
                                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                    <div className="text-center">
                                        <ClipLoader size={30} color="#00BFFF" />
                                        <p className="mt-2 text-sm text-gray-600">Đang tìm kiếm...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Hiển thị địa chỉ với UI đẹp hơn */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-t">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <FaMapMarkerAlt className="text-[#00BFFF] mt-1" size={16} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-800 mb-1">
                                        Địa chỉ giao hàng
                                    </div>
                                    <div className="text-sm text-gray-600 leading-relaxed">
                                        {address || "Đang tải địa chỉ..."}
                                    </div>
                                    {showCoordinates && location.lat && location.lon && (
                                        <div className="text-xs text-gray-500 mt-2 p-2 bg-white bg-opacity-50 rounded">
                                            <div className="font-medium">Tọa độ GPS:</div>
                                            <div>Lat: {location.lat.toFixed(6)}</div>
                                            <div>Lng: {location.lon.toFixed(6)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Payment section */}
                <section>
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">Payment Method</h2>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {/*COD payment*/}
                        <div className={`flex items-center gap-3 rounded-xl border p-4 text-left transition 
                        ${paymentMethod === 'cod' ? 'border-[#00BFFF] bg-blue-50 shadow'
                                : 'border-gray-200 bg-white hover:border-gray-400'
                            }`}
                            onClick={() => setPaymentMethod('cod')}
                        >

                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <MdDeliveryDining className='text-green-600 text-xl' />
                            </span>
                            <div >
                                <p className='font-medium text-gray-800'>Cash on Delivery</p>
                                <p className='text-sx text-gray-500'>Pay when your food arrives</p>
                            </div>

                        </div>
                        {/*Online payment*/}
                        <div className={`flex items-center gap-3 rounded-xl border p-4 text-left transition 
                        ${paymentMethod === 'online' ? 'border-[#00BFFF] bg-blue-50 shadow'
                                : 'border-gray-200 bg-white hover:border-gray-400'
                            }`}
                            onClick={() => setPaymentMethod('online')}   >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                <FaMobileScreenButton className='text-purple-600 text-xl' />
                            </span>

                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <FaCreditCard className='text-blue-600 text-xl' />
                            </span>
                            <div >
                                <p className='font-medium text-gray-800'>UPI / Credit / Debit Card</p>
                                <p className='text-sx text-gray-500'>Pay SecureLy Online</p>
                            </div>

                        </div>
                    </div>
                </section>


                {/* Order Summary */}
                <section>
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">Order Summary</h2>
                    <div className="rounded-xl border bg-gray-50 p-4">
                        <div className="space-y-2">
                            {cartItems.map((item, index) => (
                                <div key={index} className="flex justify-between text-m">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span className='font-medium'>{(item.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                </div>
                            ))}
                        </div>
                        <hr className="my-4 border-gray-200" />
                        <div className="space-y-2">
                            <div className="flex justify-between text-m">
                                <span className='text-gray-600'>Subtotal</span>
                                <span>{subtotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                            </div>
                            <div className="flex justify-between text-m">
                                <span className='text-gray-600'>Shipping fee</span>
                                <span>{shippingFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                            </div>
                        </div>
                        <hr className="my-4 border-gray-200" />
                        <div className="flex justify-between font-semibold text-lg text-[#ff0000]">
                            <span>Total</span>
                            <span>{total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                        </div>
                    </div>
                </section>

                {/*Submit button*/}
                <button className="w-full bg-[#00BFFF] text-white py-3 rounded-md font-semibold hover:bg-blue-600 transition">
                    {paymentMethod == "cod" ? "Place Order" : "Pay & Place Order"}
                </button>
            </div >
        </div >
    );
}

export default CheckOut;
