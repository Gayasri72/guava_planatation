import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function Settings() {
  const [s, setS] = useState(null);

  useEffect(() => {
    api.get('/settings').then((r) => setS(r.data));
  }, []);

  if (!s) return <div>Loading...</div>;

  async function save() {
    const r = await api.patch('/settings', s);
    setS(r.data);
    alert('Saved ✓');
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl md:text-2xl font-bold text-slate-800">⚙️ Settings</h1>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Harvest defaults</h2>
        <div>
          <label className="label">Default harvest days (after bagging)</label>
          <input
            type="number"
            className="input w-32"
            value={s.defaultHarvestDays}
            onChange={(e) => setS({ ...s, defaultHarvestDays: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="label">Notification lead days (comma-separated)</label>
          <input
            className="input"
            value={s.leadDays.join(',')}
            onChange={(e) =>
              setS({ ...s, leadDays: e.target.value.split(',').map((n) => Number(n.trim())) })
            }
          />
          <div className="text-xs text-slate-500 mt-1">
            e.g., 7,3,1 = notify 7 days, 3 days, and 1 day before harvest
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Contact & channels</h2>

        <div>
          <label className="label">Recipient emails (harvest alerts go to all of these)</label>
          <div className="space-y-2">
            {(s.contact?.emails || []).map((email, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="email"
                  className="input"
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(e) => {
                    const emails = [...(s.contact?.emails || [])];
                    emails[i] = e.target.value;
                    setS({ ...s, contact: { ...s.contact, emails } });
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const emails = (s.contact?.emails || []).filter((_, j) => j !== i);
                    setS({ ...s, contact: { ...s.contact, emails } });
                  }}
                  className="btn-secondary px-3 shrink-0"
                  aria-label="Remove email"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              setS({ ...s, contact: { ...s.contact, emails: [...(s.contact?.emails || []), ''] } })
            }
            className="text-sm text-guava-600 font-medium mt-2"
          >
            + Add email
          </button>
        </div>

        <div>
          <label className="label">Phone (E.164, e.g., +94771234567)</label>
          <input
            className="input"
            value={s.contact?.phone || ''}
            onChange={(e) => setS({ ...s, contact: { ...s.contact, phone: e.target.value } })}
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          {['email', 'sms', 'whatsapp', 'inApp'].map((ch) => (
            <label key={ch} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.channels?.[ch] || false}
                onChange={(e) =>
                  setS({ ...s, channels: { ...s.channels, [ch]: e.target.checked } })
                }
              />
              {ch}
            </label>
          ))}
        </div>
      </div>

      <button onClick={save} className="btn-primary w-full sm:w-auto">
        Save settings
      </button>
    </div>
  );
}
