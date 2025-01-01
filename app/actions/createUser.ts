"use server";

import { dbOperations } from "../db/postgres";
import { z } from "zod";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authConfig } from "../lib/auth-config";
import { UserPrivileges } from "../types/types";

const createUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  isAdmin: z.boolean(),
  privileges: z.object({
    individualReports: z.boolean(),
    teamMonash: z.boolean(),
    teamSOL: z.boolean(),
    teamBehavioural: z.boolean(),
    teamCollaborative: z.boolean(),
    allowedReports: z.array(z.string()).optional(),
  }).strict(),
}).strict();

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

function parseFormData(formData: FormData) {
  const basePrivileges = {
    individualReports: Boolean(formData.get("privileges.individualReports") === "true"),
    teamMonash: Boolean(formData.get("privileges.teamMonash") === "true"),
    teamSOL: Boolean(formData.get("privileges.teamSOL") === "true"),
    teamBehavioural: Boolean(formData.get("privileges.teamBehavioural") === "true"),
    teamCollaborative: Boolean(formData.get("privileges.teamCollaborative") === "true")
  } as const;

  const privileges = formData.has("allowedReports")
    ? { ...basePrivileges, allowedReports: JSON.parse(formData.get("allowedReports") as string) }
    : basePrivileges;

  return {
    username: formData.get("username") as string,
    isAdmin: formData.get("isAdmin") === "true",
    privileges: privileges as UserPrivileges
  };
}

export async function createUser(formData: FormData): Promise<CreateUserResult> {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authConfig);
    if (!session?.user?.isAdmin) {
      return { error: "Unauthorized" };
    }

    const rawData = parseFormData(formData);

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
        result.data.privileges as UserPrivileges
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
