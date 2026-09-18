import { useEffect, useState } from "react";
import { AUTH_CHANGE_EVENT, getStoredUser } from "../utils/auth";

export function useCurrentUser() {
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const sync = () => setUser(getStoredUser());

    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, hasSession: Boolean(user) };
}

export default useCurrentUser;
