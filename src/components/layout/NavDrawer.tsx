import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/calendar', label: 'Calendar' },
  { to: '/events', label: 'Events' },
  { to: '/supplies', label: 'Supplies' },
  { to: '/contacts', label: 'Contacts' },
  { to: '/requests', label: 'Requests' },
  { to: '/bills', label: 'Bills' },
  { to: '/household', label: 'Household' },
]

export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <nav
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white p-4 shadow-xl transition-transform dark:bg-slate-900 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">Menu</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
