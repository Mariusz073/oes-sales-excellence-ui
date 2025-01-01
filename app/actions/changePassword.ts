"use server";

import { dbOperations } from "../SQLite/db";
import { getServerSession } from "next-auth";
import { authConfig } from "../lib/auth-config";
import { z } from "zod";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function changePassword(formData: FormData) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const data = {
      oldPassword: formData.get("oldPassword")?.toString() || "",
      newPassword: formData.get("newPassword")?.toString() || "",
    };

    const result = changePasswordSchema.safeParse(data);
    if (!result.success) {
      return { error: "Invalid input" };
    }

    const user = dbOperations.getUserByUsername(session.user.username);
    if (!user) {
      return { error: "User not found" };
    }

    // Verify old password
    const isValid = dbOperations.verifyPassword(user, result.data.oldPassword);
    if (!isValid) {
      return { error: "Current password is incorrect" };
    }

    // Update password
    await dbOperations.updatePassword(user.id, result.data.newPassword);

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "Failed to change password" };
  }
}
