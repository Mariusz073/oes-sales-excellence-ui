"use client";

import { useState, useEffect, useTransition } from "react";
import { getAllUsers, getUserPrivileges, updateUserPrivileges, resetUserPassword, deleteUser } from "../actions/manageUser";
import { UserPrivileges } from "../types/types";
import { User } from "../db/postgres";
import ManageNamesDialog from "../components/ManageNamesDialog";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManageNamesOpen, setIsManageNamesOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [privileges, setPrivileges] = useState<UserPrivileges>({
    individualReports: false,
    teamMonash: false,
    teamSOL: false,
    teamBehavioural: false,
    teamCollaborative: false,
  });
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserPrivileges(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    const result = await getAllUsers();
    if ("users" in result && result.users) {
      setUsers(result.users);
    } else {
      setMessage({ text: result.error || "Failed to fetch users", type: "error" });
    }
  };

  const fetchUserPrivileges = async (userId: number) => {
    const result = await getUserPrivileges(userId);
    if ("privileges" in result && result.privileges) {
      setPrivileges(result.privileges);
      setIsAdmin(result.isAdmin ?? false);
      setSelectedReports(result.privileges.allowedReports || []);
    } else {
      setMessage({ text: result.error || "Failed to fetch user privileges", type: "error" });
    }
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = parseInt(e.target.value);
    setSelectedUserId(userId || null);
  };

  const handlePrivilegeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === "isAdmin") {
      setIsAdmin(checked);
      if (checked) {
        setPrivileges({
          individualReports: true,
          teamMonash: true,
          teamSOL: true,
          teamBehavioural: true,
          teamCollaborative: true,
        });
        setSelectedReports([]);
      }
    } else {
      const field = name.replace("privileges.", "") as keyof UserPrivileges;
      setPrivileges(prev => ({
        ...prev,
        [field]: checked,
      }));
      if (field === "individualReports" && checked) {
        setSelectedReports([]);
      }
    }
  };

  const handleSave = async (formData: FormData) => {
    if (!selectedUserId) return;

    // Add selected reports to form data if needed
    if (!isAdmin && !privileges.individualReports && selectedReports.length > 0) {
      formData.append("allowedReports", JSON.stringify(selectedReports));
    }

    setMessage(null);
    startTransition(async () => {
      const result = await updateUserPrivileges(formData);
      if ("success" in result) {
        setMessage({ text: result.message || "Changes saved successfully", type: "success" });
        setSelectedUserId(null);
        setIsAdmin(false);
        setSelectedReports([]);
        setPrivileges({
          individualReports: false,
          teamMonash: false,
          teamSOL: false,
          teamBehavioural: false,
          teamCollaborative: false,
        });
      } else {
        setMessage({ text: result.error || "Failed to save changes", type: "error" });
      }
    });
  };

  const handleResetPassword = async (formData: FormData) => {
    if (!selectedUserId) return;

    setMessage(null);
    startTransition(async () => {
      const result = await resetUserPassword(formData);
      if ("success" in result && result.password) {
        setMessage({ 
          text: `Password reset successfully. New password: ${result.password}`, 
          type: "success" 
        });
      } else {
        setMessage({ text: result.error || "Failed to reset password", type: "error" });
      }
    });
  };

  const handleDeleteUser = async (formData: FormData) => {
    if (!selectedUserId) return;

    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await deleteUser(formData);
      if ("success" in result) {
        setMessage({ text: "User deleted successfully", type: "success" });
        setSelectedUserId(null);
        fetchUsers();
      } else {
        setMessage({ text: result.error || "Failed to delete user", type: "error" });
      }
    });
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold mb-6">Manage Users</h2>
        
        <div className="space-y-4">
          <div>
            <select
              className="bg-[#252525] text-white px-4 py-3 text-base text font-medium rounded-lg 
                        border-none outline-none focus:ring-2 focus:ring-[#FF6B8A] 
                        appearance-none w-full"
              value={selectedUserId?.toString() || ""}
              onChange={handleUserChange}
              aria-label="Select user to manage"
            >
              <option value="">Select a user to manage</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          {selectedUserId && (
            <form id="manageUserForm" action={handleSave} className="space-y-4">
              <input type="hidden" name="userId" value={selectedUserId} />
              <input type="hidden" name="isAdmin" value={isAdmin.toString()} />
              <input type="hidden" name="privileges.individualReports" value={privileges.individualReports.toString()} />
              <input type="hidden" name="privileges.teamMonash" value={privileges.teamMonash.toString()} />
              <input type="hidden" name="privileges.teamSOL" value={privileges.teamSOL.toString()} />
              <input type="hidden" name="privileges.teamBehavioural" value={privileges.teamBehavioural.toString()} />
              <input type="hidden" name="privileges.teamCollaborative" value={privileges.teamCollaborative.toString()} />
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    name="isAdmin"
                    checked={isAdmin}
                    onChange={handlePrivilegeChange}
                    className="h-4 w-4 text-[#FF6B8A] focus:ring-[#FF6B8A] border-gray-300 rounded"
                  />
                  <label htmlFor="isAdmin" className="ml-2 block text-base font-medium text-white">
                    Admin (all privileges and Admin Panel access)
                  </label>
                </div>

                <div className="pl-6 space-y-2">
                  <div className="flex items-center gap-4">
                    <IndeterminateCheckbox
                      id="individualReports"
                      name="privileges.individualReports"
                      checked={privileges.individualReports}
                      indeterminate={!privileges.individualReports && selectedReports.length > 0}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (!isAdmin) {
                          handlePrivilegeChange(e);
                          if (e.target.checked) {
                            setSelectedReports([]);
                          }
                        }
                      }}
                      disabled={isAdmin}
                      label="Individual reports"
                    />
                    <label htmlFor="individualReports" className="-ml-2 block text-base font-medium text-white">
                      Individual reports
                    </label>
                    {!isAdmin && (
                      <button
                        type="button"
                        onClick={() => !privileges.individualReports && setIsManageNamesOpen(true)}
                        className={`button text-base font-medium py-1 ${
                          privileges.individualReports ? 
                          'opacity-50 cursor-not-allowed' : 
                          'bg-gray-700 hover:bg-gray-600'
                        }`}
                        disabled={privileges.individualReports}
                      >
                        Manage Names {selectedReports.length > 0 && `(${selectedReports.length})`}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="teamMonash"
                      name="privileges.teamMonash"
                      checked={privileges.teamMonash}
                      onChange={handlePrivilegeChange}
                      disabled={isAdmin}
                      className="h-4 w-4 text-[#FF6B8A] focus:ring-[#FF6B8A] border-gray-300 rounded"
                    />
                    <label htmlFor="teamMonash" className="ml-2 block text-base font-medium text-white">
                      Team reports - Monash
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="teamSOL"
                      name="privileges.teamSOL"
                      checked={privileges.teamSOL}
                      onChange={handlePrivilegeChange}
                      disabled={isAdmin}
                      className="h-4 w-4 text-[#FF6B8A] focus:ring-[#FF6B8A] border-gray-300 rounded"
                    />
                    <label htmlFor="teamSOL" className="ml-2 block text-base font-medium text-white">
                      Team reports - SOL
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="teamBehavioural"
                      name="privileges.teamBehavioural"
                      checked={privileges.teamBehavioural}
                      onChange={handlePrivilegeChange}
                      disabled={isAdmin}
                      className="h-4 w-4 text-[#FF6B8A] focus:ring-[#FF6B8A] border-gray-300 rounded"
                    />
                    <label htmlFor="teamBehavioural" className="ml-2 block text-base font-medium text-white">
                      Team reports - Behavioural
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="teamCollaborative"
                      name="privileges.teamCollaborative"
                      checked={privileges.teamCollaborative}
                      onChange={handlePrivilegeChange}
                      disabled={isAdmin}
                      className="h-4 w-4 text-[#FF6B8A] focus:ring-[#FF6B8A] border-gray-300 rounded"
                    />
                    <label htmlFor="teamCollaborative" className="ml-2 block text-base font-medium text-white">
                      Team reports - Collaborative
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className="button"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => handleResetPassword(new FormData(document.getElementById("manageUserForm") as HTMLFormElement))}
                  disabled={isPending}
                  className="button"
                >
                  Reset Password
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteUser(new FormData(document.getElementById("manageUserForm") as HTMLFormElement))}
                  disabled={isPending}
                  className="button bg-red-600 hover:bg-red-700"
                >
                  Delete User
                </button>
              </div>
            </form>
          )}

          {message && (
            <p
              className={`text-lg ${
                message.type === "success" ? "text-green-500" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>

      <ManageNamesDialog
        isOpen={isManageNamesOpen}
        onClose={() => setIsManageNamesOpen(false)}
        selectedReports={selectedReports}
        onSave={setSelectedReports}
        disabled={isAdmin || privileges.individualReports}
      />
    </>
  );
}
