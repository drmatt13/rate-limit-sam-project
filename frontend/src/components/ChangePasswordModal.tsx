import { FormEvent, useCallback, useState } from "react";

const ChangePasswordModal = () => {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const changePassword = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // setModal("changePassword");
  }, []);

  return (
    <>
      <div className="w-full flex flex-col items-center bg-gradient-to-br from-yellow-900/50 to-yellow-500/50 backdrop-blur-3xl">
        <div className="h-12 /text-white/50"></div>
        <div>
          <form onSubmit={changePassword}>
            <div className="flex flex-col items-center">
              <input
                type="password"
                className="mb-3 text-black px-2.5 py-2 rounded !outline-none w-52 bg-white/95"
                placeholder="Current Password"
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                className="mb-3 text-black px-2.5 py-2 rounded !outline-none w-52 bg-white/95"
                placeholder="New Password"
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                className="mb-3 text-black px-2.5 py-2 rounded !outline-none w-52 bg-white/95"
                placeholder="Confirm New Password"
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
              <input
                type="submit"
                className={`${
                  loading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmNewPassword
                    ? "brightness-[120%] bg-gray-500 cursor-not-allowed border-black/20 text-gray-100/50"
                    : "bg-yellow-500/[85%] hover:bg-yellow-500 border-yellow-600/20 cursor-pointer"
                } border mb-8 w-52 py-2 rounded transition-colors ease-out`}
                value={"Change Password"}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordModal;
