import { FormEvent, useCallback, useState } from "react";

const DeleteAccountModal = () => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");

  const changePassword = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // setModal("changePassword");
  }, []);

  return (
    <>
      <div className="w-full flex flex-col items-center bg-gradient-to-br from-gray-900 to-rose-900/75 backdrop-blur-3xl">
        <div className="h-12 /text-white/50"></div>
        <div>
          <form onSubmit={changePassword}>
            <div className="flex flex-col items-center">
              <div className="mb-4">
                type:{" "}
                <span className="underline underline-offset-4">
                  delete my account
                </span>
              </div>
              <input
                type="text"
                className="mb-3 text-red-500 px-2.5 py-2 rounded !outline-none w-52 bg-white/95"
                placeholder="delete my account"
                onChange={(e) => setText(e.target.value)}
              />
              <input
                type="password"
                className="mb-3 text-black px-2.5 py-2 rounded !outline-none w-52 bg-white/95"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="submit"
                className={`${
                  loading || text !== "delete my account" || password.length < 1
                    ? "bg-gray-500 cursor-not-allowed border-black/20 text-white/60"
                    : "bg-red-500/80 hover:bg-red-500 border-red-600/20 cursor-pointer"
                } border mb-8 w-52 py-2 rounded transition-colors ease-out`}
                value={"Delete Account"}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DeleteAccountModal;
