import React from 'react'
import { Route, Routes } from 'react-router-dom'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import useGetCurrentUser from './hooks/useGetCurrentUser.jsx'
import { useSelector } from 'react-redux'
import Home from './pages/Home.jsx'
import { Navigate } from 'react-router-dom'
import useGetCity from './hooks/useGetCity.jsx'
import useGetMyShop from './hooks/useGetMyShop.jsx'
import CreateEditShop from './pages/CreateEditShop.jsx'
import AddItem from './pages/AddItem.jsx' // ← Thêm import
import EditItem from './pages/EditItem.jsx' // ← Thêm import
import useGetShopByCity from './hooks/useGetShopByCity.jsx'
import useGetItemsByCity from './hooks/useGetItemsByCity.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckOut from './pages/CheckOut.jsx'
import ShopDetail from './pages/ShopDetail.jsx'
import OrderPlaced from './pages/OrderPlaced.jsx'
import MyOrders from './pages/MyOrders.jsx'
import DroneManagement from './pages/DroneManagement.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

export const serverURL = 'http://localhost:8000'

function App() {
  useGetCurrentUser()
  useGetCity()
  const { userData } = useSelector((state) => state.user)
  useGetMyShop()
  useGetShopByCity()
  useGetItemsByCity()

  return (
    <Routes>
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/" />}
      />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/" />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to="/signin" />}
      />
      <Route
        path="/create-edit-shop"
        element={userData ? <CreateEditShop /> : <Navigate to="/signin" />}
      />
      <Route
        path="/add-item"
        element={userData ? <AddItem /> : <Navigate to="/signin" />}
      />
      <Route
        path="/edit-item/:itemId"
        element={userData ? <EditItem /> : <Navigate to="/signin" />}
      />
      <Route
        path="/cart"
        element={userData ? <CartPage /> : <Navigate to="/signin" />}
      />
      <Route
        path="/checkout"
        element={userData ? <CheckOut /> : <Navigate to="/signin" />}
      />
      <Route
        path="/shop/:shopId"
        element={userData ? <ShopDetail /> : <Navigate to="/signin" />}
      />
      <Route
        path="/order-placed"
        element={userData ? <OrderPlaced /> : <Navigate to="/signin" />}
      />
      <Route
        path="/my-orders"
        element={userData ? <MyOrders /> : <Navigate to="/signin" />}
      />
      <Route
        path="/drone-management"
        element={userData ? <DroneManagement /> : <Navigate to="/signin" />}
      />
      <Route
        path="/payment/success"
        element={userData ? <PaymentSuccess /> : <Navigate to="/signin" />}
      />

      {/* Admin Routes */}
      <Route
        path="/admin-login"
        element={!userData ? <AdminLogin /> : <Navigate to="/admin" />}
      />
      <Route
        path="/admin"
        element={
          userData && userData.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/admin-login" />
          )
        }
      />
    </Routes>
  )
}

export default App
