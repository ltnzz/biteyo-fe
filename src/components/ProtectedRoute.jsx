import { useLocation } from "react-router-dom";
import LoginRequired from "./profile/LoginRequired";
import { isAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const hasSession = isAuthenticated();

  if (!hasSession) {
    return <LoginRequired from={location} />;
  }

  return children;
}
