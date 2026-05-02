const TOKEN_KEY = "trackit_auth_token"
const USER_KEY = "trackit_auth_user"

type StoredUser = {
  id: string
<<<<<<< HEAD
  role: "student" | "teacher"
=======
  role: "student" | "teacher" | "admin" | "maintainer"
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
  email: string
}

function isBrowser() {
  return typeof window !== "undefined"
}

export function getAuthToken() {
  if (!isBrowser()) return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setAuthSession(token: string, user: StoredUser) {
  if (!isBrowser()) return
  window.localStorage.setItem(TOKEN_KEY, token)
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
  if (!isBrowser()) return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
}

export function getStoredUser(): StoredUser | null {
  if (!isBrowser()) return null

  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    clearAuthSession()
    return null
  }
}
