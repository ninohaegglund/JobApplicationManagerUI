/// <reference types="vite/client" />

import { apiRequest, ApiError } from "./httpClient";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";

const IDENTITY_API_BASE_URL =
  import.meta.env.VITE_IDENTITY_API_BASE_URL ?? "https://localhost:7011";

function extractToken(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    throw new ApiError("Login response does not include a token.", 500);
  }

  const token =
    ("token" in payload && typeof payload.token === "string" && payload.token) ||
    ("accessToken" in payload &&
      typeof payload.accessToken === "string" &&
      payload.accessToken) ||
    ("jwt" in payload && typeof payload.jwt === "string" && payload.jwt);

  if (!token) {
    throw new ApiError("Login response does not include a token.", 500);
  }

  return token;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await apiRequest<unknown>(IDENTITY_API_BASE_URL, "/api/auth/login", {
    method: "POST",
    body: payload,
  });

  return { token: extractToken(response) };
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiRequest<unknown>(IDENTITY_API_BASE_URL, "/api/auth/register", {
    method: "POST",
    body: payload,
  });

  const message =
    response &&
    typeof response === "object" &&
    "message" in response &&
    typeof response.message === "string"
      ? response.message
      : "Registration successful.";

  return { message };
}
