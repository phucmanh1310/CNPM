# Các API Bản Đồ Miễn Phí Cho Việt Nam

## 🎯 **API Hiện Tại: Geoapify**
- **Ưu điểm:** Chất lượng cao, hỗ trợ tiếng Việt tốt, có autocomplete
- **Hạn chế:** Có giới hạn request miễn phí
- **Key:** `VITE_GEOAPIKEY="6b80094f605040a5b675e471228438fa"`

## 🚀 **Các API Miễn Phí Khác Cho Việt Nam**

### 1. **VIETMAP** (Khuyến nghị cao)
- **Website:** https://maps.vietmap.vn/
- **Ưu điểm:** 
  - Dữ liệu Việt Nam chính xác nhất
  - Cập nhật hàng tháng
  - Hỗ trợ địa chỉ cũ → mới
  - API tương thích Google Maps
- **Miễn phí:** 10,000 requests/tháng
- **Endpoints:**
  - Geocoding: `https://maps.vietmap.vn/api/search`
  - Autocomplete: `https://maps.vietmap.vn/api/autocomplete`
  - Reverse: `https://maps.vietmap.vn/api/reverse`

### 2. **VNMAP**
- **Website:** https://vnmap.io/
- **Ưu điểm:**
  - Tương thích 1-1 với Google Maps API
  - Dữ liệu toàn quốc
  - Dễ migrate từ Google Maps
- **Miễn phí:** 1,000 requests/tháng
- **Endpoints:** Giống Google Maps

### 3. **MAP4D**
- **Website:** https://map4d.vn/
- **Ưu điểm:**
  - Made in Vietnam
  - Hỗ trợ 2D/3D
  - SDK đầy đủ
- **Miễn phí:** 5,000 requests/tháng

### 4. **OpenStreetMap Nominatim** (Miễn phí hoàn toàn)
- **Website:** https://nominatim.org/
- **Ưu điểm:**
  - Hoàn toàn miễn phí
  - Không giới hạn request
  - Dữ liệu cộng đồng
- **Hạn chế:** 
  - Chậm hơn
  - Dữ liệu Việt Nam không đầy đủ
- **Endpoints:**
  - Search: `https://nominatim.openstreetmap.org/search`
  - Reverse: `https://nominatim.openstreetmap.org/reverse`

### 5. **Photon API** (Miễn phí)
- **Website:** https://photon.komoot.io/
- **Ưu điểm:**
  - Miễn phí hoàn toàn
  - Dựa trên OpenStreetMap
  - Nhanh và ổn định
- **Hạn chế:** Dữ liệu Việt Nam hạn chế

## 🔧 **Cách Implement Fallback System**

```javascript
// utils/mapAPIFallback.js
const API_PROVIDERS = [
    {
        name: 'Geoapify',
        geocode: 'https://api.geoapify.com/v1/geocode/search',
        reverse: 'https://api.geoapify.com/v1/geocode/reverse',
        autocomplete: 'https://api.geoapify.com/v1/geocode/autocomplete',
        key: 'VITE_GEOAPIKEY',
        priority: 1
    },
    {
        name: 'VIETMAP',
        geocode: 'https://maps.vietmap.vn/api/search',
        reverse: 'https://maps.vietmap.vn/api/reverse',
        autocomplete: 'https://maps.vietmap.vn/api/autocomplete',
        key: 'VITE_VIETMAP_KEY',
        priority: 2
    },
    {
        name: 'Nominatim',
        geocode: 'https://nominatim.openstreetmap.org/search',
        reverse: 'https://nominatim.openstreetmap.org/reverse',
        autocomplete: null,
        key: null,
        priority: 3
    }
];

export async function geocodeWithFallback(address, currentLocation) {
    for (const provider of API_PROVIDERS.sort((a, b) => a.priority - b.priority)) {
        try {
            const result = await geocodeWithProvider(provider, address, currentLocation);
            if (result) return result;
        } catch (error) {
            console.warn(`${provider.name} failed:`, error.message);
            continue;
        }
    }
    throw new Error('All geocoding providers failed');
}
```

## 📊 **So Sánh Chi Tiết**

| API | Miễn phí | Chất lượng VN | Tốc độ | Độ tin cậy |
|-----|----------|---------------|--------|------------|
| **Geoapify** | 3K/month | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **VIETMAP** | 10K/month | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **VNMAP** | 1K/month | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **MAP4D** | 5K/month | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Nominatim** | Unlimited | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

## 🎯 **Khuyến Nghị**

1. **Chính:** Geoapify (đã implement)
2. **Dự phòng:** VIETMAP (tốt nhất cho VN)
3. **Fallback:** Nominatim (miễn phí hoàn toàn)

## 🔑 **Cách Lấy API Key**

### VIETMAP:
1. Đăng ký tại: https://maps.vietmap.vn/
2. Tạo project mới
3. Lấy API key từ dashboard

### VNMAP:
1. Đăng ký tại: https://vnmap.io/
2. Tạo API key
3. Cấu hình billing (miễn phí)

### MAP4D:
1. Đăng ký tại: https://map4d.vn/
2. Tạo ứng dụng
3. Lấy API key
