"use client";
import React, { useState } from "react";

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>点击了{count}次</button>;
}
