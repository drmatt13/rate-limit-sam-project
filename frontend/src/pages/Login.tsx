import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import { z } from "zod";

// context
import SessionContext from "../context/SessionContext";
import ModalContext from "../context/ModalContext";

const poolData = {
  UserPoolId: import.meta.env.VITE_UserPoolId as string,
  ClientId: import.meta.env.VITE_UserPoolClientId as string,
};

const userPool = new CognitoUserPool(poolData);

const valididateEmail = z.string().email();

const Login = () => {
  const [email, setFormInputEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setSession, setEmail } = useContext(SessionContext);
  const { setModal } = useContext(ModalContext);

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      valididateEmail.parse(email);
    } catch (error: unknown) {
      alert("Please enter a valid email address");
      return;
    }
    setLoading(true);

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        setEmail(email);
        setSession(session);
      },
      onFailure: (err) => {
        alert(err.message || JSON.stringify(err));
        setLoading(false);
      },
    });
  };

  return (
    <>
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold font-mono mb-4">Login</h1>
        <form
          onSubmit={loginUser}
          className="bg-gray-800/60 rounded-md backdrop-blur flex flex-col items-center p-5 text-black"
        >
          <input
            type="email"
            className="bg-white/80 w-52 px-2.5 py-2 rounded !outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setFormInputEmail(e.target.value)}
            disabled={loading}
            required={true}
            name="email"
            autoComplete="email"
          />
          <input
            type="password"
            className="mt-3 bg-white/80 w-52 px-2.5 py-2 rounded !outline-none"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required={true}
            name="password"
            autoComplete="current-password"
          />
          <input
            type="submit"
            className={`${
              loading || !email || !password
                ? "bg-gray-500 cursor-not-allowed border-black/20 text-white/60"
                : "bg-emerald-500 sepia-[0.4] hover:brightness-110 cursor-pointer text-white"
            } w-52 mt-3 px-2.5 py-2 rounded transition-colors ease-out`}
            disabled={loading}
            value="Login"
          />
        </form>
        <div
          className={`${
            loading && "pointer-events-none"
          } my-2 underline text-blue-400 hover:text-sky-300  visited:hover:text-purple-300 cursor-pointer`}
          onClick={() => setModal("forgotPassword")}
        >
          forgot your password?
        </div>
        <div>
          not a user?{" "}
          <Link
            className={`${
              loading && "pointer-events-none"
            } underline text-blue-400 hover:text-sky-300 visited:text-purple-400 visited:hover:text-purple-300`}
            to="/register"
          >
            register now
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;
