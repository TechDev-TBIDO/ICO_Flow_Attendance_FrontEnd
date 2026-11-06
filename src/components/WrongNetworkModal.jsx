import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import puplogo from "../assets/images/LandingPage/puplogo.png";
import cybernest from "../assets/images/LandingPage/cybernest.png";
import flow from "../assets/images/LandingPage/flow.png";
import qrCode from "../assets/images/LandingPage/qr.svg"; // ✅ Replace with your actual QR image

export default function WrongNetworkModal({ isOpen, onClose }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl transition-all relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              {/* Logo */}
              <img src={puplogo} alt="Innovation Commercialization Office logo" className="h-15 mx-auto mb-3" />

              {/* Title */}
                <h2
                  className="text-2xl font-[montserrat] sm:text-2xl px-6 font-extrabold bg-gradient-to-r from-[#6D0C22] via-[#3A4C8A] to-[#0E386B] bg-clip-text text-transparent mb-4"
                >Oops Wrong Network!
                </h2>
              <p className="text-sm text-gray-600 mb-4">
                Make sure you are connected to the <br />
                <span className="font-semibold text-[#0E386B]">ICO Wi-Fi
                </span>{" "}
                before logging in.
              </p>

              {/* QR Code */}
              <img src={qrCode} alt="QR Code" className="w-60 mx-auto mb-3" />
              <p className="text-xs text-gray-500">
                Scan this QR Code to connect to the <br />
                "ICO Wi-Fi"
              </p>

              {/* Powered By */}
              <div className="border-t pt-3 mt-3">
                <p className="text-[10px] text-gray-400">Powered By:</p>
                <div className="flex items-center justify-center space-x-2 mt-1">
                  <img
                    src={cybernest}
                    alt="Cybernest Solutions"
                    className="h-10"
                  />
                  <img src={flow} alt="Flow" className="h-4" />
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
