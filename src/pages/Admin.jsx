import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import puplogo from "../assets/images/LandingPage/puplogo.png";
import cybernest from "../assets/images/LandingPage/cybernest.png";
import flow from "../assets/images/LandingPage/flow.png";
import { API_BASE, isAdminLoggedIn, setAdminToken } from "../lib/adminAuth";

export default function Admin() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Already logged in -> straight to the panel; explain why we got bounced here
  useEffect(() => {
    if (isAdminLoggedIn()) {
      window.location.replace("/panel");
      return;
    }
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "expired") toast.info("Your session expired. Please log in again.");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (loading) return;
    if (!formData.username) return toast.warning("Username is required!");
    if (!formData.password) return toast.warning("Password is required!");

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === "success") {
        toast.success("Login successful!");

        // Save JWT Token
        setAdminToken(data.token);

        // Redirect to Admin Panel
        setTimeout(() => {
          window.location.href = "/panel";
        }, 700);
      } else {
        toast.error(data.message || "Login failed.");
      }
    } catch {
      toast.error("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white font-[Montserrat] flex flex-col items-center justify-between py-8">
      
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Top Section */}
      <div className="w-full max-w-[360px] flex flex-col items-center text-center">

        <img src={puplogo} alt="Innovation Commercialization Office logo" className="h-14 mb-4" />

        <h1 className="text-lg font-extrabold bg-gradient-to-r from-[#6D0C22] to-[#0E386B] bg-clip-text text-transparent mb-1">
          Admin Login
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          Access administrative tools and system controls.
        </p>

        <Box
          component="form"
          onSubmit={handleLogin}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
            maxWidth: "333px",
            mb: 2,
          }}
        >
          <TextField
            label="Admin Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            size="small"
            fullWidth
            autoFocus
            autoComplete="username"
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            size="small"
            fullWidth
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-sm font-semibold rounded-lg transition 
            bg-gradient-to-r from-[#6D0C22] to-[#0E386B] text-white
            ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
        >
            {loading ? "Logging in..." : "Login"}
          </button>
        </Box>

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
