import React from "react";
import { Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import useGetCurrentUser from "./hooks/useGetCurrentUser.jsx";
import { useSelector } from "react-redux";
import Home from "./pages/Home.jsx";
import { Navigate } from "react-router-dom";
import useGetCity from "./hooks/useGetCity.jsx";
import useGetMyShop from "./hooks/userGetMyShop.jsx";
import CreateEditShop from "./pages/CreateEditShop.jsx";
export const serverURL = "http://localhost:8000";
function App() {
  useGetCurrentUser();
  useGetCity();
  const { userData } = useSelector((state => state.user));
  useGetMyShop();

  return (
    <Routes>
      <Route path="/signin" element={!userData ? < SignIn /> : <Navigate to={"/"} />} />
      <Route path="/signup" element={!userData ? < SignUp /> : <Navigate to={"/"} />} />
      <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />} />
      <Route path="/" element={userData ? <Home /> : <Navigate to={"/signin"} />} />
      <Route path="/create-edit-shop" element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />} />
    </Routes>
  );
}

export default App;
