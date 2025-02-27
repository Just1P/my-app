export class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const API_KEY = process.env.NEXT_PUBLIC_RIOT_API_KEY;

  // Construire les paramètres de requête
  const queryParams = new URLSearchParams(params);
  queryParams.append("api_key", API_KEY || "");

  try {
    const response = await fetch(`${endpoint}?${queryParams.toString()}`);

    if (!response.ok) {
      throw new APIError(`API error: ${response.status}`, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
