import React from "react";
import { Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
<<<<<<< HEAD
export const serverURL = "http://localhost:8000";
function App() {
=======
import ForgotPassword from "./pages/ForgotPassword.jsx";
import useGetCurrentUser from "./hooks/useGetCurrentUser.jsx";
export const serverURL = "http://localhost:8000";
function App() {
  useGetCurrentUser();
>>>>>>> ATR_Branch
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
<<<<<<< HEAD
=======
      <Route path="/forgot-password" element={<ForgotPassword />} />
>>>>>>> ATR_Branch
    </Routes>
  );
}

export default App;
