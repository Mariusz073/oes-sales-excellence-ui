"use server";

import { dbOperations } from "../SQLite/db";
import { z } from "zod";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authConfig } from "../lib/auth-config";

const createUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  isAdmin: z.boolean().default(false),
  privileges: z.object({
    individualReports: z.boolean().default(false),
    teamMonash: z.boolean().default(false),
    teamSOL: z.boolean().default(false),
    teamBehavioural: z.boolean().default(false),
    teamCollaborative: z.boolean().default(false),
  }).default({
    individualReports: false,
    teamMonash: false,
    teamSOL: false,
    teamBehavioural: false,
    teamCollaborative: false,
  }),
});

function generatePassword() {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

type CreateUserResult = 
  | { success: true; message: string; password: string }
  | { error: string };

export async function createUser(formData: FormData): Promise<CreateUserResult> {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authConfig);
    if (!session?.user?.isAdmin) {
      return { error: "Unauthorized" };
    }

    // Parse form data
    const rawData = {
      username: formData.get("username"),
      isAdmin: formData.get("isAdmin") === "true",
      privileges: {
        individualReports: formData.get("privileges.individualReports") === "true",
        teamMonash: formData.get("privileges.teamMonash") === "true",
        teamSOL: formData.get("privileges.teamSOL") === "true",
        teamBehavioural: formData.get("privileges.teamBehavioural") === "true",
        teamCollaborative: formData.get("privileges.teamCollaborative") === "true",
      },
    };

    // Validate input
    const result = createUserSchema.safeParse(rawData);
    if (!result.success) {
      return { error: "Invalid input" };
    }

    // Generate random password
    const password = generatePassword();

    // Create user with privileges
    try {
      await dbOperations.createUser(
        result.data.username,
        password,
        result.data.isAdmin,
        result.data.privileges
      );

      return {
        success: true,
        message: "User created successfully",
        password: password,
      };
    } catch (error) {
      if (error instanceof Error && error.message === "Username already exists") {
        return { error: "Username already exists" };
      }
      throw error;
    }
  } catch (error) {
    console.error("Create user error:", error);
    return { error: "An error occurred processing your request" };
  }
}
