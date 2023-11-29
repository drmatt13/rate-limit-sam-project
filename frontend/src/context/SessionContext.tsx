import { createContext } from "react";
import { CognitoUserSession } from "amazon-cognito-identity-js";

import SessionData from "../types/SessionData";

interface ContextInterface {
  session: CognitoUserSession | null;
  setSession: React.Dispatch<React.SetStateAction<CognitoUserSession | null>>;
  logout: () => void;
  sessionData: SessionData;
  setSessionData: React.Dispatch<React.SetStateAction<SessionData>>;
}

const Context = createContext<ContextInterface>({
  session: null,
  setSession: () => {},
  logout: () => {},
  sessionData: {},
  setSessionData: () => {},
});

export default Context;
