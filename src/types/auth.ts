export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  message: string;
}

export interface AuthApiError {
  message: string;
  status?: number;
}

export interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (payload: RegisterRequest) => Promise<void>;
}
