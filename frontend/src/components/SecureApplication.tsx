import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

// context
import SessionContext from "../context/SessionContext";

// hooks
import useSession from "../hooks/useSession";

interface CredentialsLayoutProps {
  children: ReactNode;
}

const SecureApplication = ({ children }: CredentialsLayoutProps) => {
  const location = useLocation();
  const {
    loadingSession,
    logout,
    session,
    setSession,
    sessionData,
    setSessionData,
  } = useSession();

  if (loadingSession) {
    return <></>;
  }

  if (!session && !["/login", "/register"].includes(location.pathname)) {
    return <Navigate to="/login" replace={true} />;
  }

  if (session && ["/login", "/register"].includes(location.pathname)) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <SessionContext.Provider
      value={{ logout, session, setSession, sessionData, setSessionData }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default SecureApplication;
