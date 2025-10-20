# 🚁 DRONE MANAGEMENT SYSTEM - CURRENT IMPLEMENTATION

## 📋 OVERVIEW
Hệ thống quản lý drone đã được triển khai hoàn chỉnh trong ứng dụng đặt đồ ăn với quản lý trạng thái tự động và xác nhận giao hàng từ khách hàng.

## 🎯 BUSINESS REQUIREMENTS (Đã triển khai)
- Mỗi cửa hàng có 5 drone cố định (Drone-1, Drone-2, Drone-3, Drone-4, Drone-5)
- Trạng thái drone: Available, Busy, Under Maintenance
- 1 drone = 1 đơn hàng = 1 khách hàng (không giao nhiều đơn cùng lúc)
- Owner phân công drone thủ công (chỉ drone Available)
- Khách hàng xác nhận hoàn thành giao hàng
- Chuyển đổi trạng thái tự động dựa trên luồng đơn hàng

## 📊 ORDER STATUS FLOW (Hiện tại)
```
pending → accepted → preparing → prepared → handed over to drone → delivering → delivered
```

### Status Transitions (Đã triển khai):
1. **pending** → **accepted**: Owner xác nhận đơn hàng
2. **accepted** → **preparing**: Owner bắt đầu chuẩn bị
3. **preparing** → **prepared**: Owner hoàn thành chuẩn bị
4. **prepared** → **handed over to drone**: Owner phân công drone available
5. **handed over to drone** → **delivering**: Hệ thống tự động chuyển đổi (1 giây)
6. **delivering** → **delivered**: Khách hàng xác nhận nhận hàng

## 🗄️ DATABASE SCHEMA (Đã triển khai)

### 1. Drone Model (Hiện tại)
```javascript
const droneSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    name: {
        type: String,
        required: true,
        enum: ["Drone-1", "Drone-2", "Drone-3", "Drone-4", "Drone-5"]
    },
    status: {
        type: String,
        enum: ["Under Maintenance", "Busy", "Available"],
        default: "Available"
    },
    assignedOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null
    },
    lastAssignedAt: {
        type: Date,
        default: null
    },
    maintenanceReason: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Indexes for optimization
droneSchema.index({ shop: 1, name: 1 }, { unique: true });
droneSchema.index({ shop: 1, status: 1 });
```

### 2. Order Model (Đã cập nhật)
```javascript
const orderSchema = new mongoose.Schema({
    // ... existing fields ...
    
    // Drone assignment fields (đã thêm)
    assignedDroneId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drone",
        default: null
    },
    droneAssignedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });
```

### 3. ShopOrder Schema (Trong Order Model)
```javascript
const shopOrderSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    subtotal: Number,
    status: {
        type: String,
        enum: ["pending", "accepted", "preparing", "prepared", "handed over to drone", "delivering", "delivered", "cancelled"],
        default: "pending"
    },
    cancelReason: {
        type: String,
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    shopOrderItems: [shopOrderItemSchema]
}, { timestamps: true });
```

## 🔧 BACKEND API ENDPOINTS (Đã triển khai)

### 1. Drone Management APIs
- `GET /api/drone/getShopDrones/:shopId` - Lấy tất cả drone của cửa hàng
- `PUT /api/drone/updateStatus/:droneId` - Cập nhật trạng thái drone (chỉ Available ↔ Under Maintenance)
- `PUT /api/drone/assignToOrder` - Phân công drone cho đơn hàng
- `PUT /api/drone/releaseDrone/:droneId` - Giải phóng drone thủ công (trường hợp khẩn cấp)
- `PUT /api/drone/resetAllDrones/:shopId` - Reset tất cả drone về Available (cho testing)

### 2. Order Management APIs (Đã cập nhật)
- `PUT /api/order/updateOrderStatus` - Cập nhật trạng thái đơn hàng (đã có)
- `PUT /api/order/cancelOrder` - Hủy đơn hàng (đã có)
- `PUT /api/order/confirmDelivery` - Khách hàng xác nhận nhận hàng (đã có)

### 3. API Request/Response Examples

#### Assign Drone to Order
```javascript
PUT /api/drone/assignToOrder
Body: {
    orderId: "order_id",
    shopOrderId: "shop_order_id", 
    droneId: "drone_id"
}
Response: {
    message: "Drone assigned successfully",
    order: { ... },
    drone: { ... }
}
```

#### Update Drone Status
```javascript
PUT /api/drone/updateStatus/:droneId
Body: {
    status: "Under Maintenance",
    maintenanceReason: "Battery replacement"
}
Response: {
    message: "Drone status updated successfully",
    drone: { ... }
}
```

## 🎨 FRONTEND COMPONENTS (Đã triển khai)

### 1. Owner Interface

