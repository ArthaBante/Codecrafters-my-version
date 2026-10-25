export interface User {
  id: string;
  email: string;
}

const USER_KEY = "projectforge_current_user";

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function loginUser(email: string): User {
  const cleanEmail = email.trim() || "guest@projectforge.local";
  const user: User = {
    id: cleanEmail === "guest" || cleanEmail.includes("guest") ? "guest-user" : `user-${btoa(cleanEmail).substring(0, 10)}`,
    email: cleanEmail,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error("Failed to log out", err);
  }
}
