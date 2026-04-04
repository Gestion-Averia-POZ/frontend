import { createContext, useContext, useState } from "react";
import { MOCK_USERS, type UserRole } from "../constants";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => AuthUser | null;
  logout: () => void;
}

// ─────────────────────────────────────────────
// CONTEXTO
// ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─────────────────────────────────────────────
// PROVIDER
// Envuelve la app y expone user, login y logout
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Busca las credenciales en MOCK_USERS.
  // Devuelve el usuario si las credenciales son correctas, null si no.
  // Cuando el backend esté listo, reemplaza esta lógica
  // por una llamada a la API: POST /auth/login
  function login(email: string, password: string): AuthUser | null {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!found) return null;

    const authUser: AuthUser = {
      email: found.email,
      name: found.name,
      role: found.role,
    };

    setUser(authUser);
    return authUser;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOK — useAuth
// Forma de consumir el contexto en cualquier
// componente: const { user, login, logout } = useAuth()
// ─────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
