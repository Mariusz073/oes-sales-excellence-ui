"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function CreateUserForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setIsLoading(true);
      setMessage(null);

      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user");
      }

      setMessage({
        text: `User created successfully! Password: ${result.password}`,
        type: "success",
      });
      reset();
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "An error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="username" className="sr-only">
          Username
        </label>
        <input
          type="text"
          id="username"
          {...register("username")}
          className="bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                    border-none outline-none focus:ring-2 focus:ring-[#FF6B8A] 
                    appearance-none w-full font-normal"
          placeholder="Username"
          disabled={isLoading}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
        )}
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="button"
      >
        {isLoading ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
