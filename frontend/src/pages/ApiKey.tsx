import { useState, useCallback, useContext, useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import Clipboard from "clipboard";
import axios from "axios";

// context
import SessionContext from "../context/SessionContext";

// types
import {
  GetAccountApiKeyResponse,
  GetAccountCreditCardResponse,
} from "../../../sam-app/lambda/types/responses";

const API_ENDPOINT = import.meta.env.VITE_ApiGatewayEndpoint as string;

function ApiKey() {
  const { session, sessionData, setSessionData } = useContext(SessionContext);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const timoutRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<
    | GetAccountCreditCardResponse["error"]["name"]
    | GetAccountApiKeyResponse["error"]["name"]
    | null
  >(null);

  const getUsersCardData = useCallback(async (): Promise<
    typeof sessionData.cardStatus
  > => {
    try {
      const response = await axios.get<GetAccountCreditCardResponse>(
        `${API_ENDPOINT}/get-account-credit-card`,
        {
          headers: {
            Authorization: session?.getIdToken().getJwtToken(),
          },
        }
      );
      if (response.data.error) throw new Error(response.data.error.name);
      setSessionData((current) => ({
        ...current,
        cardStatus: response.data.tableItem.valid.B ? "valid" : "invalid",
      }));
    } catch (error) {
      alert(
        ((error as Error)
          .message as GetAccountCreditCardResponse["error"]["name"]) ===
          "ItemNotFound"
          ? "Credit card not found in database for this account."
          : ((error as Error)
              .message as GetAccountCreditCardResponse["error"]["name"])
      );
      setError(
        (error as Error)
          .message as GetAccountCreditCardResponse["error"]["name"]
      );
      setSessionData((current) => ({
        ...current,
        cardStatus: "no card",
      }));
    }
    return "no card";
  }, [session, sessionData, setSessionData]);

  const upgradeTier = useCallback(async () => {
    setLoading(true);
    let cardStatus = sessionData.cardStatus;
    if (!sessionData.cardStatus) {
      cardStatus = await getUsersCardData();
    }
    if (cardStatus === "no card") {
      alert(
        "To upgrade your account, you first need to add a credit card. Visit the billing page to add a credit card."
      );
      return setLoading(false);
    }
    const upgradeChoice = confirm(
      "Pay $20 to upgrade your account for 1 month? This will allow you to make 1000 api requests per day."
    );
    if (!upgradeChoice) return setLoading(false);
    const reccuringPaymentChoice = confirm(
      "Would you like to enable automatic monthly payments, ensuring uninterrupted access to your account features? Selecting 'Ok' will charge your payment method each month."
    );
    if (cardStatus === "invalid") {
      alert("Your credit card is invalid.");
    } else if (cardStatus === "valid") {
      const payment = {
        date: new Date().toISOString(),
        amount: 5,
      };
      setSessionData((current) => ({
        ...current,
        recurringBilling: reccuringPaymentChoice,
        tier: "paid",
        payments: sessionData.payments
          ? [...sessionData.payments, payment]
          : [payment],
      }));
    }
    setLoading(false);
  }, [
    getUsersCardData,
    sessionData.cardStatus,
    sessionData.payments,
    setSessionData,
  ]);

  const randomizeKey = useCallback(async () => {
    // setLoading(true);
    // const option = confirm(
    //   "Are you certain you want to randomize your API key? Keep in mind that changing your API key means you'll need to update all applications using it to ensure they continue working properly."
    // );
    // if (option) {
    //   setSessionData((current) => ({
    //     ...current,
    //     key: generateRandomString(),
    //   }));
    // }
    // simluateApiCall(finishLoading, 1500);
  }, []);

  const getUsersApiKeyData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<GetAccountApiKeyResponse>(
        `${API_ENDPOINT}/get-account-api-key`,
        {
          headers: {
            Authorization: session?.getIdToken().getJwtToken(),
          },
        }
      );
      console.log(response.data);
      if (response.data.error) throw new Error(response.data.error.name);
      setSessionData((current) => ({
        ...current,
        key: response.data.tableItem.api_key.S,
        tier: response.data.tableItem.tier.S as "free" | "paid",
      }));
    } catch (error) {
      console.log(
        (error as Error).message as GetAccountApiKeyResponse["error"]["name"]
      );
      setError(
        (error as Error).message as GetAccountApiKeyResponse["error"]["name"]
      );
    }
    setLoading(false);
  }, [session, setSessionData]);

  // get users api key data if it doesn't exist
  useEffect(() => {
    if (sessionData.key || sessionData.tier) return;
    getUsersApiKeyData();
  }, [getUsersApiKeyData, sessionData.key, sessionData.tier]);

  // clipboard
  useEffect(() => {
    if (!btnRef.current) return;

    const clipboard = new Clipboard(btnRef.current, {
      text: () => sessionData.key || "",
    });

    clipboard.on("success", () => {
      setCopied(true);

      if (timoutRef.current) clearTimeout(timoutRef.current);

      const removeCopied = () => {
        setCopied(false);
        window.removeEventListener("mousemove", removeCopied);
      };

      window.addEventListener("mousemove", removeCopied);

      timoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 1000);
    });

    clipboard.on("error", () => {
      alert("Failed to copy Api Key to clipboard");
    });

    // Cleanup when the component unmounts
    return () => {
      clipboard.destroy();
    };
  }, [sessionData.key]);

  if (error && error !== "ItemNotFound")
    return <Navigate to="/" replace={true} />;

  return (
    <>
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold font-mono">ApiKey</h1>

          {/* {sessionData.tier && sessionData.key ? ( */}
          <div className="px-5 relative flex flex-col items-left w-96 max-w-[90vw] py-4 mt-3 bg-slate-800/60 rounded">
            <div className={!loading ? "opacity-100" : "opacity-0"}>
              <div className="text-lg">
                <span className="text-yellow-600 mr-2.5">tier:</span>
                <span
                  className={`${
                    sessionData.tier === "paid"
                      ? "text-green-500/80"
                      : "text-red-500"
                  }`}
                >
                  {sessionData.tier}
                </span>
              </div>
              <div className="flex">
                <div className="text-lg truncate text-green-500/80 mr-2.5">
                  <span className="text-yellow-600 mr-2.5">key:</span>
                  {sessionData.key}
                </div>
                <div className="relative text-xl h-full">
                  <i
                    className="fa-regular fa-copy cursor-pointer text-purple-500 hover:text-purple-400 transition-colors ease-out"
                    ref={btnRef}
                  />
                  <div
                    className={`${
                      copied ? "opacity-100" : "opacity-0"
                    } absolute bottom-0 translate-y-[125%] -translate-x-[33%] mt-2 px-2 py-1 bg-black/80 text-white text-sm rounded`}
                  >
                    Copied!
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`${
                loading ? "opacity-100" : "opacity-0"
              } absolute top-0 left-0 h-full w-full flex justify-center items-center pointer-events-none`}
            >
              loading...
            </div>
          </div>

          <button
            className={`${
              loading ||
              sessionData.tier === "paid" ||
              !sessionData.tier ||
              !sessionData.key
                ? "bg-gray-500 cursor-not-allowed border-black/20 text-white/60"
                : "bg-emerald-500 sepia-[0.4] hover:brightness-110 cursor-pointer"
            } w-52 mt-3 py-2 rounded transition-colors ease-out duration-75`}
            onClick={upgradeTier}
            disabled={
              loading ||
              sessionData.tier === "paid" ||
              !sessionData.tier ||
              !sessionData.key
            }
          >
            Upgrade Tier
          </button>
          <button
            className={`${
              loading || !sessionData.tier || !sessionData.key
                ? "bg-gray-500 cursor-not-allowed border-black/20 text-white/60"
                : "bg-red-500/80 hover:bg-red-500 cursor-pointer"
            } w-52 mt-2.5 py-2 rounded transition-colors ease-out duration-75`}
            onClick={randomizeKey}
            disabled={loading || !sessionData.tier || !sessionData.key}
          >
            Randomize Key
          </button>
          <Link
            className={`${
              loading && "pointer-events-none"
            } mt-2 text-blue-400 hover:text-sky-300 visited:text-purple-500 visited:hover:text-purple-400`}
            to="/"
            replace={true}
          >
            return /home
          </Link>
        </div>
      </div>
    </>
  );
}

export default ApiKey;
