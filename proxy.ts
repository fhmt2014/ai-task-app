// proxy.ts
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/ai-chat/:path*", "/tasks-server/:path*"],
};
