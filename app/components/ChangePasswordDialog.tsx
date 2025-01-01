"use client";

import { useState, useTransition, useRef } from "react";
import { changePassword } from "../actions/changePassword";

export default function ChangePasswordDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const values = {
      oldPassword: formData.get("oldPassword")?.toString(),
      newPassword: formData.get("newPassword")?.toString(),
      retypePassword: formData.get("retypePassword")?.toString()
    };

    if (!values.oldPassword || !values.newPassword || !values.retypePassword) {
      setMessage({ text: "All fields are required", type: "error" });
      return;
    }

    if (values.newPassword !== values.retypePassword) {
      setMessage({ text: "New passwords do not match", type: "error" });
      return;
    }

    setMessage(null);
    startTransition(() => {
      const submitData = new FormData();
      submitData.append("oldPassword", values.oldPassword as string);
      submitData.append("newPassword", values.newPassword as string);
      
      changePassword(submitData).then((result) => {
        if ("error" in result) {
          setMessage({ text: result.error ?? "", type: "error" });
        } else {
          setMessage({ text: result.message, type: "success" });
          // Close dialog after successful password change
          setTimeout(() => {
            setIsOpen(false);
            setMessage(null);
          }, 2000);
        }
      });
    });
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="button">
        Change Password
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="bg-[#252525] text-white p-8 rounded-lg w-full max-w-md relative z-10" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Change Password</h2>
              
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="oldPassword" className="block text-sm font-medium mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    required
                    className="bg-[#1E1E1E] text-white px-4 py-2 rounded-lg text-base 
                              border-none outline-none focus:ring-2 focus:ring-[#FF6B8A] 
                              appearance-none w-full"
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      required
                      minLength={6}
                      className="bg-[#1E1E1E] text-white px-4 py-2 rounded-lg text-base 
                                border-none outline-none focus:ring-2 focus:ring-[#FF6B8A] 
                                appearance-none w-full"
                      disabled={isPending}
                    />
                    <p className="mt-1 text-sm text-gray-400">At least 6 characters long</p>
                  </div>

                  <div>
                    <label htmlFor="retypePassword" className="block text-sm font-medium mb-1">
                      Retype New Password
                    </label>
                    <input
                      type="password"
                      id="retypePassword"
                      name="retypePassword"
                      required
                      minLength={6}
                      className="bg-[#1E1E1E] text-white px-4 py-2 rounded-lg text-base 
                                border-none outline-none focus:ring-2 focus:ring-[#FF6B8A] 
                                appearance-none w-full"
                      disabled={isPending}
                    />
                  </div>
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

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="button bg-gray-700 hover:bg-gray-600"
                    disabled={isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button"
                    disabled={isPending}
                  >
                    {isPending ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
