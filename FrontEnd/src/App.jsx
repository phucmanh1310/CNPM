import React from "react";
import { Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import useGetCurrentUser from "./hooks/useGetCurrentUser.jsx";
import { useSelector } from "react-redux";
import Home from "./pages/Home.jsx";
import { Navigate } from "react-router-dom";
export const serverURL = "http://localhost:8000";
function App() {
  useGetCurrentUser();
  const { userData } = useSelector((state => state.user));
  return (
    <Routes>
      <Route path="/signin" element={!userData ? < SignIn /> : <Navigate to={"/"} />} />
      <Route path="/signup" element={!userData ? < SignUp /> : <Navigate to={"/"} />} />
      <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />} />
      <Route path="/" element={userData ? <Home /> : <Navigate to={"/signin"} />} />
    </Routes>
  );
}

export default App;
