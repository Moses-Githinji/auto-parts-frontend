import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import apiClient from "../../lib/apiClient";

export function EmailVerificationPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Support both query params (from email links) and state (from registration flow)
  const email = searchParams.get("email") || location.state?.email;
  const token = searchParams.get("token");

  // Auto-verify when token is present (from email link)
  useEffect(() => {
    if (token && email) {
      const verifyToken = async () => {
        setIsLoading(true);
        setError("");
        try {
          await apiClient.post("/api/auth/verify-email", {
            email,
            token,
          });
          setSuccess(true);
          setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Verification failed. Please try entering the code manually.",
          );
        } finally {
          setIsLoading(false);
        }
      };
      verifyToken();
    }
  }, [token, email, navigate]);

  useEffect(() => {
    if (!email) {
      setError("Invalid verification link. Please register again.");
    }
  }, [email]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/api/auth/verify-email", {
        email,
        code: verificationCode,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/api/auth/resend-verification", { email });
      setError("Verification code sent to your email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (!email || resendCooldown > 0) return;

    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/api/auth/resend-verification", { email });
      setError("Verification link sent! Please check your email.");
      setResendCooldown(30); // Set 30 second cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend link");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-dark-text">
              Email verified successfully!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-dark-textMuted">
              You will be redirected to the login page shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Auto-verification loading state */}
        {token && isLoading && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
              <svg
                className="h-8 w-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-dark-text">
              Verifying your email
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-dark-textMuted">
              Please wait while we verify your email address...
            </p>
            <div className="flex justify-center mt-6">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          </div>
        )}

        {/* Show error if auto-verification failed with token present */}
        {token && !isLoading && error && !success && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-dark-text">
              Verification Failed
            </h2>
            <p className="mt-3 text-sm text-red-600">{error}</p>
            <div className="mt-6 space-y-3">
              <button
                onClick={handleResendLink}
                disabled={isLoading || resendCooldown > 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-dark-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend verification link"}
              </button>
              {resendCooldown > 0 && (
                <p className="text-xs text-gray-500">
                  You can resend the link in {resendCooldown} seconds
                </p>
              )}
            </div>
          </div>
        )}

        {/* Manual code entry form (when no token or after auto-verification fails) */}
        {!token && (
          <>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
                <svg
                  className="h-8 w-8 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-dark-text">
                Verify your email
              </h2>
              <p className="mt-3 text-sm text-gray-600 dark:text-dark-textMuted">
                We've sent a verification code to
              </p>
              <p className="mt-1 text-sm font-medium text-indigo-600">
                {email}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Please check your inbox and enter the code below
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Verification Code
              </label>
              <Input
                id="code"
                name="code"
                type="text"
                required
                maxLength={6}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-dark-border placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-dark-primary focus:border-indigo-500 dark:focus:border-dark-primary text-center text-lg tracking-widest font-mono"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-dark-textMuted text-center">
                Enter the 6-digit code from your email
              </p>
            </div>
          </div>

          {error && (
            <div
              className={`text-sm text-center ${error.includes("sent") ? "text-green-600" : "text-red-600"}`}
            >
              {error}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isLoading || !email}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </div>

          <div className="flex flex-col items-center space-y-3 pt-4">
            <p className="text-sm text-gray-600 dark:text-dark-textMuted">Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Resend verification code
            </button>
          </div>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
