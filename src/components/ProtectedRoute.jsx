import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const hasSession = isAuthenticated();

  if (!hasSession) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: "Please login first",
        }}
      />
    );
  }

  return children;
}
