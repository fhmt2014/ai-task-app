// components/SignInButton.tsx
"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("github")}
      className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
    >
      使用 GitHub 登录
    </button>
  );
}
