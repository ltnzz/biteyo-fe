export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://biteyo-be.vercel.app";

export const parseApiError = async (response, fallback) => {
  const data = await response.json().catch(() => null);

  if (data?.message) return data.message;
  if (Array.isArray(data?.errors)) {
    return data.errors.map((error) => error.message).filter(Boolean).join(", ");
  }
  if (Array.isArray(data?.issues)) {
    return data.issues.map((issue) => issue.message).filter(Boolean).join(", ");
  }

  return fallback;
};

export const postJson = async (
  path,
  payload,
  { fallback = "Request failed", headers = {} } = {},
) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      ...headers,
      ...(payload ? { "Content-Type": "application/json" } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, fallback));
  }

  return response.json().catch(() => null);
};

export const normalizeAuthResponse = (data) => {
  const payload = data?.data || data || {};
  const fallbackUser =
    payload.username || payload.email || payload.name ? payload : null;

  return {
    redirectUrl:
      payload.redirectUrl ||
      payload.redirect_url ||
      payload.authorizationUrl ||
      payload.authUrl ||
      payload.url ||
      "",
    token: payload.token || payload.accessToken || payload.jwt || "",
    user: payload.user || payload.profile || payload.account || fallbackUser,
  };
};
