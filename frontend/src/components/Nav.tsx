import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
  }`

export function Nav() {
  const { user, logout } = useAuth()

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="mr-3 text-sm font-semibold text-gray-900">DeltaT</span>
          <NavLink to="/" end className={linkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/contracts" className={linkClasses}>
            Verträge
          </NavLink>
          <NavLink to="/entries" className={linkClasses}>
            Zeiteinträge
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-gray-500">{user.email}</span>}
          <button
            onClick={logout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
