import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import puplogo from "../assets/images/LandingPage/puplogo.png";
import cybernest from "../assets/images/LandingPage/cybernest.png";
import flow from "../assets/images/LandingPage/flow.png";

import TextField from "@mui/material/TextField";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LogBook() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL; // ✅ Using .env

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    department: "",
    purpose: "",
    action: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = async () => {
    if (!formData.email) {
      toast.error("Email is required!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/auth/check-login-status`, // ✅ UPDATED
        { email: formData.email },
        { headers: { "Cache-Control": "no-cache" } }
      );

      const nextStep = res.data?.next_modal;
      const sessionId = res.data?.session_id;

      if (nextStep === "logout") {
        toast.info("You are already logged in, redirecting to logout...");
        setTimeout(() => {
          navigate("/logout", {
            state: {
              email: formData.email,
              sessionId: sessionId,
            },
          });
        }, 3000);
      } else {
        toast.success("Login status confirmed! Redirecting...");
        setTimeout(() => {
          navigate("/login", {
            state: {
              email: formData.email,
            },
          });
        }, 3000);
      }
    } catch (err) {
      console.error("Check login status failed:", err);
      toast.warn("Unable to check login status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-[Montserrat] flex flex-col items-center justify-between py-8">
      <ToastContainer position="top-center" autoClose={3000} limit={2} />

      {/* Top Content */}
      <div className="w-full max-w-[360px] flex flex-col items-center text-center">
        {/* Logo */}
        <img src={puplogo} alt="Innovation Commercialization Office logo" className="h-12 mb-4" />

        {/* Title */}
        <h1 className="text-lg font-extrabold text-[#6D0C22] mb-1">
          Check In / Check Out
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter your email to check in or check out <br /> of the ICO co-working space.
        </p>

        {/* Email */}
        <TextField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          size="small"
          fullWidth
          className="max-w-[333px] font-[Montserrat]"
          sx={{ mb: 2 }}
        />

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={loading}
          className={`w-full max-w-[333px] py-3 text-sm font-semibold rounded-lg transition bg-gradient-to-r from-[#6D0C22] to-[#0E386B] text-white ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {loading ? "Checking..." : "Next"}
        </button>
      </div>

      {/* Powered By */}
      <div className="flex flex-col items-center mt-8 space-y-1">
        <p className="text-[10px] text-gray-400">Powered By:</p>
        <div className="flex items-center space-x-2">
          <img src={cybernest} alt="Cybernest Solutions" className="h-12" />
          <img src={flow} alt="Flow" className="h-4" />
        </div>
      </div>
    </div>
  );
}
