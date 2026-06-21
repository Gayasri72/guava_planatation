import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import ColorBadge from '../components/ColorBadge.jsx';
import { useToast } from '../components/Toast.jsx';
import { usePalette } from '../components/Palette.jsx';

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function NewBatch() {
  const navigate = useNavigate();
  const toast = useToast();
  const { palette } = usePalette();
  const [settings, setSettings] = useState(null);
  const [allTrees, setAllTrees] = useState([]);
  const [color, setColor] = useState('red');
  const [baggedDate, setBaggedDate] = useState(todayIso());
  const [days, setDays] = useState(90);
  const [defaultFruits, setDefaultFruits] = useState(5);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState({}); // treeCode -> fruitCount
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const [s, t] = await Promise.all([api.get('/settings'), api.get('/trees')]);
      setSettings(s.data);
      setDays(s.data.defaultHarvestDays);
      setAllTrees(t.data);
    })();
  }, []);

  const filteredTrees = allTrees.filter((t) =>
    search ? t.treeCode.toLowerCase().includes(search.toLowerCase()) : true
  );

  function toggleTree(code) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[code] != null) delete next[code];
      else next[code] = defaultFruits;
      return next;
    });
  }

  function setFruit(code, n) {
    setSelected((prev) => ({ ...prev, [code]: Number(n) }));
  }

  const selectedCount = Object.keys(selected).length;
  const totalFruits = Object.values(selected).reduce((a, b) => a + b, 0);

  const expected = new Date(baggedDate);
  expected.setDate(expected.getDate() + Number(days));

  async function submit() {
    if (selectedCount === 0) return toast.error('Select at least one tree');
    setSubmitting(true);
    try {
      const trees = Object.entries(selected).map(([treeCode, fruitCount]) => ({
        treeCode,
        fruitCount,
      }));
      const r = await api.post('/batches', {
        color,
        baggedDate,
        harvestDurationDays: Number(days),
        trees,
        notes,
      });
      toast.success('Batch created');
      navigate(`/batches/${r.data._id}`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-slate-800">➕ New Batch</h1>

      <div className="card grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="label">Bag color</label>
          <div className="flex gap-2 flex-wrap">
            {palette.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                className={`px-3 py-2 rounded-md border text-sm flex items-center gap-2 ${
                  color === c.name ? 'border-guava-600 bg-guava-50' : 'border-slate-200'
                }`}
              >
                <ColorBadge color={c.name} /> {c.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Bagged date</label>
          <input
            type="date"
            className="input"
            value={baggedDate}
            onChange={(e) => setBaggedDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Harvest days</label>
          <input
            type="number"
            min="1"
            className="input"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          <div className="text-xs text-slate-500 mt-1">
            Expected harvest: {expected.toLocaleDateString()}
          </div>
        </div>
        <div>
          <label className="label">Default fruits/tree</label>
          <input
            type="number"
            min="1"
            className="input"
            value={defaultFruits}
            onChange={(e) => setDefaultFruits(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3 gap-3">
          <input
            className="input max-w-xs"
            placeholder="Search tree code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="text-sm text-slate-600">
            <strong>{selectedCount}</strong> trees · <strong>{totalFruits}</strong> fruits
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-96 overflow-y-auto">
          {filteredTrees.slice(0, 400).map((t) => {
            const isSel = selected[t.treeCode] != null;
            return (
              <div
                key={t._id}
                className={`border rounded p-2 text-center text-xs cursor-pointer ${
                  isSel ? 'border-guava-600 bg-guava-50' : 'border-slate-200'
                }`}
                onClick={() => toggleTree(t.treeCode)}
              >
                <div className="font-medium">{t.treeCode}</div>
                {isSel && (
                  <input
                    type="number"
                    min="1"
                    className="w-full mt-1 border border-slate-300 rounded px-1 text-center"
                    value={selected[t.treeCode]}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setFruit(t.treeCode, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
        {filteredTrees.length > 400 && (
          <div className="text-xs text-slate-500 mt-2">
            Showing first 400 — refine search to see more
          </div>
        )}
      </div>

      <div className="card">
        <label className="label">Notes (optional)</label>
        <textarea
          className="input"
          rows="2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary sm:w-auto">
          Cancel
        </button>
        <button onClick={submit} disabled={submitting} className="btn-primary sm:w-auto">
          {submitting ? 'Saving...' : `Save Batch (${selectedCount} trees)`}
        </button>
      </div>
    </div>
  );
}
