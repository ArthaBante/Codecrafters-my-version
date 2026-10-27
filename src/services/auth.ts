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

export function loginUser(email: string, isGuest: boolean = false): User {
  const cleanEmail = email.trim();
  const userId = isGuest ? "guest-user" : cleanEmail.toLowerCase();
  const user: User = {
    id: userId || "guest-user",
    email: isGuest ? "guest@projectforge.local" : (cleanEmail || "user@projectforge.local"),
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
