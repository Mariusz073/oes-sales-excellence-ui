"use client";

import { useState, useEffect, useTransition } from "react";
import { createUser } from "../actions/createUser";
import ManageNamesDialog from "../components/ManageNamesDialog";
import IndeterminateCheckbox from "../components/IndeterminateCheckbox";

export default function CreateUserForm() {
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManageReportsOpen, setIsManageReportsOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [privileges, setPrivileges] = useState({
    individualReports: false,
    teamMonash: false,
    teamSOL: false,
    teamBehavioural: false,
    teamCollaborative: false,
  });

  useEffect(() => {
    if (isAdmin) {
      setPrivileges({
        individualReports: true,
        teamMonash: true,
        teamSOL: true,
        teamBehavioural: true,
        teamCollaborative: true,
      });
      setSelectedReports([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (privileges.individualReports) {
      setSelectedReports([]);
    }
  }, [privileges.individualReports]);

  async function onSubmit(formData: FormData) {
    setMessage(null);
    
    // Add selected reports to form data
    if (!isAdmin && !privileges.individualReports && selectedReports.length > 0) {
      formData.append("allowedReports", JSON.stringify(selectedReports));
    }
    
    startTransition(async () => {
      const result = await createUser(formData);
      
      if ("error" in result) {
        setMessage({
          text: result.error,
          type: "error",
        });
      } else {
        setMessage({
          text: `User created successfully! Password: ${result.password}`,
          type: "success",
        });
        
        // Reset form
        const form = document.getElementById("createUserForm") as HTMLFormElement;
        form.reset();
        setIsAdmin(false);
        setSelectedReports([]);
        setPrivileges({
          individualReports: false,
          teamMonash: false,
          teamSOL: false,
          teamBehavioural: false,
          teamCollaborative: false,
        });
      }
    });
  }

  return (
    <>
      <form id="createUserForm" action={onSubmit} className="space-y-4">
        <input type="hidden" name="isAdmin" value={isAdmin.toString()} />
        <input type="hidden" name="privileges.individualReports" value={privileges.individualReports.toString()} />
        <input type="hidden" name="privileges.teamMonash" value={privileges.teamMonash.toString()} />
        <input type="hidden" name="privileges.teamSOL" value={privileges.teamSOL.toString()} />
        <input type="hidden" name="privileges.teamBehavioural" value={privileges.teamBehavioural.toString()} />
        <input type="hidden" name="privileges.teamCollaborative" value={privileges.teamCollaborative.toString()} />
        
        <div>
          <label htmlFor="username" className="sr-only">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="bg-[#252525] text-white px-4 py-3 rounded-lg text-base 
                      border-none outline-none focus:ring-2 focus:ring-[#FF6B8A] 
                      appearance-none w-full font-medium"
            placeholder="Username"
            disabled={isPending}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAdmin"
              name="isAdmin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
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
                    setPrivileges(prev => ({ ...prev, individualReports: e.target.checked }));
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
                  onClick={() => !privileges.individualReports && setIsManageReportsOpen(true)}
                  className={`button text-base py-1 ${
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
                onChange={(e) => !isAdmin && setPrivileges(prev => ({ ...prev, teamMonash: e.target.checked }))}
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
                onChange={(e) => !isAdmin && setPrivileges(prev => ({ ...prev, teamSOL: e.target.checked }))}
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
                onChange={(e) => !isAdmin && setPrivileges(prev => ({ ...prev, teamBehavioural: e.target.checked }))}
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
                onChange={(e) => !isAdmin && setPrivileges(prev => ({ ...prev, teamCollaborative: e.target.checked }))}
                disabled={isAdmin}
                className="h-4 w-4 text-[#FF6B8A] focus:ring-[#FF6B8A] border-gray-300 rounded"
              />
              <label htmlFor="teamCollaborative" className="ml-2 block text-base font-medium text-white">
                Team reports - Collaborative
              </label>
            </div>
          </div>
        </div>

        {message && (
          <p
            className={`text-lg ${
              message.type === "success" ? "text-green-500" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="button"
        >
          {isPending ? "Creating..." : "Create User"}
        </button>
      </form>

      <ManageNamesDialog
        isOpen={isManageReportsOpen}
        onClose={() => setIsManageReportsOpen(false)}
        selectedReports={selectedReports}
        onSave={setSelectedReports}
        disabled={isAdmin || privileges.individualReports}
      />
    </>
  );
}
