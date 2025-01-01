"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
      className="button"
    >
      Log Out
    </button>
  );
}
