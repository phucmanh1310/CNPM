import crypto from 'crypto';

// MoMo Payment Configuration - Using official documentation credentials
// Reference: https://developers.momo.vn/v3/vi/docs/payment/api/wallet/onetime
export const MOMO_CONFIG = {
    // Official test credentials from MoMo documentation
    PARTNER_CODE: process.env.MOMO_PARTNER_CODE || "MOMO",
    ACCESS_KEY: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
    SECRET_KEY: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",

    // Environment
    ENVIRONMENT: process.env.MOMO_ENVIRONMENT || "sandbox", // sandbox or production

    // URLs
    BASE_URL: process.env.MOMO_ENVIRONMENT === "production"
        ? "https://payment.momo.vn/v2/gateway/api"
        : "https://test-payment.momo.vn/v2/gateway/api",

    // Callback URLs
    RETURN_URL: process.env.MOMO_RETURN_URL || "http://localhost:5173/payment/success",
    NOTIFY_URL: process.env.MOMO_NOTIFY_URL || "http://localhost:8000/api/payment/momo/callback",

    // Request type - using payWithMethod for multiple payment options (QR + ATM + International Cards)
    REQUEST_TYPE: "payWithMethod"
};

// Helper function to generate signature - Following MoMo official format
// Format: accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
export const generateSignature = (rawSignature, secretKey) => {
    return crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
};
