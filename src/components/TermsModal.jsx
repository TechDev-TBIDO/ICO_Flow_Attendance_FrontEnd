import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

// Terms shown at check-in. Keep the wording in sync with the office's
// official privacy notice (have it reviewed by the PUP Data Protection Officer).
const SECTIONS = [
  {
    title: "1. Data Privacy and Consent",
    body: [
      "In compliance with Republic Act No. 10173, the Data Privacy Act of 2012, and its Implementing Rules and Regulations, the Innovation Commercialization Office (ICO) and DOST-PUP PYLON collect the personal information you provide in this form: your name, email address, course/department/office/startup, position, and your check-in and check-out times, together with the resources you used and any feedback you give.",
      "This information is used only to record attendance in the co-working space, manage the use of its facilities, prepare reports and statistics, and improve our services. It is accessed only by authorized personnel, kept secure, retained only as long as necessary for these purposes, and is not sold or shared with third parties except when required by law."
    ]
  },
  {
    title: "2. Photos and Videos",
    body: [
      "Photos and videos may be taken inside the co-working space and during events, meetings and activities. By checking in, you consent to being photographed or recorded and to the use of these materials for documentation, reports, and promotional materials of the ICO, DOST-PUP PYLON and the Polytechnic University of the Philippines, including publication on official websites and social media pages.",
      "If you do not wish to be photographed, please inform the staff on duty."
    ]
  },
  {
    title: "3. Use of Your Email Address",
    body: [
      "Your email address may be used to send you announcements, event invitations, newsletters, opportunities and other updates from the ICO and DOST-PUP PYLON. You may ask to be removed from these mailings at any time by contacting the office."
    ]
  },
  {
    title: "4. House Rules",
    body: [
      "You agree to follow the house rules posted inside the co-working space, to take care of the facilities and equipment, to respect other users and staff, and to check out before leaving. Failure to follow the house rules may result in loss of access to the co-working space."
    ]
  },
  {
    title: "5. Your Rights",
    body: [
      "Under the Data Privacy Act, you have the right to be informed, to access, to correct, to object to, and to request the deletion of your personal information, and to file a complaint with the National Privacy Commission. To exercise these rights, contact the Innovation Commercialization Office."
    ]
  }
];

export default function TermsModal({ isOpen, onClose, onAgree }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden font-[Montserrat]">
          <div className="bg-gradient-to-r from-[#6D0C22] to-[#0E386B] px-5 py-4 flex items-center justify-between">
            <DialogTitle className="text-white font-bold">Terms and Conditions</DialogTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-white/80 hover:text-white text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-4 space-y-4 text-left text-[13px] leading-relaxed text-gray-700">
            <p>
              Please read the following before checking in to the ICO co-working space.
            </p>
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h3 className="font-bold text-[#0E386B] mb-1">{s.title}</h3>
                {s.body.map((p, i) => (
                  <p key={i} className="mb-2">{p}</p>
                ))}
              </section>
            ))}
            <p className="font-semibold">
              By checking the box and clicking "I Agree", you confirm that you have read and
              understood these Terms and Conditions and freely give your consent to the above.
            </p>
          </div>

          <div className="border-t px-5 py-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onAgree}
              className="flex-1 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-[#6D0C22] to-[#0E386B] hover:opacity-90"
            >
              I Agree
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
