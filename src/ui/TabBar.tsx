import { NavLink } from 'react-router'
import { ROUTES } from '@/app/routes'

export function TabBar() {
  return (
    <nav
      aria-label="Secțiuni"
      className="fixed inset-x-0 bottom-0 z-10 bg-tab-bg text-tab-fg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex justify-around px-2 pt-2 pb-2">
        {ROUTES.map((r) => (
          <li key={r.path} className="flex-1">
            <NavLink
              to={r.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-bold uppercase tracking-wide ${isActive ? 'text-accent' : 'opacity-70'}`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-8 rounded-full ${isActive ? 'bg-accent' : 'bg-transparent'}`}
                  />
                  {r.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
