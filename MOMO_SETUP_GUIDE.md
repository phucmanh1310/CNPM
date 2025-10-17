# MoMo Payment Integration Setup Guide

## 📋 Overview
This project integrates MoMo payment using the official test credentials from [MoMo Developer Documentation](https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method).

## 🔧 Setup Instructions

### 1. Environment Variables
Add these to your `BackEnd/.env` file:

```env
# MoMo Payment Configuration (Using official test credentials from documentation)
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_ENVIRONMENT=sandbox
MOMO_RETURN_URL=http://localhost:5173/payment/success
MOMO_NOTIFY_URL=http://localhost:8000/api/payment/momo/callback
```

### 2. Test Credentials
The system uses MoMo's official test credentials from documentation:
- **Partner Code**: `MOMO`
- **Access Key**: `F8BBA842ECF85`
- **Secret Key**: `K951B6PE1waDMi640xX08PD3vg6EkVlz`
- **Request Type**: `payWithMethod`

### 3. Payment Flow
1. User selects "MoMo Payment" in checkout
2. System creates order with `paymentStatus: "pending"`
3. Creates MoMo payment request
4. Redirects to MoMo sandbox payment page
5. User completes payment on MoMo
6. MoMo sends callback to `/api/payment/momo/callback`
7. System updates payment status
8. Redirects to `/payment/success` page

### 4. Testing
- Use MoMo sandbox environment
- Test with sample phone numbers provided by MoMo
- Check payment status in database

### 5. Production Setup
For production, you'll need to:
1. Contact MoMo for production credentials
2. Update environment variables
3. Change `MOMO_ENVIRONMENT` to `production`
4. Update callback URLs to your production domain

## 📁 Files Modified
- `BackEnd/models/payment.model.js` - Payment tracking
- `BackEnd/models/order.model.js` - Added paymentStatus
- `BackEnd/config/momo.js` - MoMo configuration
- `BackEnd/controllers/payment.controller.js` - Payment logic
- `BackEnd/routes/payment.routes.js` - Payment routes
- `FrontEnd/src/pages/CheckOut.jsx` - Updated UI
- `FrontEnd/src/pages/PaymentSuccess.jsx` - Success page

## 🔗 References
- [MoMo Official Documentation](https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method)
- [MoMo Payment Node.js Repository](https://github.com/momo-wallet/payment/tree/master/nodejs)
- [MoMo Developer Portal](https://developers.momo.vn/)

## Thông tin test thẻ atm
No	Tên	Số thẻ	Hạn ghi trên thẻ	OTP	Trường hợp test
1	NGUYEN VAN A	9704 0000 0000 0018	03/07	OTP	Thành công
2	NGUYEN VAN A	9704 0000 0000 0026	03/07	OTP	Thẻ bị khóa
3	NGUYEN VAN A	9704 0000 0000 0034	03/07	OTP	Nguồn tiền không đủ
4	NGUYEN VAN A	9704 0000 0000 0042	03/07	OTP	Hạn mức thẻ quá

# Nguyên nhân Callback không hoạt động:
MoMo Sandbox có thể không gửi callback về localhost vì:
Network restrictions
Firewall blocking
MoMo sandbox limitations