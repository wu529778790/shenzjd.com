export interface TagItem {
  href: string
  label: string
  title?: string
  external?: boolean
}

export default function TagCloud({ title, items }: { title: string; items: TagItem[] }) {
  return (
    <section aria-labelledby="tag-cloud-heading">
      <h2 id="tag-cloud-heading" className="mb-4 text-[15px] font-semibold text-[var(--color-heading)]">
        {title}
      </h2>
      <div className="break-inside-avoid columns-1 gap-6 sm:columns-2 [&>*:not(:first-child)]:mt-3" style={{ columnRule: '1px solid var(--color-line)' }}>
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            title={item.title || item.label}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            className="ui-font mb-3 inline-block w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-2.5 text-[13px] font-medium text-[var(--color-heading)] no-underline transition-all duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:no-underline">
            {item.label}
          </a>
        ))}
      </div>
    </section>
  )
}
