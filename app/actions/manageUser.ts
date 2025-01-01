"use server";

import { dbOperations } from "../SQLite/db";
import { getServerSession } from "next-auth";
import { authConfig } from "../lib/auth-config";
import { UserPrivileges } from "../types/types";

export async function getAllUsers() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const users = dbOperations.getAllUsers();
    return { users };
  } catch (error) {
    console.error("Get users error:", error);
    return { error: "Failed to fetch users" };
  }
}

export async function getUserPrivileges(userId: number) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const privileges = dbOperations.getUserPrivileges(userId);
    const user = dbOperations.getUserById(userId);
    if (!user) {
      return { error: "User not found" };
    }
    return { privileges, isAdmin: user.isAdmin };
  } catch (error) {
    console.error("Get user privileges error:", error);
    return { error: "Failed to fetch user privileges" };
  }
}

export async function updateUserPrivileges(formData: FormData) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const userId = parseInt(formData.get("userId") as string);
    const isAdmin = formData.get("isAdmin") === "true";
    
    // If admin, set all privileges to true
    const privileges: UserPrivileges = isAdmin ? {
      individualReports: true,
      teamMonash: true,
      teamSOL: true,
      teamBehavioural: true,
      teamCollaborative: true,
    } : {
      individualReports: formData.get("privileges.individualReports") === "true",
      teamMonash: formData.get("privileges.teamMonash") === "true",
      teamSOL: formData.get("privileges.teamSOL") === "true",
      teamBehavioural: formData.get("privileges.teamBehavioural") === "true",
      teamCollaborative: formData.get("privileges.teamCollaborative") === "true",
    };

    await dbOperations.updateUserPrivileges(userId, isAdmin, privileges);
    return { success: true, message: "User privileges updated successfully" };
  } catch (error) {
    console.error("Update user privileges error:", error);
    return { error: "Failed to update user privileges" };
  }
}

export async function resetUserPassword(formData: FormData) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const userId = parseInt(formData.get("userId") as string);
    const newPassword = dbOperations.resetUserPassword(userId);
    return { success: true, password: newPassword };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Failed to reset password" };
  }
}

export async function deleteUser(formData: FormData) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.isAdmin) {
    return { error: "Unauthorized" };
  }

  try {
    const userId = parseInt(formData.get("userId") as string);
    await dbOperations.deleteUser(userId);
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "Failed to delete user" };
  }
}
