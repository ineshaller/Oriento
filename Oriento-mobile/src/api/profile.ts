const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type AuthResponse = {
  message: string;
  token: string;
};

async function handleResponse(res: Response) {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur serveur");
  }

  return data;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(res);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(res);
}