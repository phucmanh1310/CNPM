-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 09, 2024 lúc 05:59 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `food_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin`
--

CREATE TABLE `admin` (
  `id` int(100) NOT NULL,
  `name` varchar(20) NOT NULL,
  `password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `admin`
--

INSERT INTO `admin` (`id`, `name`, `password`) VALUES
(1, 'admin', '6216f8a75fd5bb3d5f22b6f9958cdede3fc086c2');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart`
--

CREATE TABLE `cart` (
  `id` int(100) NOT NULL,
  `user_id` int(100) NOT NULL,
  `pid` int(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` int(10) NOT NULL,
  `quantity` int(10) NOT NULL,
  `image` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `messages`
--

CREATE TABLE `messages` (
  `id` int(100) NOT NULL,
  `user_id` int(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `number` varchar(12) NOT NULL,
  `message` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `messages`
--

INSERT INTO `messages` (`id`, `user_id`, `name`, `email`, `number`, `message`) VALUES
(1, 1, 'dcdc', 'huunl2002@gmail.com', '01565', 'helleo');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(100) NOT NULL,
  `user_id` int(100) NOT NULL,
  `name` varchar(20) NOT NULL,
  `number` varchar(10) NOT NULL,
  `email` varchar(50) NOT NULL,
  `method` varchar(50) NOT NULL,
  `address` varchar(500) NOT NULL,
  `total_products` varchar(1000) NOT NULL,
  `total_price` int(100) NOT NULL,
  `placed_on` date NOT NULL DEFAULT current_timestamp(),
  `payment_status` varchar(20) NOT NULL DEFAULT 'pending',
  `image` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `name`, `number`, `email`, `method`, `address`, `total_products`, `total_price`, `placed_on`, `payment_status`, `image`) VALUES
(42, 5, 'a', '012345678', 'a@gmail.com', 'credit card', 'a, a,  a, a', 'pizaa 3 (7 x 1) - ', 7, '2024-05-09', 'completed', 'pizza-4.png'),
(44, 5, 'a', '012345678', 'a@gmail.com', 'cash on delivery', 'a, a,  a, a', 'pizaa 3 (7 x 1) - a (1 x 1) - a1 (2 x 1) - q (5 x 1) - qw (8 x 1) - d (2 x 1) - ', 25, '2024-05-09', 'completed', 'pizza-4.pngdish-1.pngdessert-1.pngdessert-2.pngdrink-5.pngdessert-6.png'),
(45, 6, 'a1', '0122222222', 'a1@gmail.com', 'cash on delivery', 'a, a,  a, a', 'pizaa 3 (7 x 1) - a (1 x 1) - ', 8, '2024-05-09', 'completed', 'pizza-4.pngdish-1.png'),
(46, 3, 'aa', '0123456789', 'aa@gmail.com', 'cash on delivery', 'aa, aa,  aa, aa', 'a1 (2 x 1) - d (2 x 8) - ', 18, '2024-05-09', 'completed', 'dessert-1.pngdessert-6.png'),
(47, 4, 'ad@gmail.com', '123123123', 'ad@gmail.com', 'cash on delivery', '123, 123,  123, 3232', 'a (1 x 1) - qw (8 x 6) - ', 49, '2024-05-09', 'completed', 'dish-1.pngdrink-5.png'),
(48, 2, 'Huu Thai', '0329354445', 'thaidinhhuu90@gmail.com', 'paytm', '166/2 Trần Văn Dư, binh tan,  ho chi minh, Vietnam', 'q (5 x 5) - ', 25, '2024-05-09', 'completed', 'dessert-2.png'),
(49, 7, 'k', '0133333333', 'a2@gmail.com', 'credit card', 'a, a,  a, a', 'pizaa 2 (6 x 6) - ', 36, '2024-05-09', 'completed', 'pizza-2.png'),
(50, 7, 'k', '0133333333', 'a2@gmail.com', 'cash on delivery', 'a, a,  a, a', 'a (1 x 13) - ', 13, '2024-05-09', 'completed', 'dish-1.png'),
(51, 4, 'nk', '123123123', 'ad@gmail.com', 'paytm', '123, 123,  123, 3232', 'a (1 x 1) - ', 1, '2024-05-09', 'completed', 'dish-1.png'),
(52, 4, 'nk', '123123123', 'ad@gmail.com', 'paypal', '123, 123,  123, 3232', 'a (1 x 1) - ', 1, '2024-05-09', 'completed', 'dish-1.png'),
(53, 7, 'k', '0133333333', 'a2@gmail.com', 'cash on delivery', 'a, a,  a, a', 'a (1 x 2) - ', 2, '2024-05-09', 'completed', 'dish-1.png'),
(54, 7, 'k', '0133333333', 'a2@gmail.com', 'cash on delivery', 'a, a,  a, a', 'a1 (2 x 1) - ', 2, '2024-05-09', 'completed', 'dessert-1.png'),
(55, 7, 'k', '0133333333', 'a2@gmail.com', 'paypal', 'a, a,  a, a', 'a1 (2 x 1) - ', 2, '2024-05-09', 'completed', 'dessert-1.png'),
(56, 4, 'nk', '123123123', 'ad@gmail.com', 'cash on delivery', '123, 123,  123, 3232', 'a (1 x 4) - ', 4, '2024-05-09', 'completed', 'dish-1.png');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(100) NOT NULL,
  `price` int(10) NOT NULL,
  `image` varchar(100) NOT NULL,
  `details` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `price`, `image`, `details`) VALUES
(18, 'pizaa 3', 'fast food', 7, 'pizza-4.png', 'scscscscscs'),
(37, 'a', 'main dish', 1, 'dish-1.png', 'aaa'),
(38, 'a1', 'drinks', 2, 'dessert-1.png', 'llll'),
(39, 'q', 'desserts', 5, 'dessert-2.png', 'a'),
(40, 'qw', 'drinks', 8, 'drink-5.png', 'aaa'),
(42, 'd', 'desserts', 2, 'dessert-6.png', 'aa'),
(43, 'pizaa 1', 'fast food', 5, 'pizza-1.png', 'asdsssadsa'),
(44, 'pizaa 2', 'fast food', 6, 'pizza-2.png', 'aa'),
(46, 'aaaaa', 'main dish', 11, 'home-img-3.png', 'aaaa');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(100) NOT NULL,
  `name` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `number` varchar(10) NOT NULL,
  `password` varchar(50) NOT NULL,
  `address` varchar(500) NOT NULL,
  `is_locked` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `number`, `password`, `address`, `is_locked`) VALUES
(1, 'huu', 'huunl2002@gmail.com', '0901074402', '40bd001563085fc35165329ea1ff5c5ecbdbbeef', 'ff, cscsc, vdvd, scsc, cscs, dvdv, cscsc - 1224', 1),
(2, 'Huu Thai', 'thaidinhhuu90@gmail.com', '0329354445', '40bd001563085fc35165329ea1ff5c5ecbdbbeef', '166/2 Trần Văn Dư, binh tan,  ho chi minh, Vietnam', 0),
(3, 'aa', 'aa@gmail.com', '0123456789', '40bd001563085fc35165329ea1ff5c5ecbdbbeef', 'aa, aa,  aa, aa', 0),
(4, 'nk', 'ad@gmail.com', '123123123', '40bd001563085fc35165329ea1ff5c5ecbdbbeef', '123, 123,  123, 3232', 0),
(5, 'a', 'a@gmail.com', '012345678', '40bd001563085fc35165329ea1ff5c5ecbdbbeef', 'a, a,  a, a', 0),
(6, 'a1', 'a1@gmail.com', '0122222222', '40bd001563085fc35165329ea1ff5c5ecbdbbeef', 'a, a,  a, a', 0),
(7, 'k', 'a2@gmail.com', '0133333333', '40bd001563085fc35165329ea1ff5c5ecbdbbeef', 'a, a,  a, a', 0);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT cho bảng `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
