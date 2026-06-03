import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginRequired from "./profile/LoginRequired";
import {
  AUTH_CHANGE_EVENT,
  SESSION_EXPIRED_MESSAGE,
  clearExpiredAuth,
  isAuthenticated,
} from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [authState, setAuthState] = useState(() => {
    const sessionExpired = clearExpiredAuth();

    return {
      hasSession: !sessionExpired && isAuthenticated(),
      sessionExpired,
    };
  });

  useEffect(() => {
    const syncAuthState = () => {
      const sessionExpired = clearExpiredAuth();

      setAuthState({
        hasSession: !sessionExpired && isAuthenticated(),
        sessionExpired,
      });
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    };
  }, [location.pathname, location.search]);

  if (!authState.hasSession) {
    return (
      <LoginRequired
        from={location}
        description={
          authState.sessionExpired
            ? SESSION_EXPIRED_MESSAGE
            : "Masuk dulu untuk mengakses halaman ini."
        }
        loginMessage={
          authState.sessionExpired ? SESSION_EXPIRED_MESSAGE : "Please login first"
        }
      />
    );
  }

  return children;
}
