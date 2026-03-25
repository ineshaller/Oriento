const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type AuthResponse = {
  message: string;
  token: string;
};

async function handleResponse(res: Response) {
  let data;
  
  try {
    data = await res.json();
  } catch (e) {
    // Si le serveur répond mais que ce n'est pas du JSON (ex: erreur 502, page HTML)
    throw new Error("Le serveur rencontre un problème technique.");
  }

  if (!res.ok) {
    // Renvoie le message précis du serveur (ex: "Email déjà utilisé")
    throw new Error(data.message || "Une erreur inconnue est survenue.");
  }

  return data;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(res);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(res);
}