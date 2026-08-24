const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://fitnessapp-zyg6.onrender.com";

interface FetchOptions extends RequestInit {
  data?: any;
}

export async function apiClient(endpoint: string, { data, headers: customHeaders, ...customConfig }: FetchOptions = {}) {
  const config: RequestInit = {
    method: data ? "POST" : "GET",
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Required to send and receive HTTP-only cookies
    headers: {
      "Content-Type": data ? "application/json" : "",
      ...customHeaders,
    },
    ...customConfig,
  };

  // Remove content-type if undefined (e.g. for GET requests)
  if ((config.headers as Record<string, string>)["Content-Type"] === "") {
      delete (config.headers as Record<string, string>)["Content-Type"];
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.ok) {
    // If it's a 204 No Content, don't parse JSON
    if (response.status === 204) {
      return null;
    }
    const result = await response.json().catch(() => null);
    return result;
  } else {
    const errorResult = await response.json().catch(() => null);
    const errorMessage = errorResult?.message || response.statusText;
    throw new Error(errorMessage);
  }
}
