import { FormEvent, useCallback, useState } from "react";
import { z } from "zod";

const valididateEmail = z.string().email();

const ForgotPasswordModal = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const resetEmail = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      valididateEmail.parse(email);
    } catch (error) {
      alert("Please enter a valid email address");
      return;
    }

    setLoading(true);

    setLoading(false);

    // setModal("changePassword");
  }, []);

  return (
    <>
      <div className="w-full flex flex-col items-center bg-gradient-to-br from-gray-900 to-blue-900/75 backdrop-blur-3xl">
        <div className="h-12"></div>
        <div>
          <form onSubmit={resetEmail}>
            <div className="flex flex-col items-center">
              <input
                type="email"
                className="mb-3 px-2.5 py-2 rounded !outline-none w-52 bg-white/95 text-black"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="submit"
                className={`${
                  loading || !email
                    ? "bg-gray-500 cursor-not-allowed border-black/20 text-white/60"
                    : "bg-blue-500/80 hover:bg-blue-500 border-blue-600/20 cursor-pointer"
                } border mb-8 w-52 py-2 rounded transition-colors ease-out`}
                value={"Reset Password"}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordModal;
