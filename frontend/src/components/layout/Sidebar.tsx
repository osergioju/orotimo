import { NavLink } from 'react-router-dom'

export interface SidebarItem {
  label: string
  to: string
  end?: boolean
}

export interface SidebarSection {
  title?: string
  items: SidebarItem[]
}

interface SidebarProps {
  brand: string
  sections: SidebarSection[]
}

export function Sidebar({ brand, sections }: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-brand-divider bg-white">
      <div className="flex h-16 items-center border-b border-brand-divider px-6">
        <span className="font-display text-base font-semibold text-brand-ink">{brand}</span>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {sections.map((section, index) => (
          <div key={section.title ?? index}>
            {section.title && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-brand-ink-soft/70">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? 'bg-brand-canvas text-brand-primary' : 'text-brand-ink-soft hover:bg-brand-muted'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
