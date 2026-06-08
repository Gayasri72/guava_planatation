import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import ColorBadge from '../components/ColorBadge.jsx';

function daysUntil(date) {
  const ms = new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [treeStats, setTreeStats] = useState({ total: 0 });
  const [summary, setSummary] = useState({ totalFruits: 0, totalWeight: 0, totalRevenue: 0 });

  useEffect(() => {
    (async () => {
      const [b, t, s] = await Promise.all([
        api.get('/batches', { params: { status: 'bagged' } }),
        api.get('/trees/stats'),
        api.get('/harvests/summary'),
      ]);
      setBatches(b.data);
      setTreeStats(t.data);
      setSummary(s.data);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">
          {formatDate(new Date())} — overview of your plantation
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Active Trees" value={treeStats.total} icon="🌳" />
        <StatCard label="Active Batches" value={batches.length} icon="🎨" />
        <StatCard
          label="Lifetime Harvest"
          value={`${(summary.totalWeight || 0).toFixed(1)} kg`}
          icon="🧺"
        />
        <StatCard
          label="Lifetime Revenue"
          value={`Rs ${(summary.totalRevenue || 0).toLocaleString()}`}
          icon="💰"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-800">Active Batches</h2>
          <Link to="/batches/new" className="btn-primary">
            ➕ New Batch
          </Link>
        </div>
        {batches.length === 0 ? (
          <div className="card text-center text-slate-500 py-8">
            No active batches yet — create one to start tracking.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((b) => {
              const days = daysUntil(b.expectedHarvestDate);
              const urgency =
                days <= 1
                  ? 'text-red-600 font-bold'
                  : days <= 7
                  ? 'text-orange-600 font-semibold'
                  : 'text-slate-600';
              return (
                <Link
                  key={b._id}
                  to={`/batches/${b._id}`}
                  className="card hover:shadow-md transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ColorBadge color={b.color} size="lg" />
                    <div className="font-semibold uppercase">{b.color}</div>
                    <div className="text-xs text-slate-500 ml-auto">{b.batchCode}</div>
                  </div>
                  <div className={`text-sm ${urgency}`}>
                    {days < 0
                      ? `Overdue by ${-days} days`
                      : days === 0
                      ? 'Harvest today!'
                      : `Harvest in ${days} days`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatDate(b.expectedHarvestDate)}
                  </div>
                  <div className="mt-3 text-sm flex justify-between text-slate-700">
                    <span>🌳 {b.trees.length} trees</span>
                    <span>🍈 {b.totalFruits} fruits</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card">
      <div className="text-2xl">{icon}</div>
      <div className="text-2xl font-bold mt-1 text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 uppercase mt-1">{label}</div>
    </div>
  );
}
