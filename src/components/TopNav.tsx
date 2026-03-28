import { NavLink } from 'react-router-dom'

export default function TopNav() {
  return (
    <header className="w-full bg-slate-800 text-white">
      <div className="flex w-full items-center justify-between py-3">
        <div className="text-lg font-semibold tracking-tight">求人検索アプリ</div>
        <nav className="flex items-center gap-4 pr-4 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'text-white underline underline-offset-4' : 'text-slate-200 hover:text-white'
            }
          >
            求人検索
          </NavLink>
          <NavLink
            to="/post"
            className={({ isActive }) =>
              isActive ? 'text-white underline underline-offset-4' : 'text-slate-200 hover:text-white'
            }
          >
            求人投稿
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

