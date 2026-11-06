import React, { Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Lottie from "lottie-react";

// Assets
import logo from "../assets/images/LandingPage/puplogo.png";
import successAnimation from "../assets/JSON/success-check.json";
import cybernest from "../assets/images/LandingPage/cybernest.png";
import flow from "../assets/images/LandingPage/flow.png";
import checkTick from "../assets/images/LandingPage/tick.svg"; 

export default function ThankYouModal({ isOpen, onClose, title, message }) {
  // Auto-close after 2.5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 font-[montserrat]  bg-black/60" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl text-center shadow-2xl w-full max-w-xs overflow-hidden">
            {/* Logo */}
            <div className="pt-6">
              <img src={logo} alt="Innovation Commercialization Office logo" className="h-14 mx-auto mb-2" />
            </div>

            {/* Combined Animation + Tick Image */}
            <div className="relative w-42 h-42 mx-auto mb-4">
              {/* Lottie Animation */}
              <Lottie
                animationData={successAnimation}
                loop={false}
                autoplay={true}
                className="absolute inset-0"
              />
              {/* Custom Tick Image Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={checkTick}
                  alt="Success Tick"
                  className="w-35 h-35 object-contain"
                />
              </div>
            </div>

            {/* Success Title */}
            <h3 className="text-lg font-bold font-[montserrat] bg-gradient-to-r from-[#6D0C22] to-[#0E386B] bg-clip-text text-transparent">
              {title || "Success!"}
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-600 px-6 mt-2 mb-6">
              {message || "You have successfully completed the action."}
            </p>

            {/* Divider */}
            <div className="border-t border-gray-200 mx-6 mb-4"></div>

            {/* Powered by */}
            <div className="pb-4">
              <p className="text-[10px] text-gray-400 mb-1">Powered By:</p>
              <div className="flex items-center justify-center space-x-2">
                <img src={cybernest} alt="Cybernest" className="h-8" />
                <img src={flow} alt="Flow" className="h-3" />
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
