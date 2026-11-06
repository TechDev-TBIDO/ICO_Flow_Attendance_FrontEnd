import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import puplogo from "../assets/images/LandingPage/puplogo.png";
import cybernest from "../assets/images/LandingPage/cybernest.png";
import flow from "../assets/images/LandingPage/flow.png";

import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ThankYouModal from "../components/ThankYouModal";

export default function Logout() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL; // ✅ .env enabled

  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: "",
    resources: [],
    feedback: "",
    otherResource: "",
  });

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const resourceOptions = [
    "Computer",
    "Projector with Clicker",
    "TV",
    "Printer",
    "Co-working Tables",
  ];

  // Checkbox handler
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      resources: checked
        ? [...prev.resources, value]
        : prev.resources.filter((item) => item !== value),
    }));
    if (checked) setErrors((prev) => ({ ...prev, resources: undefined }));
  };

  // Generic input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear the related error as soon as the user fixes it
    const errorKey = name === "otherResource" ? "resources" : name;
    if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
  };

  // Logout handler
  const handleLogout = async (e) => {
    e?.preventDefault();
    if (loading) return;

    const emailToUse = (formData.email || prefilledEmail).trim();

    // Merge checkbox + custom resource
    const allResources = [...formData.resources];
    if (formData.otherResource.trim() !== "") {
      allResources.push(formData.otherResource.trim());
    }

    const next = {};
    if (!emailToUse) next.email = "Email is required.";
    if (allResources.length === 0) {
      next.resources = "Select at least one resource, or type it under Other Resource.";
    }
    if (!formData.feedback.trim()) next.feedback = "Feedback is required.";
    setErrors(next);

    if (Object.keys(next).length > 0) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/logout`, {
        email: emailToUse,
        resources: allResources.join(", "),
        feedback: formData.feedback.trim(),
      });

      const { status, message } = res.data;

      if (status === "already_logged_out") {
        toast.success(message);
      }

      setIsModalOpen(true);
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error(err?.response?.data?.message || "Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Modal close → redirect home
  const closeModal = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white font-[Montserrat] flex flex-col items-center justify-between py-8">

      <ToastContainer position="top-center" autoClose={3000} />

      {/* Top Content */}
      <div className="w-full max-w-[360px] flex flex-col items-center text-center">
        <img src={puplogo} alt="Innovation Commercialization Office logo" className="h-12 mb-4" />

        <h1 className="text-lg font-extrabold bg-gradient-to-r from-[#6D0C22] to-[#0E386B] bg-clip-text text-transparent mb-1">
          Logout
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          Let us know what you used today <br /> before you check out.
        </p>

        <form
          id="checkout-form"
          onSubmit={handleLogout}
          noValidate
          className="w-full flex flex-col items-center"
        >
        {/* Email */}
        <TextField
          type="email"
          name="email"
          label="Email Address"
          value={formData.email || prefilledEmail}
          onChange={handleChange}
          disabled={!!prefilledEmail}
          size="small"
          fullWidth
          required
          error={!!errors.email}
          helperText={errors.email}
          sx={{ mb: 2 }}
          className="max-w-[333px] font-[Montserrat]"
        />

        {/* Resources */}
        <div
          className={`w-full max-w-[333px] text-left text-sm font-semibold mb-1 ${
            errors.resources ? "text-red-600" : ""
          }`}
        >
          Resources Used: <span className="text-red-600">*</span>
        </div>

        <FormGroup className="w-full max-w-[333px]">
          {resourceOptions.map((option) => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  value={option}
                  checked={formData.resources.includes(option)}
                  onChange={handleCheckboxChange}
                />
              }
              label={option}
              className="text-sm"
            />
          ))}
        </FormGroup>

        {/* Other Resource */}
        <TextField
          name="otherResource"
          label="Other Resource"
          value={formData.otherResource}
          onChange={handleChange}
          size="small"
          fullWidth
          error={!!errors.resources}
          helperText={errors.resources}
          sx={{ mb: 2 }}
        />

        {/* Feedback */}
        <TextField
          name="feedback"
          label="Feedback"
          value={formData.feedback}
          onChange={handleChange}
          multiline
          rows={3}
          fullWidth
          required
          error={!!errors.feedback}
          helperText={errors.feedback}
          sx={{ mb: 2 }}
        />
        </form>

        {/* Logout Button */}
        <button
          type="submit"
          form="checkout-form"
          disabled={loading}
          className={`w-full max-w-[333px] py-3 text-sm font-semibold rounded-lg transition bg-gradient-to-r from-[#6D0C22] to-[#0E386B] text-white ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
          }`}
        >
          {loading ? "Logging out..." : "Logout"}
        </button>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center mt-8 space-y-1">
        <p className="text-[10px] text-gray-400">Powered By:</p>
        <div className="flex items-center space-x-2">
          <img src={cybernest} alt="Cybernest Solutions" className="h-12" />
          <img src={flow} alt="Flow" className="h-4" />
        </div>
      </div>

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Thank you!"
        message="You have successfully logged out."
      />
    </div>
  );
}
