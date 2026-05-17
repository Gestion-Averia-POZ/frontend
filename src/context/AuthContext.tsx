import { createContext, useContext, useEffect, useState } from "react";
import { type UserRole } from "../constants";
import { authService, type BackendRole } from "../services/auth.service";
import { clearToken, saveToken } from "../services/api";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  lastname: string;
  role: UserRole;
  companyId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const USER_KEY = "urbis_user";

function toFrontendRole(role: BackendRole): UserRole {
  return role.toLowerCase() as UserRole;
}

// ─────────────────────────────────────────────
// CONTEXTO
// ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // true mientras se restaura la sesión desde localStorage al montar
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored) as AuthUser);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string): Promise<AuthUser> {
    const res = await authService.login(email, password);

    const authUser: AuthUser = {
      id: res.data.user.id,
      email: res.data.user.email,
      name: res.data.user.name,
      lastname: res.data.user.lastname,
      role: toFrontendRole(res.data.user.role),
      ...(res.data.user.company?.id && { companyId: res.data.user.company.id }),
    };

    saveToken(res.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  }

  function logout() {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOK — useAuth
// ─────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
