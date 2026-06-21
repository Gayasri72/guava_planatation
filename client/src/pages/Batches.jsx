import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import ColorBadge from '../components/ColorBadge.jsx';
import { usePalette } from '../components/Palette.jsx';

function daysUntil(date) {
  const ms = new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function daysLabel(b) {
  if (b.status === 'harvested') return '—';
  const d = daysUntil(b.expectedHarvestDate);
  return d < 0 ? `${-d}d overdue` : `${d}d`;
}

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [status, setStatus] = useState('');
  const [color, setColor] = useState('');
  const { palette } = usePalette();

  useEffect(() => {
    (async () => {
      const r = await api.get('/batches', { params: { status, color } });
      setBatches(r.data);
    })();
  }, [status, color]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Batches</h1>
        <Link to="/batches/new" className="btn-primary whitespace-nowrap">
          ➕ <span className="hidden sm:inline ml-1">New Batch</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md">
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="bagged">Bagged</option>
          <option value="ready">Ready</option>
          <option value="harvested">Harvested</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="input" value={color} onChange={(e) => setColor(e.target.value)}>
          <option value="">All colors</option>
          {palette.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {batches.length === 0 && (
        <div className="card text-center text-slate-500 py-8">No batches found</div>
      )}

      {/* ---------- Mobile: card list ---------- */}
      <div className="md:hidden space-y-3">
        {batches.map((b) => (
          <Link key={b._id} to={`/batches/${b._id}`} className="card block active:bg-slate-50">
            <div className="flex items-center gap-2">
              <ColorBadge color={b.color} size="lg" />
              <span className="font-semibold uppercase">{b.color}</span>
              <StatusBadge status={b.status} className="ml-auto" />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-slate-600">
              <div>
                <div className="text-xs text-slate-400">Days left</div>
                <div className="font-medium">{daysLabel(b)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Trees</div>
                <div className="font-medium">{b.trees.length}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Fruits</div>
                <div className="font-medium">{b.totalFruits}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Harvest {new Date(b.expectedHarvestDate).toLocaleDateString()} · {b.batchCode}
            </div>
          </Link>
        ))}
      </div>

      {/* ---------- Desktop: table ---------- */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 px-3">Color</th>
              <th className="py-2 px-3">Code</th>
              <th className="py-2 px-3">Bagged</th>
              <th className="py-2 px-3">Harvest</th>
              <th className="py-2 px-3">Days left</th>
              <th className="py-2 px-3">Trees</th>
              <th className="py-2 px-3">Fruits</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="py-2 px-3">
                  <Link to={`/batches/${b._id}`} className="flex items-center gap-2">
                    <ColorBadge color={b.color} /> {b.color}
                  </Link>
                </td>
                <td className="py-2 px-3">
                  <Link to={`/batches/${b._id}`} className="text-guava-700 underline">
                    {b.batchCode}
                  </Link>
                </td>
                <td className="py-2 px-3">{new Date(b.baggedDate).toLocaleDateString()}</td>
                <td className="py-2 px-3">
                  {new Date(b.expectedHarvestDate).toLocaleDateString()}
                </td>
                <td className="py-2 px-3">{daysLabel(b)}</td>
                <td className="py-2 px-3">{b.trees.length}</td>
                <td className="py-2 px-3">{b.totalFruits}</td>
                <td className="py-2 px-3">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status, className = '' }) {
  const map = {
    bagged: 'bg-blue-100 text-blue-700',
    ready: 'bg-orange-100 text-orange-700',
    harvested: 'bg-green-100 text-green-700',
    partial: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-slate-200 text-slate-600',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs ${map[status] || 'bg-slate-100'} ${className}`}>
      {status}
    </span>
  );
}
