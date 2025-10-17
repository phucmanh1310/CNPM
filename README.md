# KTPM E-commerce Website (Trang web thương mại điện tử KTPM)

## Thành viên của dự án

1.  Trần Nguyễn Phúc Mạnh | ID:3122411121
## Mục lục

1.  [Mô tả dự án](#mô-tả-dự-án)
2.  [Yêu cầu tiên quyết](#yêu-cầu-tiên-quyết)
3.  [Thiết lập Backend](#thiết-lập-backend)
4.  [Thiết lập Frontend](#thiết-lập-frontend)
5.  [Chạy ứng dụng](#chạy-ứng-dụng)
6.  [Các điểm cuối API](#các-điểm-cuối-api)
7.  [Kiểm thử](#kiểm-thử)
8.  [Triển khai](#triển-khai)
9.  [Đóng góp](#đóng-góp)
10. [Giấy phép](#giấy-phép)

## Mô tả dự án

Ứng dụng thương mại điện tử full-stack.

## Yêu cầu tiên quyết

*   Đã cài đặt [Node.js](https://nodejs.org/) và [npm](https://www.npmjs.com/).
*   Đã cài đặt và chạy [MongoDB](https://www.mongodb.com/).
*   [Vite](https://vitejs.dev/)

## Thiết lập Backend

1.  Di chuyển đến thư mục `BackEnd`:

    ```bash
    cd BackEnd
    ```
2.  Cài đặt các dependencies:

    ```bash
    npm install
    ```
3.  Cấu hình các biến môi trường:

    *   Tạo file `.env` trong thư mục `BackEnd`.
    *   Thêm các biến sau:

        ```
        PORT=5000
        MONGO_URI=<MongoDB connection string>
        JWT_SECRET=<Secret key for JWT authentication>
        CLOUDINARY_CLOUD_NAME=<Cloudinary cloud name>
        CLOUDINARY_API_KEY=<Cloudinary API key>
        CLOUDINARY_API_SECRET=<Cloudinary API secret>
        EMAIL_USER=<Email address for sending emails>
        EMAIL_PASS=<Password for the email address>
        ```

4.  Chạy backend server:

    ```bash
    npm start
    ```

    hoặc

    ```bash
    npm run dev
    ```

    (nếu sử dụng nodemon)

## Thiết lập Frontend

1.  Di chuyển đến thư mục `FrontEnd`:

    ```bash
    cd FrontEnd
    ```
2.  Cài đặt các dependencies:

    ```bash
    npm install
    ```
3.  Cấu hình các biến môi trường:

    *   Tạo file `.env` trong thư mục `FrontEnd`.
    *   Thêm biến sau:

        ```
        VITE_API_BASE_URL=http://localhost:5000
        ```

4.  Chạy frontend server:

    ```bash
    npm run dev
    ```

## Chạy ứng dụng

Truy cập ứng dụng trên trình duyệt: `http://localhost:5173`

## Các điểm cuối API

*   `GET /api/items`: Lấy danh sách các sản phẩm.
*   `POST /api/users/register`: Đăng ký người dùng mới.
*   `POST /api/users/login`: Đăng nhập người dùng.

## Kiểm thử

(Hướng dẫn kiểm thử sẽ được thêm vào sau)

## Triển khai

(Hướng dẫn triển khai sẽ được thêm vào sau)

## Đóng góp

(Hướng dẫn đóng góp sẽ được thêm vào sau)

## Giấy phép

(Giấy phép sẽ được chỉ định sau)
