import { Navigate, useLocation } from "react-router-dom";
import {
  SESSION_EXPIRED_MESSAGE,
  clearExpiredAuth,
  isAuthenticated,
} from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const sessionExpired = clearExpiredAuth();
  const hasSession = !sessionExpired && isAuthenticated();

  if (!hasSession) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: sessionExpired ? SESSION_EXPIRED_MESSAGE : "Please login first",
        }}
      />
    );
  }

  return children;
}
