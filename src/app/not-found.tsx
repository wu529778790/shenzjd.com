export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="ui-font mb-4 text-[14px] text-[var(--color-muted)]">
        404 错误
      </p>
      <h1 className="mb-2 text-[28px] font-bold text-[var(--color-heading)]">
        页面未找到
      </h1>
      <p className="mb-6 max-w-[400px] text-[14px] leading-relaxed text-[var(--color-muted)]">
        您访问的页面不存在或已被移除。
      </p>
      <a
        href="/"
        className="ui-font inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-card)] px-6 py-2.5 text-[14px] font-medium text-[var(--color-muted)] no-underline transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        返回首页
      </a>
    </div>
  )
}
