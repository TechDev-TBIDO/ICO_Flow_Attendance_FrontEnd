import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import puplogo from "../assets/images/LandingPage/puplogo.png";
import cybernest from "../assets/images/LandingPage/cybernest.png";
import flow from "../assets/images/LandingPage/flow.png";
import errorImage from "../assets/images/LandingPage/error.svg";

export default function ErrorModal({ isOpen, onClose }) {
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
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                {/* Close Icon */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                {/* Logo */}
                <img src={puplogo} alt="Innovation Commercialization Office logo" className="h-12 mx-auto mb-3" />

                {/* Gradient Text */}
                <h2
                  className="text-2xl font-[montserrat] sm:text-2xl px-6 font-extrabold bg-gradient-to-r from-[#6D0C22] via-[#3A4C8A] to-[#0E386B] bg-clip-text text-transparent mb-4"
                >Coming Soon!
                </h2>

                {/* ✅ Error Image (moved below the heading) */}
                <img src={errorImage} alt="Error" className="w-36 mx-auto mb-4" />

                {/* Description */}
                <p className="text-sm sm:text-sm text-gray-600 mb-4">
                 We're putting the final touches on something exciting!
                Thanks for your patience.
                </p>

                {/* Powered By */}
                <div className="border-t pt-3 mt-3">
                  <p className="text-[10px] text-gray-400">Powered By:</p>
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <img src={cybernest} alt="Cybernest Solutions" className="h-12" />
                    <img src={flow} alt="Flow" className="h-4" />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
