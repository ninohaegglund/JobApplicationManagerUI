import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthUser,
  AuthContextValue,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";
import {
  AUTH_TOKEN_CLEARED_EVENT,
  clearStoredToken,
  getStoredToken,
  storeToken,
} from "../services/httpClient";
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from "../services/authService";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    function syncTokenFromStorage() {
      const nextToken = getStoredToken();
      setToken(nextToken);

      if (!nextToken) {
        setUser(null);
      }
    }

    window.addEventListener("storage", syncTokenFromStorage);
    window.addEventListener(AUTH_TOKEN_CLEARED_EVENT, syncTokenFromStorage);

    return () => {
      window.removeEventListener("storage", syncTokenFromStorage);
      window.removeEventListener(AUTH_TOKEN_CLEARED_EVENT, syncTokenFromStorage);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const currentUser = await getCurrentUser();

        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await loginRequest(payload);
    setToken(response.token);
    storeToken(response.token);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    await registerRequest(payload);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearStoredToken();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      user,
      login,
      logout,
      register,
    }),
    [login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
