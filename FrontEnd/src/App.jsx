import React from "react";
import { Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import useGetCurrentUser from "./hooks/useGetCurrentUser.jsx";
export const serverURL = "http://localhost:8000";
function App() {
  useGetCurrentUser();
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
}

export default App;
