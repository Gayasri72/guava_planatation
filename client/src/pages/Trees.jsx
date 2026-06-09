import { useEffect, useState } from 'react';
import api from '../api/client.js';

// Solid fill + readable text for each bag color. A tree with no active bag
// shows as a dashed empty tile.
const COLOR_TILE = {
  red: 'bg-red-500 text-white border-red-600',
  yellow: 'bg-yellow-400 text-yellow-900 border-yellow-500',
  blue: 'bg-blue-500 text-white border-blue-600',
  green: 'bg-green-500 text-white border-green-600',
  white: 'bg-white text-slate-700 border-slate-300',
  pink: 'bg-pink-400 text-white border-pink-500',
  orange: 'bg-orange-500 text-white border-orange-600',
  purple: 'bg-purple-500 text-white border-purple-600',
};
const EMPTY_TILE = 'bg-slate-50 text-slate-400 border-slate-200 border-dashed';

const KNOWN_COLORS = ['red', 'yellow', 'blue', 'green', 'orange', 'pink', 'purple', 'white'];

function daysUntil(date) {
  if (!date) return null;
  const ms = new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function Trees() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [newRow, setNewRow] = useState('');
  const [newCount, setNewCount] = useState(10);
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await api.get('/trees/grid');
    setRows(r.data.rows);
    setTotal(r.data.total);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addRow(e) {
    e?.preventDefault();
    if (!newRow.trim()) return;
    setBusy(true);
    try {
      await api.post('/trees/add-row', { row: newRow.trim(), count: Number(newCount) || 1 });
      setNewRow('');
      setNewCount(10);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add row');
    } finally {
      setBusy(false);
    }
  }

  async function addTreeToRow(row) {
    setBusy(true);
    try {
      await api.post('/trees/add-row', { row, count: 1 });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeTree(tree) {
    if (!confirm(`Remove tree ${tree.treeCode}?`)) return;
    setBusy(true);
    try {
      await api.delete(`/trees/${tree._id}`);
      setSelected(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 pb-28 md:pb-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">🌳 Plantation Map</h1>
          <p className="text-sm text-slate-500">{total} trees</p>
        </div>
      </div>

      {/* Add a row */}
      <form onSubmit={addRow} className="card grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="label">Row</label>
          <input
            className="input uppercase"
            placeholder="A"
            maxLength={3}
            value={newRow}
            onChange={(e) => setNewRow(e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <label className="label">Trees in row</label>
          <input
            type="number"
            min="1"
            className="input"
            value={newCount}
            onChange={(e) => setNewCount(e.target.value)}
          />
        </div>
        <div className="col-span-2 sm:col-span-2">
          <button disabled={busy} className="btn-primary w-full">
            ➕ Add row
          </button>
        </div>
      </form>

      {/* Legend */}
      <div className="card flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
        <span className="font-medium text-slate-500">Tile colour = soonest bag:</span>
        {KNOWN_COLORS.map((c) => (
          <span key={c} className="flex items-center gap-1.5">
            <span className={`inline-block w-4 h-4 rounded border ${COLOR_TILE[c]}`} />
            {c}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className={`inline-block w-4 h-4 rounded border ${EMPTY_TILE}`} />
          no bag
        </span>
      </div>

      {/* Rows */}
      {loading ? (
        <div className="card text-center text-slate-500 py-8">Loading map…</div>
      ) : rows.length === 0 ? (
        <div className="card text-center text-slate-500 py-8">
          No trees yet. Add your first row above (e.g. row <strong>A</strong> with 10 trees).
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(({ row, trees }) => (
            <div key={row} className="card">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-slate-800">
                  Row {row}{' '}
                  <span className="text-xs font-normal text-slate-400">({trees.length})</span>
                </div>
                <button
                  onClick={() => addTreeToRow(row)}
                  disabled={busy}
                  className="text-xs text-guava-600 font-medium px-2 py-1 rounded hover:bg-guava-50"
                >
                  + Tree
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {trees.map((t) => {
                  const cls = t.color ? COLOR_TILE[t.color] || 'bg-slate-400 text-white border-slate-500' : EMPTY_TILE;
                  const isSel = selected?._id === t._id;
                  return (
                    <button
                      key={t._id}
                      onClick={() => setSelected(isSel ? null : t)}
                      title={t.treeCode}
                      className={`w-14 h-14 rounded-md border flex items-center justify-center text-[11px] font-semibold leading-none px-0.5 text-center break-all ${cls} ${
                        isSel ? 'ring-2 ring-offset-1 ring-slate-800' : ''
                      }`}
                    >
                      {t.treeCode}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected tree action sheet */}
      {selected && (
        <div className="fixed bottom-20 md:bottom-4 left-0 right-0 px-4 z-40">
          <div className="card max-w-md mx-auto shadow-xl border flex items-center gap-3">
            <span
              className={`inline-block w-8 h-8 rounded border shrink-0 ${
                selected.color ? COLOR_TILE[selected.color] || 'bg-slate-400' : EMPTY_TILE
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800">{selected.treeCode}</div>
              <div className="text-xs text-slate-500 truncate">
                {selected.color
                  ? `${selected.color} bag · harvest ${new Date(
                      selected.expectedHarvestDate
                    ).toLocaleDateString()}${
                      daysUntil(selected.expectedHarvestDate) != null
                        ? ` (${daysUntil(selected.expectedHarvestDate)}d)`
                        : ''
                    }`
                  : 'No active bag'}
              </div>
            </div>
            <button
              onClick={() => removeTree(selected)}
              disabled={busy}
              className="text-xs font-medium text-red-600 px-3 py-2 rounded hover:bg-red-50 shrink-0"
            >
              Remove
            </button>
            <button
              onClick={() => setSelected(null)}
              className="text-slate-400 px-2 shrink-0"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
