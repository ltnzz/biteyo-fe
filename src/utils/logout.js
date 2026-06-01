import { postJson } from "./api";
import { clearAuth, getAuthHeaders } from "./auth";
import { unregisterFcmToken } from "./notifications";

export const logoutUser = async () => {
  let warning = null;

  try {
    await unregisterFcmToken();
  } catch (err) {
    console.warn("Failed to unregister FCM token during logout:", err);
  }

  try {
    await postJson("/api/auth/logout", null, {
      fallback: "Gagal logout. Silakan coba lagi.",
      headers: getAuthHeaders(),
    });
  } catch (err) {
    warning = err;
    console.warn("Logout API request failed:", err);
  }

  clearAuth();

  return { warning };
};
