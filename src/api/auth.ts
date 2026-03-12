// src/api/auth.ts
const API_URL = 'http://localhost:3001/api/auth';
const PROFILE_URL = 'http://localhost:3001/api/profile';

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function register(email: string, password: string) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

// ── Profil ────────────────────────────────────────────────────────────────────

// Sauvegarde tout le profil en base (appelé après chaque modification)
export async function saveProfile(profileData: object): Promise<void> {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  await fetch(PROFILE_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
}

// Charge le profil depuis la base (appelé au login)
export async function loadProfile(): Promise<object | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  try {
    const res = await fetch(PROFILE_URL, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}