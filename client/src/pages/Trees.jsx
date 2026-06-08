import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function Trees() {
  const [trees, setTrees] = useState([]);
  const [search, setSearch] = useState('');
  const [plot, setPlot] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ treeCode: '', variety: 'Thai Guava', location: { plot: 'A' } });

  async function load() {
    const r = await api.get('/trees', { params: { search, plot } });
    setTrees(r.data);
  }

  useEffect(() => {
    load();
  }, [search, plot]);

  async function addTree(e) {
    e.preventDefault();
    await api.post('/trees', form);
    setForm({ treeCode: '', variety: 'Thai Guava', location: { plot: 'A' } });
    setShowAdd(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trees</h1>
          <p className="text-sm text-slate-500">{trees.length} trees shown</p>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} className="btn-primary">
          ➕ Add Tree
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addTree} className="card grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="label">Tree code</label>
            <input
              className="input"
              required
              value={form.treeCode}
              onChange={(e) => setForm({ ...form, treeCode: e.target.value })}
              placeholder="T-1001"
            />
          </div>
          <div>
            <label className="label">Variety</label>
            <input
              className="input"
              value={form.variety}
              onChange={(e) => setForm({ ...form, variety: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Plot</label>
            <input
              className="input"
              value={form.location.plot}
              onChange={(e) => setForm({ ...form, location: { ...form.location, plot: e.target.value } })}
            />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full">Save</button>
          </div>
        </form>
      )}

      <div className="flex gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search by tree code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-xs" value={plot} onChange={(e) => setPlot(e.target.value)}>
          <option value="">All plots</option>
          <option value="A">Plot A</option>
          <option value="B">Plot B</option>
          <option value="C">Plot C</option>
          <option value="D">Plot D</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 px-3">Code</th>
              <th className="py-2 px-3">Variety</th>
              <th className="py-2 px-3">Plot</th>
              <th className="py-2 px-3">Row</th>
              <th className="py-2 px-3">Position</th>
              <th className="py-2 px-3">Planted</th>
            </tr>
          </thead>
          <tbody>
            {trees.slice(0, 200).map((t) => (
              <tr key={t._id} className="border-t border-slate-100">
                <td className="py-2 px-3 font-medium">{t.treeCode}</td>
                <td className="py-2 px-3">{t.variety}</td>
                <td className="py-2 px-3">{t.location?.plot}</td>
                <td className="py-2 px-3">{t.location?.row}</td>
                <td className="py-2 px-3">{t.location?.position}</td>
                <td className="py-2 px-3">
                  {t.plantedDate ? new Date(t.plantedDate).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trees.length > 200 && (
          <div className="text-xs text-slate-500 mt-2">Showing first 200 of {trees.length}</div>
        )}
      </div>
    </div>
  );
}
