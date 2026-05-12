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
