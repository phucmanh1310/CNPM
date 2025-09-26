import React from "react";
import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../App"; // Import từ App.js
// import authRouter from "./routes/auth.routes.js";
<<<<<<< HEAD
import axios from "axios";
=======
import {} from "react-spinners";
import axios from "axios";

>>>>>>> ATR_Branch
function SignIn() {
  const primaryColor = "#00BFFF";
  //   const hoverColor = "#e64323";
  const bgcolor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const handleSignIn = async () => {
=======
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSignIn = async () => {
    setLoading(true);
>>>>>>> ATR_Branch
    try {
      const result = await axios.post(
        `${serverURL}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );
      console.log("Signin success:", result.data);
<<<<<<< HEAD
    } catch (error) {
      // Xem thông báo lỗi cụ thể từ backend
      console.log("Signin error response:", error.response?.data);
      console.log("Email/password used:", { email, password });
=======
      setErr("");
      setLoading(false);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
>>>>>>> ATR_Branch
    }
  };
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgcolor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
          Snake
        </h1>
        <p className="text-grey-600 mb-8">
          Sign in to your account to get started with delicious food deliveries.
        </p>

        {/* email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter your Email"
            style={{ border: "1px solid ${borderColor}" }}
            onChange={(e) => setEmail(e.target.value)}
            value={email}
<<<<<<< HEAD
=======
            required
>>>>>>> ATR_Branch
          />
        </div>

        {/* password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              placeholder="Enter your Password"
              style={{ border: "1px solid ${borderColor}" }}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
<<<<<<< HEAD
=======
              required
>>>>>>> ATR_Branch
            />

            <button
              className="absolute right-3 cursor-pointer top-[14px] text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>
        <div
<<<<<<< HEAD
          className="text-right mb-4 text-[#00BFFF] font-medium"
          onClick={() => navigate("forgot-password")}
=======
          className="text-right mb-4 text-[#00BFFF] font-medium cursor-pointer"
          onClick={() => navigate("/forgot-password")}
>>>>>>> ATR_Branch
        >
          Forgot Password?
        </div>
        <button
          className={
            "w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#00BFFF] text-white hover:bg-[#00BFFF] cursor-pointer"
          }
          onClick={handleSignIn}
<<<<<<< HEAD
        >
          Sign In
        </button>
        <button
          className="w-full mt-4 flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition duration-200 border-gray-400 hover:bg-gray-100 cursor-pointer"
          style={{ border: `1px solid ${borderColor}` }}
        >
          <FcGoogle size={30} />
          <span> Sign In with Google</span>
        </button>
=======
          disabled={loading}
        >
          {loading ? <clipLoader color="white" size={20} /> : "Sign In"}
        </button>
        <p className="text-red-500 text-center my-[10px]">*{err}</p>
>>>>>>> ATR_Branch
        <p
          className="text-center mt-2 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Already have an account ?{" "}
          <span className="text-[#00BFFF]"> Want to create a new account?</span>{" "}
        </p>
      </div>
    </div>
  );
}

export default SignIn;
