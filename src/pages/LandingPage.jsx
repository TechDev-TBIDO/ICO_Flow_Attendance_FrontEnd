// --- IMPORTS -------------------------------------------------------
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import coWorking from "../assets/images/LandingPage/co-working.svg";
import cybernest from "../assets/images/LandingPage/cybernest.png";
import puplogo from "../assets/images/LandingPage/puplogo.png";
import flow from "../assets/images/LandingPage/flow.png";

import WrongNetworkModal from "../components/WrongNetworkModal";

export default function LandingPage() {
  //--------------------------------------------------------
  // STATE
  //--------------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const navigate = useNavigate();

  //--------------------------------------------------------
  // ENV API BASE
  //--------------------------------------------------------
  const API_BASE = import.meta.env.VITE_API_BASE_URL; // ✅ Use .env

  //--------------------------------------------------------
  // HANDLE NETWORK CHECK
  //--------------------------------------------------------
  const handleCoworking = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/network/check-network`);

      if (res.data?.connected) {
        navigate("/logbook");
      } else {
        setIsNetworkModalOpen(true);
      }
    } catch (err) {
      console.error("Network check failed:", err);
      setIsNetworkModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  //--------------------------------------------------------
  // FETCH ANNOUNCEMENTS
  //--------------------------------------------------------
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`${API_BASE}/announcements/all`);
        const data = await res.json();

        if (data.status === "success") {
          const sorted = data.announcements.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setAnnouncements(sorted);
        }
      } catch (err) {
        console.error("Failed to load announcements:", err);
      }
    };

    fetchAnnouncements();
  }, [API_BASE]);

  //--------------------------------------------------------
  // HELPER: STYLING BY CATEGORY
  //--------------------------------------------------------
  const getCategoryStyle = (title) => {
    const t = title.toLowerCase();

    if (t.includes("network"))
      return { bg: "bg-red-50", border: "border-red-600", icon: "⚠️", text: "text-red-800" };

    if (t.includes("hour") || t.includes("schedule"))
      return { bg: "bg-blue-50", border: "border-blue-600", icon: "🕒", text: "text-blue-800" };

    if (t.includes("security") || t.includes("id"))
      return { bg: "bg-purple-50", border: "border-purple-600", icon: "🔐", text: "text-purple-800" };

    if (t.includes("meeting") || t.includes("room"))
      return { bg: "bg-green-50", border: "border-green-600", icon: "📅", text: "text-green-800" };

    return { bg: "bg-amber-50", border: "border-amber-600", icon: "📢", text: "text-amber-800" };
  };

  //--------------------------------------------------------
  // CURRENT DATE
  //--------------------------------------------------------
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  //--------------------------------------------------------
  // UI RENDER
  //--------------------------------------------------------
  return (
    <div className="min-h-screen bg-white font-[Montserrat] flex justify-center">
      <div className="w-full max-w-[360px] flex flex-col items-center text-center pt-6 sm:pt-10">

        {/* LOGO */}
        <img src={puplogo} alt="Innovation Commercialization Office logo" className="h-12 sm:h-14 mb-4" />

        {/* TITLE */}
        <h1 className="text-lg sm:text-lg font-extrabold text-gray-900 mb-1">
          <span className="text-[#6D0C22]">Co-Working</span>{" "}
          <span className="text-[#0E386B]">Space</span>
        </h1>

        <p className="text-[11px] sm:text-sm text-gray-600 leading-snug mb-5">
          Check in and out of the Innovation Commercialization Office co-working space, and catch the latest announcements.
        </p>

        {/* COWORKING BUTTON */}
        <button
          onClick={handleCoworking}
          disabled={loading}
          className={`relative mb-2 cursor-pointer w-full max-w-[333px] rounded-4xl overflow-hidden shadow-md hover:shadow-lg active:scale-[0.98] transition border-2 ${
            loading ? "opacity-50 cursor-not-allowed" : "border-transparent"
          }`}
        >
          <img src={coWorking} alt="" className="w-full rounded-2xl" />
          {/* Subtitle is real text (not baked into the SVG) so it's easy to edit */}
          <span className="absolute inset-x-0 top-[72%] px-6 text-center text-[10px] leading-[1.3] font-medium text-white">
            Record your presence in the co-working space
            <br />
            with just a few clicks.
          </span>
          <span className="sr-only">Mark your attendance in the co-working space</span>
        </button>

        {/* ANNOUNCEMENTS WIDGET */}
        <div className="w-full max-w-[333px] mt-3 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg border border-gray-200 overflow-hidden">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#6D0C22] to-[#0E386B] px-4 py-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="animate-pulse">🔔</span> ANNOUNCEMENTS
            </h3>

            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="text-white/80 hover:text-white hover:scale-110 transition"
            >
              ⤢
            </button>
          </div>

          {/* SCROLLABLE LIST */}
          <div className="overflow-y-auto max-h-[140px] p-4 space-y-3 custom-scrollbar">
            {announcements.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">No announcements available.</p>
            ) : (
              announcements.slice(0, 4).map((a) => {
                const style = getCategoryStyle(a.title);

                return (
                  <div
                    key={a._id}
                    className={`${style.bg} border-l-4 ${style.border} p-3 rounded-r-lg hover:brightness-105 transition`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{style.icon}</span>
                      <div>
                        <p className={`text-xs font-semibold ${style.text}`}>{a.title}</p>
                        <p className="text-[11px] text-gray-600">{a.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* FOOTER */}
          <div className="bg-gray-100 px-4 py-2 text-center border-t text-[10px] text-gray-500">
            Last updated: {currentDate}
          </div>
        </div>

        {/* POWERED BY */}
        <div className="flex flex-col items-center mt-6">
          <p className="text-[10px] text-gray-400">Powered By:</p>
          <div className="flex items-center space-x-3">
            <img src={cybernest} alt="Cybernest Solutions" className="h-11" />
            <img src={flow} alt="Flow" className="h-4" />
          </div>
        </div>
      </div>

      {/* NETWORK MODAL */}
      <WrongNetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />

      {/* FULL ANNOUNCEMENT MODAL */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden">
            
            <div className="bg-gradient-to-r from-[#6D0C22] to-[#0E386B] px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">ANNOUNCEMENTS</h2>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="text-white/80 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-6 max-h-[60vh] space-y-4 custom-scrollbar">
              {announcements.map((a) => {
                const style = getCategoryStyle(a.title);

                return (
                  <div
                    key={a._id}
                    className={`${style.bg} border-l-4 ${style.border} p-4 rounded-r-xl`}
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl">{style.icon}</span>
                      <div>
                        <p className={`font-bold ${style.text}`}>{a.title}</p>
                        <p className="text-gray-700">{a.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Posted: {new Date(a.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-100 px-6 py-3 text-center text-sm text-gray-500">
              Last updated: {currentDate}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
