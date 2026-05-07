import { Routes, Route, NavLink } from 'react-router-dom'
import Today from './screens/Today'
import Calendar from './screens/Calendar'
import Insights from './screens/Insights'
import Settings from './screens/Settings'
import BirthControl from './screens/BirthControl'

const tabs = [
  { to: '/', label: 'Today', icon: '🌸' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/insights', label: 'Insights', icon: '📊' },
  { to: '/birth-control', label: 'BC', icon: '💊' },
]

export default function App() {
  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-cream relative">
      <main className="flex-1 overflow-y-auto pb-16">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/birth-control" element={<BirthControl />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex">
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 text-xs font-semibold transition-colors ${
                isActive ? 'text-coral' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl leading-none mb-0.5">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
