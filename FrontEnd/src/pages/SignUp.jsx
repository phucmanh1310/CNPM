import React from "react";
import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../App"; // Import từ App.js
// import authRouter from "./routes/auth.routes.js";
import axios from "axios";
function SignUp() {
  const primaryColor = "#00BFFF";
  //   const hoverColor = "#e64323";
  const bgcolor = "#fff9f6";
  const borderColor = "#ddd";
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const [fullName, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const handleSignUp = async () => {
    try {
      const result = await axios.post(
        `${serverURL}/api/auth/signup`,
        {
          fullName,
          email,
          password,
          mobile,
          role,
        },
        { withCredentials: true }
      );
      console.log(result);
    } catch (error) {
      console.log(error);
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
          Create your account to get started with delicious food deliveries.
        </p>

        {/* fullname */}
        <div className="mb-4">
          <label
            htmlFor="fullname"
            className="block text-gray-700 font-medium mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter your Fullname"
            style={{ border: "1px solid ${borderColor}" }}
            onChange={(e) => setFullname(e.target.value)}
            value={fullName}
          />
        </div>
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
          />
        </div>
        {/* mobile */}
        <div className="mb-4">
          <label
            htmlFor="mobile"
            className="block text-gray-700 font-medium mb-1"
          >
            Mobile
          </label>
          <input
            type="mobile"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter your Mobile Number"
            style={{ border: "1px solid ${borderColor}" }}
            onChange={(e) => setMobile(e.target.value)}
            value={mobile}
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
            />

            <button
              className="absolute right-3 cursor-pointer top-[14px] text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>
        {/* role */}
        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            Role
          </label>
          <div className="flex gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                onClick={() => setRole(r)}
                style={
                  role == r
                    ? { backgroundColor: primaryColor, color: "white" }
                    : { border: "1px solid ${primaryColor}", color: "#00BFFF" }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <button
          className={
            "w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#00BFFF] text-white hover:bg-[#00BFFF] cursor-pointer"
          }
          onClick={handleSignUp}
        >
          Sign Up
        </button>
        <button
          className="w-full mt-4 flex items-center justify-center gap-2 font-semibold py-2 rounded-lg transition duration-200 border-gray-400 hover:bg-gray-100 cursor-pointer"
          style={{ border: `1px solid ${borderColor}` }}
        >
          <FcGoogle size={30} />
          <span> Sign up with Google</span>
        </button>
        <p
          className="text-center mt-2 cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          Already have an account ?{" "}
          <span className="text-[#00BFFF]"> Sign In</span>{" "}
        </p>
      </div>
    </div>
  );
}

export default SignUp;
