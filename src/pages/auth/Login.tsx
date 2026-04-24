import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { LogIn } from "lucide-react";
import { ApiError } from "../../services/httpClient";
import { useAuth } from "../../context/AuthContext";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const locationState = location.state as LocationState | null;
  const redirectTo = locationState?.from?.pathname || "/applications";

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-border rounded-lg p-8 space-y-6">
        <div>
          <h1 className="text-[28px] font-medium mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to continue managing your applications</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-[#fafafa] border border-transparent rounded-lg focus:outline-none focus:border-border"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-60"
            disabled={isLoading}
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-muted-foreground">
          No account yet?{" "}
          <Link to="/register" className="text-foreground hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
