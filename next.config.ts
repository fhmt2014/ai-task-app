import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // serverExternalPackages: ["@mastra/*", "@ai-sdk/*"],
  serverExternalPackages: [
    "@mastra/duckdb",
    // 如果用 libsql 本地文件存储再开；Vercel serverless 一般别用 LibSQLStore
    // "@mastra/libsql",
    // 其它原生：sharp、better-sqlite3、@libsql/client、prisma 其实已默认外置
  ],
};

export default nextConfig;
