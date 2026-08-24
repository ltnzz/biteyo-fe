import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginRequired from "./profile/LoginRequired";
import {
  AUTH_CHANGE_EVENT,
  SESSION_EXPIRED_MESSAGE,
  isAuthenticated,
} from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  // Sesi dipegang cookie httpOnly; FE hanya melihat profil user
  // yang tersimpan lokal sebagai indikator login.
  const [hasSession, setHasSession] = useState(() => isAuthenticated());

  useEffect(() => {
    const syncAuthState = () => {
      setHasSession(isAuthenticated());
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    };
  }, [location.pathname, location.search]);

  if (!hasSession) {
    return (
      <LoginRequired
        from={location}
        description={SESSION_EXPIRED_MESSAGE}
        loginMessage="Please login first"
      />
    );
  }

  return children;
}
