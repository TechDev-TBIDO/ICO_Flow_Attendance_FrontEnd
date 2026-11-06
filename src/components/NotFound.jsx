import React from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/images/LandingPage/puplogo.png";
import illustration from "../assets/images/LandingPage/illustration.png"; 
import cybernestLogo from "../assets/images/LandingPage/cybernest.png";
import flowLogo from "../assets/images/LandingPage/flow.png";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-[montserrat] flex flex-col items-center justify-center bg-white px-6 py-10 text-center font-[Montserrat]">
      {/* Logo */}
      <img src={logo} alt="Innovation Commercialization Office logo" className="h-15 mb-4" />

      {/* 404 Text */}
      <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6D0C22] to-[#0E386B] mb-1">
        404
      </h1>
      <h2 className="text-lg font-[montserrat] font-semibold text-[#6D0C22] mb-6">Page not Found</h2>

      {/* Illustration */}
      <img
        src={illustration}
        alt="Not Found Graphic"
        className="h-40 w-auto mb-6"
      />

      {/* Message */}
      <p className="text-sm text-gray-700 max-w-xs mb-8">
        Oops! The page you're looking for doesn’t exist or has been moved. <br />
        Let’s get you back on track.
      </p>

      {/* Back Home Button */}
      <button
        onClick={() => navigate("/")}
        className="bg-gradient-to-r from-[#6D0C22] to-[#0E386B] text-white px-5 py-2 rounded-lg hover:opacity-90 transition"
      >
        Go Back
      </button>

      {/* Powered By */}
      <div className="mt-10">
        <p className="text-xs text-gray-400 mb-2">Powered By:</p>
        <div className="flex items-center justify-center space-x-4">
          <img src={cybernestLogo} alt="Cybernest Solutions" className="h-12" />
          <img src={flowLogo} alt="Flow" className="h-4" />
        </div>
      </div>
    </div>
  );
}
