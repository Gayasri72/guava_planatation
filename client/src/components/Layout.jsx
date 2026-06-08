import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/client.js';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/batches', label: 'Batches', icon: '🎨' },
  { to: '/batches/new', label: 'New Batch', icon: '➕' },
  { to: '/trees', label: 'Trees', icon: '🌳' },
  { to: '/harvests', label: 'Harvests', icon: '🧺' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const r = await api.get('/notifications/unread-count');
        if (!cancelled) setUnread(r.data.count);
      } catch {}
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="text-xl font-bold text-guava-700">🌱 Guava Tracker</div>
          <div className="text-xs text-slate-500">Plantation harvest manager</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                  isActive
                    ? 'bg-guava-50 text-guava-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <span>
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </span>
              {item.to === '/notifications' && unread > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="m-3 btn-secondary">
          Logout
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
