import { ReactNode, useState, useCallback, useEffect } from "react";

// context
import ModalContext from "../context/ModalContext";

// modals
import DeleteAccountModal from "./DeleteAccountModal";
import ChangePasswordModal from "./ChangePasswordModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

interface ModalLayoutProps {
  children: ReactNode;
}

const ModalLayout = ({ children }: ModalLayoutProps) => {
  const [modal, setModal] = useState("");
  const [closing, setClosing] = useState(false);

  const closeModal = useCallback(() => {
    setClosing(true);
  }, []);

  useEffect(() => {
    if (closing) {
      setTimeout(() => {
        setModal("");
        setClosing(false);
      }, 100);
    }
  }, [closing]);

  return (
    <>
      <ModalContext.Provider value={{ setModal }}>
        <div className="relative">
          <div
            onClick={closeModal}
            className={`${
              modal && !closing
                ? "opacity-100 ease-in"
                : "opacity-0 pointer-events-none ease-out"
            } bg-black/10 absolute top-0 left-0 h-full w-full flex justify-center items-center transition-opacity duration-100 z-10 overflow-hidden backdrop-blur-sm`}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative w-96 max-w-[95vw] rounded-lg shadow-xl border border-gray-800 overflow-hidden`}
            >
              <div
                className="absolute right-2 top-2 rounded-full bg-white/75 h-6 w-6 flex justify-center items-center hover:bg-red-400 cursor-pointer transition-colors z-10"
                onClick={closeModal}
              >
                <i className="fas fa-times text-xs text-black" />
              </div>
              <div>
                {modal === "deleteAccount" && <DeleteAccountModal />}
                {modal === "changePassword" && <ChangePasswordModal />}
                {modal === "forgotPassword" && <ForgotPasswordModal />}
              </div>
            </div>
          </div>
          <div>{children}</div>
        </div>
      </ModalContext.Provider>
    </>
  );
};

export default ModalLayout;
