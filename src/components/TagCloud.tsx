export interface TagItem {
  href: string
  label: string
  title?: string
  external?: boolean
}

const sectionTitleClass = 'm-0 px-[10px] text-[16px] font-semibold leading-none text-heading'
const tagCloudClass = 'mt-4 mb-0 list-none pl-0 leading-normal [column-count:1] [column-gap:20px] sm:[column-count:2] sm:[column-gap:40px] sm:[column-rule:1px_solid_var(--color-line)]'
const tagCloudItemClass = 'mb-2 block break-inside-avoid'
const tagLinkClass = 'inline-block rounded-[4px] border border-line px-[10px] py-0.5 text-muted no-underline hover:border-accent hover:text-accent hover:no-underline'

export default function TagCloud({ title, items }: { title: string, items: TagItem[] }) {
  return (
    <section aria-labelledby={`${title.toLowerCase()}-title`}>
      <h1 id={`${title.toLowerCase()}-title`} className={sectionTitleClass}>{title}</h1>
      <ul className={tagCloudClass} role="list">
        {items.map(item => (
          <li key={item.href} className={tagCloudItemClass}>
            <a
              href={item.href}
              className={tagLinkClass}
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
