import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function Harvests() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    (async () => {
      const [r, s] = await Promise.all([api.get('/harvests'), api.get('/harvests/summary')]);
      setRecords(r.data);
      setSummary(s.data);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Harvest Records</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Harvests" value={summary.count || 0} />
        <Stat label="Total fruits" value={summary.totalFruits || 0} />
        <Stat label="Total weight" value={`${(summary.totalWeight || 0).toFixed(1)} kg`} />
        <Stat label="Total revenue" value={`Rs ${(summary.totalRevenue || 0).toLocaleString()}`} />
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Batch</th>
              <th className="py-2 px-3">Fruits</th>
              <th className="py-2 px-3">Weight</th>
              <th className="py-2 px-3">Grade</th>
              <th className="py-2 px-3">Price/kg</th>
              <th className="py-2 px-3">Revenue</th>
              <th className="py-2 px-3">Buyer</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="py-2 px-3">{new Date(r.harvestDate).toLocaleDateString()}</td>
                <td className="py-2 px-3 font-mono text-xs">{r.batchId}</td>
                <td className="py-2 px-3">{r.fruitsHarvested}</td>
                <td className="py-2 px-3">{r.weightKg} kg</td>
                <td className="py-2 px-3">{r.qualityGrade}</td>
                <td className="py-2 px-3">{r.pricePerKg ? `Rs ${r.pricePerKg}` : '—'}</td>
                <td className="py-2 px-3">{r.revenue ? `Rs ${r.revenue.toLocaleString()}` : '—'}</td>
                <td className="py-2 px-3">{r.buyer || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <div className="text-center text-slate-500 py-8">No harvests logged yet</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <div className="text-xs text-slate-500 uppercase">{label}</div>
      <div className="text-2xl font-bold text-slate-800 mt-1">{value}</div>
    </div>
  );
}
