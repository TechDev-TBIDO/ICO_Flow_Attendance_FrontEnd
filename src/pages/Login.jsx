import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SuccessModal from "../components/SucessModal";
import TermsModal from "../components/TermsModal";
import puplogo from "../assets/images/LandingPage/puplogo.png";
import cybernest from "../assets/images/LandingPage/cybernest.png";
import flow from "../assets/images/LandingPage/flow.png";

import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

export default function Login() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL; // ✅ using .env

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    office: "",
    position: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [errors, setErrors] = useState({});
  const [showTerms, setShowTerms] = useState(false);

  const agreeToTerms = () => {
    setFormData((prev) => ({ ...prev, terms: true }));
    setErrors((prev) => ({ ...prev, terms: undefined }));
    setShowTerms(false);
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Email passed from logbook
  const prefilledEmail = location.state?.email || "";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear a field's error as soon as the user fixes it
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  };

  const validate = () => {
    const email = (formData.email || prefilledEmail).trim();
    const next = {};
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!formData.name.trim()) next.name = "Full name is required.";
    if (!formData.office.trim()) next.office = "This field is required.";
    if (!formData.position.trim()) next.position = "Position is required.";
    if (!formData.terms) next.terms = "Please agree to the terms to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (loading) return;
    if (!validate()) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: (formData.email || prefilledEmail).trim(),
        name: formData.name.trim(),
        office: formData.office.trim(),
        position: formData.position.trim(),
        terms: formData.terms,
      });

      const { status, message, session_id } = res.data;
      setSessionId(session_id);

      // Open success modal
      setIsModalOpen(true);

      if (status === "already_logged_in") {
        toast.success(message);
      } else {
        toast.success("Successfully logged in!");
      }
    } catch (err) {
      console.error("Login failed:", err);
      const errorMessage =
        err?.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/", {
      state: {
        email: formData.email || prefilledEmail,
        sessionId: sessionId,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white font-[Montserrat] flex flex-col items-center justify-between py-8">
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Form Container */}
      <div className="w-full max-w-[360px] flex flex-col items-center text-center">
        {/* Logo */}
        <img src={puplogo} alt="Innovation Commercialization Office logo" className="h-15 mb-4" />

        {/* Title */}
        <h1 className="text-lg font-extrabold bg-gradient-to-r from-[#6D0C22] to-[#0E386B] bg-clip-text text-transparent mb-1">
          Login
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Tell us a bit about yourself to check in <br /> to the ICO co-working space.
        </p>

        {/* Input Fields */}
        <Box
          component="form"
          id="checkin-form"
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
          {/* Email */}
          <TextField
            type="email"
            name="email"
            label="Email Address"
            value={formData.email || prefilledEmail}
            onChange={handleChange}
            size="small"
            fullWidth
            required
            error={!!errors.email}
            helperText={errors.email}
            disabled={!!prefilledEmail}
          />

          {/* Name */}
          <TextField
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            size="small"
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
          />

          {/* Department */}
          <TextField
            name="office"
            label="Course/Department/Office/Startup"
            value={formData.office}
            onChange={handleChange}
            size="small"
            fullWidth
            required
            error={!!errors.office}
            helperText={errors.office}
          />

          {/* Position */}
          <TextField
            name="position"
            label="Position"
            value={formData.position}
            onChange={handleChange}
            size="small"
            fullWidth
            required
            error={!!errors.position}
            helperText={errors.position}
          />
        </Box>

        {/* Terms Checkbox */}
        <label className={`flex items-start text-left w-full max-w-[333px] text-xs ${errors.terms ? "text-red-600" : "text-gray-600"} ${errors.terms ? "mb-1" : "mb-5"}`}>
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            className="mr-2 mt-[2px]"
          />
          <span>
            I have read and agree to the{" "}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); // don't toggle the checkbox via the label
                setShowTerms(true);
              }}
              className="text-[#0E386B] font-semibold underline-offset-2 hover:underline cursor-pointer"
            >
              Terms and Conditions
            </button>
            .<span className="text-red-600"> *</span>
          </span>
        </label>
        {errors.terms && (
          <p className="w-full max-w-[333px] text-left text-xs text-red-600 mb-4">{errors.terms}</p>
        )}

        {/* Login Button */}
        <button
          type="submit"
          form="checkin-form"
          disabled={loading}
          className={`w-full max-w-[333px] py-3 text-sm font-semibold rounded-lg transition bg-gradient-to-r from-[#6D0C22] to-[#0E386B] text-white ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {loading ? "Logging in..." : "Next"}
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

      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAgree={agreeToTerms}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="You're already logged in!"
        message="Redirecting you to logout to complete your session."
      />
    </div>
  );
}
