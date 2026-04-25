/// <reference types="vite/client" />

import { apiRequest, ApiError } from "./httpClient";
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";

const IDENTITY_API_BASE_URL =
  import.meta.env.VITE_IDENTITY_API_BASE_URL ?? "https://localhost:7011";

const IDENTITY_ME_ENDPOINTS = (
  import.meta.env.VITE_IDENTITY_ME_ENDPOINTS ?? "/api/auth/me,/api/auth/profile,/api/users/me"
)
  .split(",")
  .map((value: string) => value.trim())
  .filter((value: string) => value.length > 0);

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

function getStringValue(
  item: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    if (key in item && typeof item[key] === "string" && item[key]) {
      return item[key] as string;
    }
  }

  return null;
}

function normalizeCurrentUser(payload: unknown): AuthUser {
  if (!payload || typeof payload !== "object") {
    throw new ApiError("Unable to load current user profile.", 500);
  }

  const root = payload as Record<string, unknown>;
  const container =
    ("user" in root && root.user && typeof root.user === "object"
      ? (root.user as Record<string, unknown>)
      : null) ||
    ("data" in root && root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : null) ||
    root;

  const id = getStringValue(container, ["id", "Id", "userId", "UserId"]);
  const firstName = getStringValue(container, ["firstName", "FirstName"]);
  const lastName = getStringValue(container, ["lastName", "LastName"]);
  const email = getStringValue(container, ["email", "Email"]);

  if (!id || !firstName || !lastName || !email) {
    throw new ApiError("Current user profile is missing required fields.", 500);
  }

  return { id, firstName, lastName, email };
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

export async function getCurrentUser(): Promise<AuthUser> {
  let lastError: ApiError | null = null;

  for (const endpoint of IDENTITY_ME_ENDPOINTS) {
    try {
      const response = await apiRequest<unknown>(IDENTITY_API_BASE_URL, endpoint, {
        method: "GET",
        requiresAuth: true,
      });

      return normalizeCurrentUser(response);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          lastError = error;
          continue;
        }

        throw error;
      }

      throw error;
    }
  }

  throw (
    lastError ??
    new ApiError("Unable to find current user endpoint. Configure VITE_IDENTITY_ME_ENDPOINTS.", 500)
  );
}
