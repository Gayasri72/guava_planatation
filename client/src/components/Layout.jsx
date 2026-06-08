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

// Shown directly in the mobile bottom tab bar; the rest go in the "More" sheet.
const mobilePrimary = ['/', '/batches', '/batches/new', '/harvests'];

export default function Layout() {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);

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

  const primaryItems = navItems.filter((i) => mobilePrimary.includes(i.to));
  const moreItems = navItems.filter((i) => !mobilePrimary.includes(i.to));

  return (
    <div className="min-h-screen md:flex bg-slate-50">
      {/* ---------- Desktop sidebar ---------- */}
      <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 flex-col">
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

      {/* ---------- Mobile top bar ---------- */}
      <header className="md:hidden sticky top-0 z-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 h-14">
        <div className="text-lg font-bold text-guava-700">🌱 Guava Tracker</div>
        <NavLink to="/notifications" className="relative p-2 -mr-2">
          <span className="text-xl">🔔</span>
          {unread > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] leading-none rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </NavLink>
      </header>

      {/* ---------- Main content ---------- */}
      <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-x-hidden">
        <Outlet />
      </main>

      {/* ---------- Mobile bottom tab bar ---------- */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-200 safe-bottom">
        <div className="grid grid-cols-5">
          {primaryItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 text-[11px] gap-0.5 ${
                  isActive ? 'text-guava-700' : 'text-slate-500'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span className="leading-none">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center py-2 text-[11px] gap-0.5 text-slate-500"
          >
            <span className="text-xl relative">
              ☰
              {unread > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] leading-none rounded-full w-2 h-2" />
              )}
            </span>
            <span className="leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* ---------- Mobile "More" sheet ---------- */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-30" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl p-4 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center justify-center gap-1 p-4 rounded-lg bg-slate-50 active:bg-slate-100"
                >
                  <span className="text-2xl relative">
                    {item.icon}
                    {item.to === '/notifications' && unread > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] leading-none rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-700">{item.label}</span>
                </NavLink>
              ))}
            </div>
            <button onClick={logout} className="btn-secondary w-full mt-4">
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
