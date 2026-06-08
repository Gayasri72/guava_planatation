import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function Notifications() {
  const [items, setItems] = useState([]);

  async function load() {
    const r = await api.get('/notifications');
    setItems(r.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    await api.post('/notifications/read-all');
    load();
  }

  async function runCheck() {
    await api.post('/dev/run-check');
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">🔔 Notifications</h1>
        <div className="grid grid-cols-2 sm:flex gap-2">
          <button onClick={runCheck} className="btn-secondary text-xs sm:text-sm">
            Run check now
          </button>
          <button onClick={markAll} className="btn-secondary text-xs sm:text-sm">
            Mark all read
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="card text-center text-slate-500 py-8">No notifications</div>
        ) : (
          items.map((n) => (
            <div
              key={n._id}
              className={`card flex items-start gap-3 ${
                n.read ? 'opacity-60' : 'border-l-4 border-l-orange-400'
              }`}
            >
              <div className="text-2xl">🔔</div>
              <div className="flex-1">
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-slate-600">{n.message}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(n.sentAt).toLocaleString()} ·{' '}
                  {n.channels?.join(', ')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
