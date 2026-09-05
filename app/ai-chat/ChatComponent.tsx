// app/ai-chat/ChatComponent.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

// 这里放原来的 useChat 相关代码，从 props 接收 userName
import React from "react";

export default function ChatComponent(props: { userName: string }) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    // <div className="max-w-2xl mx-auto p-8">
    //   <h1 className="text-2xl font-bold mb-6">AI 任务助手</h1>

    //   <div className="border rounded p-4 h-96 overflow-y-auto mb-4 space-y-3">
    //     {messages.length === 0 && (
    //       <p className="text-gray-400">问我任何关于任务管理的问题...</p>
    //     )}

    //     {messages.map((message) => (
    //       <div key={message.id} className={message.role === 'user' ? 'text-right' : 'text-left'}>
    //         <span className={`inline-block px-3 py-2 rounded-lg ${
    //           message.role === 'user'
    //             ? 'bg-blue-500 text-white'
    //             : 'bg-gray-100 text-gray-800'
    //         }`}>
    //           {message.parts
    //             .filter((part) => part.type === 'text')
    //             .map((part, i) => <span key={i}>{(part as any).text}</span>)}
    //         </span>
    //       </div>
    //     ))}

    //     {status === 'submitted' || status === 'streaming' ? (
    //       <p className="text-gray-400">AI 正在思考...</p>
    //     ) : null}
    //   </div>

    //   <form onSubmit={handleSubmit} className="flex gap-2">
    //     <input
    //       value={input}
    //       onChange={(e) => setInput(e.target.value)}
    //       placeholder="例如：帮我拆解『上线个人博客』这个任务"
    //       className="flex-1 px-3 py-2 border rounded"
    //     />
    //     <button
    //       type="submit"
    //       disabled={status !== 'ready'}
    //       className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
    //     >
    //       发送
    //     </button>
    //   </form>
    // </div>
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">当前用户：{props.userName}</h1>
      <h1 className="text-2xl font-bold mb-2">AI 任务助手</h1>
      <p className="text-sm text-gray-400 mb-6">
        试试说："帮我创建一个任务：明早 8 点跑步" 或 "我有哪些任务？"
      </p>

      <div className="border rounded p-4 h-[32rem] overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-gray-400">问我任何关于任务管理的问题...</p>
        )}

        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {/* 角色标签 */}
            <div
              className={`text-xs font-semibold ${
                message.role === "user" ? "text-blue-600" : "text-purple-600"
              }`}
            >
              {message.role === "user" ? "你" : "AI 助手"}
            </div>

            {/* 消息内容 */}
            <div className="space-y-2">
              {message.parts.map((part, i) => {
                // 文本部分
                if (part.type === "text") {
                  return (
                    <div
                      key={i}
                      className={`inline-block px-3 py-2 rounded-lg max-w-full ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {part.text}
                    </div>
                  );
                }

                // // 工具调用部分（AI SDK 7 中 tool 调用的 part type 是 'tool-XXX'）
                // if (part.type.startsWith('tool-')) {
                //   const toolName = part.type.replace('tool-', '');
                //   const input = (part as any).input;
                //   const output = (part as any).output;

                //   return (
                //     <div key={i} className="ml-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                //       <div className="font-mono text-amber-700">
                //         🔧 调用工具: {toolName}
                //       </div>
                //       <div className="text-gray-600 mt-1">
                //         输入: {JSON.stringify(input)}
                //       </div>
                //       {output && (
                //         <div className="text-gray-600 mt-1">
                //           输出: {JSON.stringify(output)}
                //         </div>
                //       )}
                //     </div>
                //   );
                // }

                // return null;

                // ========== 2. 工具调用部分 ==========
                // AI SDK 7 中工具调用的 part.type 是 'tool-{toolName}'
                if (part.type.startsWith("tool-")) {
                  const toolName = part.type.replace("tool-", "");
                  const toolPart = part as any;

                  // --- 2a. 错误状态：state === 'output-error' ---
                  // 官方类型：ToolUIPart 有 state 状态机，错误态为 'output-error' 且带 errorText
                  if (toolPart.state === "output-error") {
                    return (
                      <div
                        key={i}
                        className="ml-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm"
                      >
                        <div className="font-mono text-red-700">
                          ❌ 工具调用失败: {toolName}
                        </div>
                        {toolPart.input && (
                          <div className="text-gray-600 mt-1">
                            输入: {JSON.stringify(toolPart.input)}
                          </div>
                        )}
                        <div className="text-red-600 mt-1 font-medium">
                          错误: {toolPart.errorText || "未知错误"}
                        </div>
                      </div>
                    );
                  }

                  // --- 2b. 成功状态：state === 'output-available' ---
                  const output = toolPart.output;
                  const isSuccess = output && output.success !== false;
                  const isErrorOutput = output && output.success === false;

                  return (
                    <div
                      key={i}
                      className={`ml-4 p-3 rounded-lg text-sm border ${
                        isErrorOutput
                          ? "bg-red-50 border-red-200"
                          : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      {/* 工具名 */}
                      <div
                        className={`font-mono ${
                          isErrorOutput ? "text-red-700" : "text-amber-700"
                        }`}
                      >
                        {isErrorOutput ? "❌" : "🔧"}{" "}
                        {isErrorOutput ? "工具执行失败: " : "调用工具: "}
                        {toolName}
                      </div>

                      {/* 输入参数 */}
                      {toolPart.input && (
                        <div className="text-gray-600 mt-1">
                          输入: {JSON.stringify(toolPart.input)}
                        </div>
                      )}

                      {/* 输出结果 */}
                      {output && (
                        <div className="mt-1">
                          {isSuccess ? (
                            <div className="text-green-700">
                              ✓ {output.message || JSON.stringify(output)}
                            </div>
                          ) : (
                            <div className="text-red-600">
                              ✗ {output.error || JSON.stringify(output)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 工具还在执行中（input-streaming / input-available 但未出结果） */}
                      {!output && toolPart.state !== "output-error" && (
                        <div className="text-gray-400 mt-1 animate-pulse">
                          执行中...
                        </div>
                      )}
                    </div>
                  );
                }

                // ========== 3. 其他 part 类型（reasoning/file 等）忽略 ==========
                return null;
              })}
            </div>
          </div>
        ))}

        {status === "submitted" || status === "streaming" ? (
          <p className="text-gray-400">AI 正在思考...</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：帮我拆解『上线个人博客』这个任务，并创建为待办"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          disabled={status !== "ready"}
          className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
        >
          发送
        </button>
      </form>
    </div>
  );
}
