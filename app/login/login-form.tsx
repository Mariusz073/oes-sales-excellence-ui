"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError("");

      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
        return;
      }

      router.push(callbackUrl || "/");
      router.refresh();
    } catch (error) {
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage("Please enter your username");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: forgotPasswordEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setForgotPasswordMessage(
          "If an account exists with this username, you will receive a password reset link."
        );
        setForgotPasswordEmail("");
      } else {
        setForgotPasswordMessage(data.error || "An error occurred");
      }
    } catch (error) {
      setForgotPasswordMessage("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="bg-[#252525] p-6 rounded-lg shadow-lg">
        <div className="rounded-md">
          <form onSubmit={handleForgotPassword} className="space-y-3">
            <div>
              <label htmlFor="forgot-password-email" className="sr-only">
                Username
              </label>
              <input
                id="forgot-password-email"
                type="text"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="bg-[#252525] text-white px-3 py-2 rounded-lg text-base border-none outline-none focus:ring-2 focus:ring-[#FF6B8A] appearance-none w-full font-normal"
                placeholder="Enter your username"
              />
            </div>
            {forgotPasswordMessage && (
              <p
                className={`text-sm ${
                  forgotPasswordMessage.includes("error")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {forgotPasswordMessage}
              </p>
            )}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-[#FF6B8A] hover:text-[#ff8da6]"
              >
                Back to login
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`button ${isLoading ? 'opacity-50' : ''}`}
              >
                {isLoading ? "Processing..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-[#252525] p-6 rounded-lg shadow-lg">
      <div className="space-y-3">
        <div>
          <label htmlFor="username" className="sr-only">
            Username
          </label>
          <input
            id="username"
            type="text"
            {...register("username")}
            className="bg-[#252525] text-white px-3 py-2 rounded-lg text-base border-none outline-none focus:ring-2 focus:ring-[#FF6B8A] appearance-none w-full font-normal"
            placeholder="Username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="bg-[#252525] text-white px-3 py-2 rounded-lg text-base border-none outline-none focus:ring-2 focus:ring-[#FF6B8A] appearance-none w-full font-normal"
            placeholder="Password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <div className="flex items-center justify-between px-1 mt-4">
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-sm text-[#FF6B8A] hover:text-[#ff8da6]"
        >
          Forgot password?
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`button ${isLoading ? 'opacity-50' : ''}`}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}
