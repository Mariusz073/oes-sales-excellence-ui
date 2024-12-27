import { NextResponse } from "next/server";
import { dbOperations } from "../../../SQLite/db";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const user = dbOperations.getUserByUsername(username);
    if (!user) {
      // Return success even if user doesn't exist for security
      return NextResponse.json({
        message: "If an account exists with this username, you will receive a password reset link.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save reset token to database
    dbOperations.updateResetToken(username, resetToken, resetTokenExpiry);

    // In a real application, you would send an email here with the reset link
    // For this demo, we'll just return the token in the response
    // TODO: Implement email sending in the future
    return NextResponse.json({
      message: "If an account exists with this username, you will receive a password reset link.",
      // Only including token in response for demonstration
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred processing your request" },
      { status: 500 }
    );
  }
}
