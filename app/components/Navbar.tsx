// components/Navbar.tsx
import { auth } from "@/auth";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="flex justify-between items-center p-4 border-b">
      <div className="font-bold text-lg">AI 任务助手</div>
      <div>
        {session?.user ? (
          <div className="flex items-center gap-4">
            {session.user.image && (
              <img
                src={session.user.image}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm">{session.user.name}</span>
            <SignOutButton />
          </div>
        ) : (
          <SignInButton />
        )}
      </div>
    </nav>
  );
}
