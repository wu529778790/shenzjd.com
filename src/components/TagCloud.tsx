export interface TagItem {
  href: string
  label: string
  title?: string
  external?: boolean
}

export default function TagCloud({ title, items }: { title: string, items: TagItem[] }) {
  return (
    <section aria-labelledby={`${title.toLowerCase()}-title`}>
      <h1
        id={`${title.toLowerCase()}-title`}
        className="m-0 px-2.5 text-base font-semibold leading-none text-[var(--color-heading)]">
        {title}
      </h1>
      <ul
        className="mt-4 mb-0 list-none pl-0 leading-normal [column-count:1] [column-gap:20px] sm:[column-count:2] sm:[column-gap:40px] sm:[column-rule:1px_solid_var(--color-line)]"
        role="list">
        {items.map(item => (
          <li key={item.href} className="mb-2 block break-inside-avoid">
            <a
              href={item.href}
              className="inline-block rounded-[var(--radius-sm)] border border-[var(--color-line)] px-3 py-1 text-sm text-[var(--color-muted)] no-underline transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:no-underline"
              title={item.title ?? item.label}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
