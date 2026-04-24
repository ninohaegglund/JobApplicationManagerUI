import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthContextValue,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";
import {
  clearStoredToken,
  getStoredToken,
  storeToken,
} from "../services/httpClient";
import { login as loginRequest, register as registerRequest } from "../services/authService";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await loginRequest(payload);
    setToken(response.token);
    storeToken(response.token);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    await registerRequest(payload);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    clearStoredToken();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
      register,
    }),
    [login, logout, register, token]
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
