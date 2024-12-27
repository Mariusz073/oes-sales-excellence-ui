import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "../../../lib/auth-config";
import { dbOperations } from "../../../SQLite/db";
import { z } from "zod";
import crypto from "crypto";

const createUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

function generatePassword() {
  // Generate a random password with 12 characters
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authConfig);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate input
    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    // Generate random password
    const password = generatePassword();

    // Create user
    try {
      await dbOperations.createUser(result.data.username, password, false);
    } catch (error) {
      if (error instanceof Error && error.message === "Username already exists") {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      message: "User created successfully",
      password: password,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