#### Drone Management Page (`/drone-management`)
- **Drone List**: Hiển thị tất cả 5 drone với trạng thái hiện tại
- **Status Update**: Nút để chuyển drone sang Under Maintenance (chỉ drone Available)
- **Drone Status Cards**: Card trực quan hiển thị thông tin drone và trạng thái
- **Assign Drone Modal**: Chọn drone available cho đơn hàng đã prepared
- **Reset All Drones**: Nút reset tất cả drone về Available (cho testing)
- **Navigation**: Tích hợp với Order Management để phân công drone

#### Updated OrderCard Component
- **Status Display**: Hiển thị trạng thái "prepared" và "handed over to drone"
- **Assign Drone Button**: Chỉ hiển thị cho đơn hàng prepared
- **Drone Info**: Hiển thị tên drone đã được phân công
- **Status Colors**: Màu sắc phân biệt cho từng trạng thái
- **Action Buttons**: Các nút hành động phù hợp với từng trạng thái

### 2. Customer Interface

#### Updated MyOrders Page
- **Confirm Received Button**: Chỉ hiển thị cho đơn hàng "delivering"
- **Order Status**: Hiển thị luồng trạng thái đã cập nhật
- **Notifications**: Toast notifications cho các thay đổi trạng thái
- **Order Details**: Hiển thị thông tin drone đã được phân công

### 3. Component Features (Đã triển khai)

#### DroneCard Component
- Hiển thị tên drone và trạng thái
- Nút cập nhật trạng thái (Available ↔ Under Maintenance)
- Nút phân công drone cho đơn hàng
- Màu sắc trực quan cho từng trạng thái

#### OrderCard Component Updates
- Hỗ trợ trạng thái "handed over to drone" và "delivering"
- Hiển thị thông tin drone được phân công
- Nút xác nhận nhận hàng cho khách hàng
- Validation cho các hành động theo trạng thái

## 🔄 AUTOMATION LOGIC (Đã triển khai)

### 1. Status Transitions (Hiện tại)
```javascript
// Khi phân công drone cho đơn hàng
Order: prepared → handed over to drone
Drone: Available → Busy

// Khi đơn hàng bắt đầu giao hàng (tự động sau 1 giây)
Order: handed over to drone → delivering (auto-transition)

// Khi khách hàng xác nhận nhận hàng
Order: delivering → delivered
Drone: Busy → Available (auto-release)
```

### 2. Business Rules (Đã triển khai)
- Chỉ drone Available mới được phân công
- Owner không thể thay đổi thủ công drone Busy sang Available
- Hệ thống tự động giải phóng drone sau khi xác nhận giao hàng
- Một drone chỉ phục vụ một đơn hàng tại một thời điểm
- Owner chỉ có thể chuyển drone từ Available sang Under Maintenance và ngược lại
- Không thể thay đổi trạng thái drone Busy (phải chờ tự động giải phóng)

### 3. Validation Rules (Đã triển khai)

#### Drone Assignment Validation
- Đơn hàng phải ở trạng thái "prepared"
- Drone phải ở trạng thái "Available"
- Drone phải thuộc về cửa hàng của owner
- Owner phải có quyền quản lý đơn hàng này

#### Status Update Validation
- Owner chỉ có thể chuyển drone từ "Available" sang "Under Maintenance"
- Owner chỉ có thể chuyển drone từ "Under Maintenance" sang "Available"
- Không thể thay đổi trạng thái drone "Busy" thủ công
- Khách hàng chỉ có thể xác nhận đơn hàng "delivering"

### 4. Error Handling (Đã triển khai)
- Kiểm tra quyền truy cập (authorization)
- Validation input data
- Rollback transaction khi có lỗi
- Error messages rõ ràng cho từng trường hợp

## 📱 NOTIFICATION SYSTEM (Đã triển khai)

### Customer Notifications
- Đơn hàng được xác nhận
- Đơn hàng đã chuẩn bị và drone được phân công
- Drone đang giao hàng
- Giao hàng hoàn tất

### Owner Notifications
- Đơn hàng mới được nhận
- Khách hàng xác nhận nhận hàng
- Thay đổi trạng thái drone
- Cảnh báo khi drone cần bảo trì

### Notification Implementation
- Toast notifications trong UI
- Real-time updates qua WebSocket (nếu có)
- Email notifications cho các sự kiện quan trọng

## 🚀 IMPLEMENTATION STATUS

### ✅ Phase 1: Database & Backend Foundation (Hoàn thành)
1. ✅ Tạo Drone model với đầy đủ fields
2. ✅ Cập nhật Order model với drone assignment fields
3. ✅ Tạo drone management APIs
4. ✅ Cập nhật order management APIs
5. ✅ Thêm automation logic

