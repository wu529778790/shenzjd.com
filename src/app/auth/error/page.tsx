"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import Link from "next/link";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    console.error("Auth error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">认证错误</h1>
      <p className="text-gray-600">
        {error === "Configuration"
          ? "认证配置错误，请检查环境变量是否正确设置"
          : "登录过程中发生错误，请重试"}
      </p>
      <Link
        href="/"
        className="mt-4 text-blue-500 hover:text-blue-700 underline">
        返回首页
      </Link>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">加载中...</h1>
        </div>
      }>
      <ErrorContent />
    </Suspense>
  );
}
