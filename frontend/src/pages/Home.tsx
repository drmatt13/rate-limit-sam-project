import { useContext, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// context
import SessionContext from "../context/SessionContext";

const API_ENDPOINT = import.meta.env.VITE_ApiGatewayEndpoint as string;

function Home() {
  const { session, logout } = useContext(SessionContext);

  const testCallback = useCallback(async () => {
    const idToken = session?.getIdToken().getJwtToken();
    try {
      const response = await axios.get(`${API_ENDPOINT}/get-account-api-data`, {
        headers: {
          Authorization: idToken,
        },
      });
      console.log(response);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      // testCallback();
    }
  }, [session, testCallback]);

  return (
    <>
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="w-52 flex flex-col items-center">
          <h1 className="text-3xl font-bold font-mono">Home</h1>
          <div className="flex flex-col items-center w-full py-4 mt-3 mb-3 bg-slate-800/60 rounded">
            <div className="flex flex-col">
              <Link
                className="text-blue-400 hover:text-sky-300 visited:text-purple-500 visited:hover:text-purple-400"
                to="/account"
                replace={true}
              >
                /account
              </Link>
              <Link
                to="/billing"
                replace={true}
                className="text-blue-400 hover:text-sky-300 visited:text-purple-500 visited:hover:text-purple-400"
              >
                /billing
              </Link>
              <Link
                to="/api-key"
                replace={true}
                className="text-blue-400 hover:text-sky-300 visited:text-purple-500 visited:hover:text-purple-400"
              >
                /api-key
              </Link>
            </div>
          </div>
          <button
            className="w-full py-2 bg-red-500/80 hover:bg-red-500 cursor-pointer rounded transition-colors ease-out duration-75"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Home;
