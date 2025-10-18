import React from "react";
import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../App";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function AdminLogin() {
    const primaryColor = "#00BFFF";
    const bgcolor = "#fff9f6";
    const borderColor = "#ddd";
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleAdminLogin = async () => {
        setLoading(true);
        try {
            const result = await axios.post(
                `${serverURL}/api/auth/signin`,
                { email, password },
                { withCredentials: true }
            );

            // Kiểm tra nếu user có role admin
            if (result.data.user.role !== "admin") {
                setErr("Access denied. Admin privileges required.");
                setLoading(false);
                return;
            }

            // Dispatch dữ liệu user vào Redux
            dispatch(setUserData(result.data.user));

            console.log("Admin login success:", result.data);
            setErr("");
            setLoading(false);

            // Navigate đến admin dashboard
            navigate("/admin", { replace: true });

        } catch (error) {
            setErr(error?.response?.data?.message || "Login failed. Please try again.");
            setLoading(false);
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
                    ADMIN LOGIN
                </h1>
                <p className="text-grey-600 mb-8">
                    Sign in to access the admin dashboard and manage the system.
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
                        placeholder="Enter admin email"
                        style={{ border: "1px solid ${borderColor}" }}
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        required
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
                            placeholder="Enter admin password"
                            style={{ border: "1px solid ${borderColor}" }}
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />

                        <button
                            className="absolute right-3 cursor-pointer top-[14px] text-gray-500"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                        </button>
                    </div>
                </div>

                <button
                    className={
                        "w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#00BFFF] text-white hover:bg-[#00BFFF] cursor-pointer"
                    }
                    onClick={handleAdminLogin}
                    disabled={loading}
                >
                    {loading ? <ClipLoader color="white" size={20} /> : "ADMIN LOGIN"}
                </button>

                {err && <p className="text-red-500 text-center my-[10px]">{err}</p>}

                <p
                    className="text-center mt-2 cursor-pointer"
                    onClick={() => navigate("/signin")}
                >
                    Regular user?{" "}
                    <span className="text-[#00BFFF]"> Sign In</span>
                </p>
            </div>
        </div>
    );
}

export default AdminLogin;
