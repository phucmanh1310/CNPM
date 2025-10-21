import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIKEY

// Hàm làm tròn tọa độ để giảm độ chính xác quá cao
function roundCoordinates(lat, lon, precision = 4) {
  return {
    lat: Math.round(lat * Math.pow(10, precision)) / Math.pow(10, precision),
    lon: Math.round(lon * Math.pow(10, precision)) / Math.pow(10, precision),
  }
}

// Hàm xử lý địa danh nổi tiếng ở Việt Nam
function handleFamousLandmarks(address) {
  const landmarks = {
    'đại học sài gòn': '273 An Dương Vương, Phường 3, Quận 5, TP. Hồ Chí Minh',
    'trường đại học sài gòn':
      '273 An Dương Vương, Phường 3, Quận 5, TP. Hồ Chí Minh',
    sgu: '273 An Dương Vương, Phường 3, Quận 5, TP. Hồ Chí Minh',
    'đại học quốc gia': 'Linh Trung, Thủ Đức, TP. Hồ Chí Minh',
    'đại học bách khoa':
      '268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh',
    'đại học kinh tế':
      '59C Nguyễn Đình Chiểu, Phường 6, Quận 3, TP. Hồ Chí Minh',
    'đại học sư phạm': '280 An Dương Vương, Phường 4, Quận 5, TP. Hồ Chí Minh',
    'chợ bến thành': 'Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    'nhà thờ đức bà': '01 Công xã Paris, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    'dinh độc lập':
      '135 Nam Kỳ Khởi Nghĩa, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    'bưu điện thành phố': '02 Công xã Paris, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    'phố đi bộ nguyễn huệ': 'Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    'landmark 81':
      'Vinhomes Central Park, Phường 22, Bình Thạnh, TP. Hồ Chí Minh',
    bitexco: '2 Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    'aeon mall':
      '1 Đường số 17A, Phường Bình Trị Đông B, Bình Tân, TP. Hồ Chí Minh',
    'vincom center':
      '72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    lotteria:
      'Lotte Mart, 469 Nguyễn Hữu Thọ, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh',
    kfc: 'KFC, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    mcdonald: "McDonald's, 135 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
    starbucks: 'Starbucks, 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
  }

  const lowerAddress = address.toLowerCase().trim()

  // Tìm kiếm địa danh phù hợp
  for (const [key, value] of Object.entries(landmarks)) {
    if (lowerAddress.includes(key)) {
      return value
    }
  }

  return null
}

// Get current location
export const getCurrentLocation = createAsyncThunk(
  'map/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await axios.get(
              'https://api.geoapify.com/v1/geocode/reverse',
              {
                params: {
                  lat: latitude,
                  lon: longitude,
                  apiKey: GEOAPIFY_API_KEY,
                  lang: 'vi',
                },
              }
            )

            if (response.data.features.length > 0) {
              const roundedCoords = roundCoordinates(latitude, longitude)
              const address = response.data.features[0].properties.formatted
              resolve({
                lat: roundedCoords.lat,
                lon: roundedCoords.lon,
                address,
              })
            } else {
              const roundedCoords = roundCoordinates(latitude, longitude)
              resolve({
                lat: roundedCoords.lat,
                lon: roundedCoords.lon,
                address: 'Không xác định được địa chỉ',
              })
            }
          } catch (error) {
            console.log(error.message)
            const roundedCoords = roundCoordinates(latitude, longitude)
            resolve({
              lat: roundedCoords.lat,
              lon: roundedCoords.lon,
              address: 'Không thể lấy địa chỉ',
            })
          }
        },
        (error) => {
          reject(rejectWithValue(error.message))
        }
      )
    })
  }
)

