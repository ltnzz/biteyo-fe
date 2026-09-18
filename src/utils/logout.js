import { postJson } from "./api";
import { clearAuth, getAuthHeaders } from "./auth";

export const logoutUser = async () => {
  let warning = null;

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
