import React from "react";
import { InteractiveButton } from "@/app/ui/interactive-button";
interface Post {
  id: number;
  title: string;
}
export default async function page() {
  const posts = await fetch("https://jsonplaceholder.typicode.com/posts").then(
    (res) => res.json(),
  );
  console.log(posts);
  return (
    <div>
      <h1>About</h1>
      <ul>
        {posts.slice(0, 5).map((post: Post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
      <InteractiveButton />
    </div>
  );
}