// Geocode address với xử lý địa danh nổi tiếng
export const geocodeAddress = createAsyncThunk(
  'map/geocodeAddress',
  async ({ address, currentLocation }, { rejectWithValue }) => {
    try {
      // Kiểm tra địa danh nổi tiếng trước
      const landmarkAddress = handleFamousLandmarks(address)
      const searchAddress = landmarkAddress || address

      const params = {
        text: searchAddress,
        apiKey: GEOAPIFY_API_KEY,
        lang: 'vi',
        filter: 'countrycode:vn',
        limit: 10,
      }

      if (currentLocation) {
        params.bias = `proximity:${currentLocation.lon},${currentLocation.lat}`
      }

      const response = await axios.get(
        'https://api.geoapify.com/v1/geocode/search',
        {
          params,
        }
      )

      if (response.data.features.length > 0) {
        // Tìm kết quả có confidence cao nhất
        const bestResult = response.data.features.reduce((best, current) =>
          current.properties.rank.confidence > best.properties.rank.confidence
            ? current
            : best
        )

        const { lat, lon } = bestResult.properties
        const roundedCoords = roundCoordinates(lat, lon)
        const formattedAddress = bestResult.properties.formatted

        return {
          lat: roundedCoords.lat,
          lon: roundedCoords.lon,
          address: formattedAddress,
          confidence: bestResult.properties.rank.confidence,
          components: bestResult.properties,
        }
      } else {
        return rejectWithValue('Không tìm thấy địa chỉ.')
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Lỗi tìm kiếm địa chỉ')
    }
  }
)

// Get suggestions với hỗ trợ địa danh nổi tiếng
export const getAddressSuggestions = createAsyncThunk(
  'map/getAddressSuggestions',
  async ({ query, currentLocation }, { rejectWithValue }) => {
    if (!query || query.length < 3) {
      return []
    }
    try {
      // Kiểm tra địa danh nổi tiếng trước
      const landmarkAddress = handleFamousLandmarks(query)
      if (landmarkAddress) {
        // Trả về địa danh nổi tiếng như một suggestion
        return [
          {
            formatted: landmarkAddress,
            originalFormatted: landmarkAddress,
            geometry: null,
            components: null,
            confidence: 10, // Confidence cao cho địa danh nổi tiếng
          },
        ]
      }

      const params = {
        text: query,
        apiKey: GEOAPIFY_API_KEY,
        lang: 'vi',
        filter: 'countrycode:vn',
        type: 'address',
        limit: 8,
      }

      if (currentLocation) {
        params.bias = `proximity:${currentLocation.lon},${currentLocation.lat}`
      }

      const response = await axios.get(
        'https://api.geoapify.com/v1/geocode/autocomplete',
        {
          params,
        }
      )

      return response.data.features.map((feature) => ({
        formatted: feature.properties.formatted,
        originalFormatted: feature.properties.formatted,
        geometry: {
          lat: feature.properties.lat,
          lon: feature.properties.lon,
        },
        components: feature.properties,
        confidence: feature.properties.rank.confidence,
      }))
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Lỗi lấy gợi ý địa chỉ')
    }
  }
)

// Reverse geocode
export const reverseGeocodeFromCoordinates = createAsyncThunk(
  'map/reverseGeocodeFromCoordinates',
  async ({ lat, lon }) => {
    try {
      const response = await axios.get(
        'https://api.geoapify.com/v1/geocode/reverse',
        {
          params: {
            lat,
            lon,
            apiKey: GEOAPIFY_API_KEY,
            lang: 'vi',
          },
        }
      )

      if (response.data.features.length > 0) {
        const roundedCoords = roundCoordinates(lat, lon)
        const address = response.data.features[0].properties.formatted
        return {
          lat: roundedCoords.lat,
          lon: roundedCoords.lon,
          address,
          components: response.data.features[0].properties,
        }
      }
      const roundedCoords = roundCoordinates(lat, lon)
      return {
        lat: roundedCoords.lat,
        lon: roundedCoords.lon,
        address: 'Không xác định được địa chỉ',
      }
    } catch (error) {
      console.log(error.message)
      const roundedCoords = roundCoordinates(lat, lon)
      return {
        lat: roundedCoords.lat,
        lon: roundedCoords.lon,
        address: 'Không thể lấy địa chỉ',
      }
    }
  }
)

const mapSlice = createSlice({
  name: 'map',
  initialState: {
    location: {
      lat: 10.8231,
      lon: 106.6297,
    },
    address: '',
    suggestions: [],
    loading: false,
    error: null,
    searchLoading: false,
    reverseGeocodingLoading: false,
  },
  reducers: {
    setLocation: (state, action) => {
      const { lat, lon } = action.payload
      state.location.lat = lat
      state.location.lon = lon
    },
    setAddress: (state, action) => {
      state.address = action.payload
    },
    clearSuggestions: (state) => {
      state.suggestions = []
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Current Location
      .addCase(getCurrentLocation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.loading = false
        state.location.lat = action.payload.lat
        state.location.lon = action.payload.lon
        state.address = action.payload.address
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Không thể lấy vị trí hiện tại'
      })

      // Geocode Address
      .addCase(geocodeAddress.pending, (state) => {
        state.searchLoading = true
        state.error = null
      })
      .addCase(geocodeAddress.fulfilled, (state, action) => {
        state.searchLoading = false
        state.location.lat = action.payload.lat
        state.location.lon = action.payload.lon
        state.address = action.payload.address
        state.suggestions = []
      })
      .addCase(geocodeAddress.rejected, (state, action) => {
        state.searchLoading = false
        state.error = action.payload
      })

      // Get Address Suggestions
      .addCase(getAddressSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload
      })
      .addCase(getAddressSuggestions.rejected, (state) => {
        state.suggestions = []
      })

      // Reverse Geocode From Coordinates
      .addCase(reverseGeocodeFromCoordinates.pending, (state) => {
        state.reverseGeocodingLoading = true
      })
      .addCase(reverseGeocodeFromCoordinates.fulfilled, (state, action) => {
        state.reverseGeocodingLoading = false
        state.location.lat = action.payload.lat
        state.location.lon = action.payload.lon
        state.address = action.payload.address
      })
      .addCase(reverseGeocodeFromCoordinates.rejected, (state) => {
        state.reverseGeocodingLoading = false
      })
  },
})

export const { setLocation, setAddress, clearSuggestions, clearError } =
  mapSlice.actions
export default mapSlice.reducer
