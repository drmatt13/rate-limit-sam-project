import { useState, useEffect, useCallback } from "react";
import {
  CognitoUser,
  CognitoUserSession,
  CognitoUserPool,
  CognitoRefreshToken,
} from "amazon-cognito-identity-js";
import Cookies from "js-cookie";

import SessionData from "../types/SessionData";

const poolData = {
  UserPoolId: import.meta.env.VITE_UserPoolId as string,
  ClientId: import.meta.env.VITE_UserPoolClientId as string,
};

const userPool = new CognitoUserPool(poolData);

const UseSession = () => {
  const [session, setSession] = useState<CognitoUserSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData>({});
  const [email, setEmail] = useState("");

  const refreshSession = useCallback(() => {
    console.log("refreshing session");
    const refreshToken = Cookies.get("refreshToken");
    const lastAuthUser = Cookies.get("lastAuthUser");

    if (!refreshToken || !lastAuthUser) {
      return setLoadingSession(false);
    }
    const userData = {
      Username: lastAuthUser,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.refreshSession(
      new CognitoRefreshToken({ RefreshToken: refreshToken }),
      (error, session) => {
        setLoadingSession(false);
        if (error) {
          alert(error);
          return;
        }
        setSession(session);
      }
    );
  }, []);

  useEffect(() => {
    if (initialLoad) {
      return;
    }
    if (session) {
      Cookies.set("refreshToken", session.getRefreshToken().getToken(), {
        expires: 7,
        sameSite: "lax",
        secure: false,
        path: "/",
      });
      Cookies.set(
        "lastAuthUser",
        session.getIdToken().payload["cognito:username"],
        { expires: 7, sameSite: "lax", secure: false, path: "/" }
      );
    } else {
      Cookies.remove("refreshToken");
      Cookies.remove("lastAuthUser");
    }
  }, [initialLoad, session]);

  useEffect(() => {
    refreshSession();
    setInitialLoad(false);
  }, [refreshSession]);

  const logout = useCallback(() => {
    setSessionData({});
    setSession(null);
    Cookies.remove("refreshToken");
    Cookies.remove("lastAuthUser");
  }, []);

  return {
    session,
    loadingSession,
    setSession,
    logout,
    sessionData,
    setSessionData,
    email,
    setEmail,
  };
};

export default UseSession;
