import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      // You might want to add this to the store or handle locally
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });
      navigate("/email-verification", {
        state: { email: formData.email },
      });
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {/* Marketing Banner */}
          <div className="mb-6 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-center text-white shadow-lg">
            <p className="font-bold text-lg">Special Offer 🎉</p>
            <p className="text-sm mt-1">
              The first 100 vendors get <span className="font-extrabold text-yellow-300">20% off</span> commission fees for 30 days!
            </p>
          </div>

          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-dark-text">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-dark-textMuted">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="firstName" className="sr-only">
                First Name
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-dark-textMuted text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-dark-primary focus:border-indigo-500 dark:focus:border-dark-primary focus:z-10 sm:text-sm"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="sr-only">
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-dark-textMuted text-gray-900 focus:outline-none focus:ring-indigo-500 dark:focus:ring-dark-primary focus:border-indigo-500 dark:focus:border-dark-primary focus:z-10 sm:text-sm"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-dark-textMuted text-gray-900 focus:outline-none focus:ring-indigo-500 dark:focus:ring-dark-primary focus:border-indigo-500 dark:focus:border-dark-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-dark-textMuted text-gray-900 focus:outline-none focus:ring-indigo-500 dark:focus:ring-dark-primary focus:border-indigo-500 dark:focus:border-dark-primary focus:z-10 sm:text-sm"
                placeholder="Phone Number (optional)"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-dark-textMuted text-gray-900 focus:outline-none focus:ring-indigo-500 dark:focus:ring-dark-primary focus:border-indigo-500 dark:focus:border-dark-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-dark-textMuted text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 dark:focus:ring-dark-primary focus:border-indigo-500 dark:focus:border-dark-primary focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {formData.password !== formData.confirmPassword &&
            formData.confirmPassword && (
              <div className="text-red-600 text-sm text-center">
                Passwords do not match
              </div>
            )}

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <Button
              type="submit"
              disabled={
                isLoading || formData.password !== formData.confirmPassword
              }
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
