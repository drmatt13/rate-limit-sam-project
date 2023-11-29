import { useState, useCallback, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// context
import SessionContext from "../context/SessionContext";

// types
import { GetAccountCreditCardResponse } from "../../../sam-app/lambda/types/responses";

const API_ENDPOINT = import.meta.env.VITE_ApiGatewayEndpoint as string;

function Billing() {
  const { session, sessionData, setSessionData } = useContext(SessionContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<
    GetAccountCreditCardResponse["error"]["name"] | null
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

  const initialPageLoad = useCallback(async () => {
    setLoading(true);
    await getUsersCardData();
    setLoading(false);
  }, [getUsersCardData]);

  useEffect(() => {
    if (!sessionData.cardStatus) {
      initialPageLoad();
    }
  }, [initialPageLoad, sessionData.cardStatus]);

  const addCard = useCallback(async () => {
    setLoading(true);
    const option = confirm("Add a credit card to your account?");
    if (option) setSessionData({ ...sessionData, cardStatus: "valid" });
    setLoading(false);
  }, [sessionData, setSessionData]);

  const validateCard = useCallback(async () => {
    setLoading(true);
    const option = confirm("Validate your credit card?");
    if (option) setSessionData({ ...sessionData, cardStatus: "valid" });
    setLoading(false);
  }, [sessionData, setSessionData]);

  const invalidateCard = useCallback(async () => {
    setLoading(true);
    const option = confirm(
      "Invalidate your credit card? Transactions in the backend will be declined."
    );
    if (option) setSessionData({ ...sessionData, cardStatus: "invalid" });
    setLoading(false);
  }, [sessionData, setSessionData]);

  const enableReccuringBilling = useCallback(async () => {
    setLoading(true);
    const option = confirm("Enable recurring billing?");
    if (option) setSessionData({ ...sessionData, recurringBilling: true });
    setLoading(false);
  }, [sessionData, setSessionData]);

  const disableReccuringBilling = useCallback(async () => {
    setLoading(true);
    const option = confirm("Disable recurring billing?");
    if (option) setSessionData({ ...sessionData, recurringBilling: false });
    setLoading(false);
  }, [sessionData, setSessionData]);

  const deleteCard = useCallback(async () => {
    setLoading(true);
    const option = confirm("Delete credit card from your account?");
    if (option)
      setSessionData({
        ...sessionData,
        cardStatus: "no card",
        recurringBilling: false,
      });
    setLoading(false);
  }, [sessionData, setSessionData]);

  return (
    <>
      <div className="w-full h-screen flex flex-col items-center justify-start">
        <div className="w-96 flex flex-col items-center">
          <h1 className="text-3xl font-bold font-mono">Billing</h1>
          <div
            className={`${
              loading && "min-h-[7.5rem]"
            } relative flex flex-col items-start w-full mb-3 px-5 py-4 mt-3 bg-slate-800/60 rounded`}
          >
            <div className={`${loading ? "opacity-0" : "opacity-100"} w-full`}>
              <div>
                card status:
                <span className="mx-2.5">
                  {sessionData.cardStatus === "valid" ? (
                    <span className="text-green-400">valid</span>
                  ) : sessionData.cardStatus === "invalid" ? (
                    <span className="text-yellow-400">invalid</span>
                  ) : (
                    <span className="text-red-400">
                      no card associated with account
                    </span>
                  )}
                </span>
              </div>
              {sessionData.payments?.length &&
              sessionData.cardStatus !== "no card" ? (
                <div>
                  <div>
                    recurring billing:
                    <span className="mx-2">
                      {sessionData.recurringBilling ? (
                        <span className="text-green-400">enabled</span>
                      ) : (
                        <span className="text-yellow-400">disabled</span>
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <></>
              )}
              {sessionData.payments?.length && (
                <div className="flex flex-col">
                  <div className="w-full flex justify-center mt-5 mb-2.5">
                    <div className="underline">billing history:</div>
                  </div>
                  <div>month</div>
                </div>
              )}
            </div>
            <div
              className={`${
                loading ? "opacity-100" : "opacity-0"
              } absolute top-0 left-0 h-full w-full flex justify-center items-center pointer-events-none`}
            >
              loading...
            </div>
          </div>
          {!sessionData.cardStatus ? (
            <></>
          ) : sessionData.cardStatus === "no card" ? (
            <>
              <button
                className={`${
                  loading
                    ? "bg-gray-500 cursor-not-allowed border-black/20 text-white/60"
                    : "bg-emerald-500 border-emerald-600/20 sepia-[0.4] hover:brightness-110 cursor-pointer"
                } border w-52 py-2 rounded transition-colors ease-out mb-2`}
                onClick={addCard}
                disabled={loading}
              >
                Add Credit Card
              </button>
            </>
          ) : (
            <>
              <button
                className={`${
                  loading
                    ? "bg-gray-500 cursor-not-allowed border-black/20 text-white/60"
                    : `${
                        sessionData.cardStatus === "valid"
                          ? "bg-yellow-500/80 hover:bg-yellow-500 border-yellow-600/20"
                          : "bg-emerald-500 sepia-[0.4] hover:brightness-110 border-emerald-600/20"
                      } cursor-pointer`
                } border w-52 py-2 mb-3 rounded transition-colors ease-out duration-75`}
                onClick={
                  sessionData.cardStatus === "valid"
                    ? invalidateCard
                    : validateCard
                }
                disabled={loading}
              >
                {sessionData.cardStatus === "valid" ? "Invalidate" : "Validate"}{" "}
                Credit Card
              </button>
              {sessionData.tier === "paid" && (
                <button
                  className={`${
                    loading
                      ? "bg-gray-500 cursor-not-allowed border-black/20 text-white/60"
                      : `${
                          sessionData.recurringBilling
                            ? "bg-yellow-500/80 hover:bg-yellow-500 border-yellow-600/20"
                            : "bg-emerald-500 sepia-[0.4] hover:brightness-110 border-emerald-600/20"
                        } cursor-pointer`
                  } border w-52 py-2 mb-2.5 rounded transition-colors ease-out duration-75`}
                  onClick={
                    sessionData.recurringBilling
                      ? disableReccuringBilling
                      : enableReccuringBilling
                  }
                  disabled={loading}
                >
                  {sessionData.recurringBilling ? "Disable" : "Enable"}{" "}
                  Recurring Billing
                </button>
              )}
              <button
                className={`${
                  loading
                    ? "bg-gray-500 cursor-not-allowed border-black/20 text-white/60"
                    : "bg-red-500/80 hover:bg-red-500 border-red-600/20 cursor-pointer"
                } border w-52 py-2 mb-2.5 rounded transition-colors ease-out duration-75`}
                onClick={deleteCard}
              >
                Delete Credit Card
              </button>
            </>
          )}
          <Link
            className={`${
              loading && "pointer-events-none"
            } /mt-2 text-blue-400 hover:text-sky-300 visited:text-purple-500 visited:hover:text-purple-400`}
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

export default Billing;