### ✅ Phase 2: Owner Interface (Hoàn thành)
1. ✅ Tạo Drone Management page
2. ✅ Cập nhật OrderCard component
3. ✅ Thêm chức năng phân công drone
4. ✅ Triển khai quản lý trạng thái

### ✅ Phase 3: Customer Interface (Hoàn thành)
1. ✅ Cập nhật MyOrders page
2. ✅ Thêm xác nhận giao hàng
3. ✅ Triển khai notification system
4. ✅ Cập nhật hiển thị trạng thái đơn hàng

### ✅ Phase 4: Testing & Polish (Hoàn thành)
1. ✅ Test tất cả chuyển đổi trạng thái
2. ✅ Test logic phân công drone
3. ✅ Test flow xác nhận khách hàng
4. ✅ Cải thiện UI/UX

## 🔍 VALIDATION RULES (Đã triển khai)

### Drone Assignment Rules
- Đơn hàng phải ở trạng thái "prepared"
- Drone phải ở trạng thái "Available"
- Cửa hàng phải sở hữu drone đó
- Owner phải có quyền quản lý đơn hàng

### Status Update Rules
- Owner chỉ có thể chuyển drone từ "Available" sang "Under Maintenance"
- Owner chỉ có thể chuyển drone từ "Under Maintenance" sang "Available"
- Hệ thống xử lý tất cả chuyển đổi trạng thái khác tự động
- Khách hàng chỉ có thể xác nhận đơn hàng "delivering"

## 📋 TESTING SCENARIOS (Đã test)

### Owner Flow (Đã test)
1. Xác nhận đơn hàng → accepted
2. Hoàn thành chuẩn bị → prepared
3. Phân công drone → handed over to drone
4. Hệ thống tự động chuyển → delivering
5. Khách hàng xác nhận → delivered + Drone Available

### Customer Flow (Đã test)
1. Nhận thông báo cho mỗi thay đổi trạng thái
2. Thấy nút "Confirm Received" cho đơn hàng delivering
3. Xác nhận hoàn thành giao hàng

### Edge Cases (Đã xử lý)
1. Nhiều đơn hàng cố gắng phân công cùng một drone
2. Drone bảo trì trong quá trình giao hàng đang hoạt động
3. Khách hàng không xác nhận giao hàng
4. Reset tất cả drone về Available (cho testing)

## 🎯 SUCCESS CRITERIA (Đã đạt)

- ✅ Tất cả 5 drone/cửa hàng được quản lý đúng cách
- ✅ Luồng phân công đơn hàng-drone mượt mà
- ✅ Khách hàng có thể xác nhận hoàn thành giao hàng
- ✅ Chuyển đổi trạng thái tự động hoạt động chính xác
- ✅ Owner có thể quản lý bảo trì drone
- ✅ Thông báo hoạt động cho tất cả các bên liên quan

## 📝 TECHNICAL NOTES (Hiện tại)

### Database Indexes
```javascript
// Drone collection indexes
droneSchema.index({ shop: 1, name: 1 }, { unique: true });
droneSchema.index({ shop: 1, status: 1 });
```

### Auto-transition Logic
```javascript
// Auto-transition từ "handed over to drone" sang "delivering"
setTimeout(async () => {
    const updatedOrder = await Order.findById(orderId);
    const updatedShopOrder = updatedOrder.shopOrder.id(shopOrderId);
    if (updatedShopOrder.status === "handed over to drone") {
        updatedShopOrder.status = "delivering";
        await updatedOrder.save();
    }
}, 1000); // 1 giây delay để mô phỏng drone pickup
```

### Error Handling
- Authorization checks cho mọi API calls
- Input validation với error messages rõ ràng
- Transaction rollback khi có lỗi
- Graceful error handling trong frontend

## 🔧 MAINTENANCE FEATURES (Đã triển khai)

### Reset All Drones
- API endpoint: `PUT /api/drone/resetAllDrones/:shopId`
- Reset tất cả drone của cửa hàng về Available
- Hữu ích cho testing và maintenance

### Manual Drone Release
- API endpoint: `PUT /api/drone/releaseDrone/:droneId`
- Giải phóng drone thủ công trong trường hợp khẩn cấp
- Chỉ dành cho admin hoặc owner

### Maintenance Reason Tracking
- Field `maintenanceReason` trong Drone model
- Lưu trữ lý do bảo trì
- Hỗ trợ audit trail

---

## 📊 SUMMARY

**Status**: ✅ **HOÀN THÀNH TRIỂN KHAI**
**Priority**: High
**Implementation Time**: Đã hoàn thành
**Dependencies**: Hệ thống quản lý đơn hàng hiện có

Hệ thống quản lý drone đã được triển khai hoàn chỉnh với tất cả các tính năng yêu cầu. Tất cả các API endpoints, frontend components, và business logic đã được implement và test thành công.
