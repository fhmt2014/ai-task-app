// components/SignOutButton.tsx
"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
    >
      退出登录
    </button>
  );
}
