import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import ColorBadge from '../components/ColorBadge.jsx';

function daysUntil(date) {
  const ms = new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [status, setStatus] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    (async () => {
      const r = await api.get('/batches', { params: { status, color } });
      setBatches(r.data);
    })();
  }, [status, color]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Batches</h1>
        <Link to="/batches/new" className="btn-primary">➕ New Batch</Link>
      </div>

      <div className="flex gap-3">
        <select className="input max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="bagged">Bagged</option>
          <option value="ready">Ready</option>
          <option value="harvested">Harvested</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="input max-w-xs" value={color} onChange={(e) => setColor(e.target.value)}>
          <option value="">All colors</option>
          {['red', 'yellow', 'blue', 'green', 'white', 'pink', 'orange', 'purple'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
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
            {batches.map((b) => {
              const days = daysUntil(b.expectedHarvestDate);
              return (
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
                  <td className="py-2 px-3">
                    {b.status === 'harvested' ? '—' : days < 0 ? `${-days}d overdue` : `${days}d`}
                  </td>
                  <td className="py-2 px-3">{b.trees.length}</td>
                  <td className="py-2 px-3">{b.totalFruits}</td>
                  <td className="py-2 px-3">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {batches.length === 0 && (
          <div className="text-center text-slate-500 py-8">No batches found</div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    bagged: 'bg-blue-100 text-blue-700',
    ready: 'bg-orange-100 text-orange-700',
    harvested: 'bg-green-100 text-green-700',
    partial: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-slate-200 text-slate-600',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs ${map[status] || 'bg-slate-100'}`}>{status}</span>
  );
}
