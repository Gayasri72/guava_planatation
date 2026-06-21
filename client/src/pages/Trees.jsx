import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useToast } from '../components/Toast.jsx';
import { usePalette } from '../components/Palette.jsx';
import { textOn } from '../colors.js';

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
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [newRow, setNewRow] = useState('');
  const [newCount, setNewCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const { palette, hexFor } = usePalette();

  function tileStyle(color) {
    if (!color) return undefined;
    const hex = hexFor(color);
    return { backgroundColor: hex, color: textOn(hex), borderColor: 'rgba(0,0,0,0.12)' };
  }

  function select(tree) {
    setConfirmRemove(false);
    setSelected((cur) => (cur?._id === tree._id ? null : tree));
  }

  function closeSheet() {
    setConfirmRemove(false);
    setSelected(null);
  }

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
      const label = newRow.trim().toUpperCase();
      setNewRow('');
      setNewCount(10);
      await load();
      toast.success(`Added ${Number(newCount) || 1} tree(s) to row ${label}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add row');
    } finally {
      setBusy(false);
    }
  }

  async function addTreeToRow(row) {
    setBusy(true);
    try {
      await api.post('/trees/add-row', { row, count: 1 });
      await load();
      toast.success(`Added a tree to row ${row}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add tree');
    } finally {
      setBusy(false);
    }
  }

  async function removeTree(tree) {
    setBusy(true);
    try {
      await api.delete(`/trees/${tree._id}`);
      closeSheet();
      await load();
      toast.success(`Removed ${tree.treeCode}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove tree');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 pb-28 md:pb-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">🌳 Plantation Map</h1>
        <p className="text-sm text-slate-500">{total} trees</p>
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
        <div className="col-span-2">
          <button disabled={busy} className="btn-primary w-full">
            ➕ Add row
          </button>
        </div>
      </form>

      {/* Legend */}
      <div className="card flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-600">
        <span className="font-medium text-slate-500">Soonest bag:</span>
        {palette.map((c) => (
          <span key={c.name} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3.5 h-3.5 rounded border border-black/10"
              style={{ backgroundColor: c.hex }}
            />
            {c.name}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-3.5 rounded border border-dashed border-slate-300 bg-white" />
          none
        </span>
      </div>

      {/* The field map — one framed container, rows inside */}
      {loading ? (
        <div className="card text-center text-slate-500 py-8">Loading map…</div>
      ) : rows.length === 0 ? (
        <div className="card text-center text-slate-500 py-8">
          No trees yet. Add your first row above (e.g. row <strong>A</strong> with 10 trees).
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 text-sm">Field map</h2>
            <span className="text-xs text-slate-400">tap a tree for details</span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-max divide-y divide-emerald-100 bg-emerald-50/40">
              {rows.map(({ row, trees }) => (
                <div key={row} className="flex items-stretch">
                  {/* Sticky row label */}
                  <div className="sticky left-0 z-10 w-12 shrink-0 bg-white border-r border-slate-200 flex flex-col items-center justify-center">
                    <span className="font-bold text-slate-700 leading-none">{row}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{trees.length}</span>
                  </div>
                  {/* Tiles */}
                  <div className="flex items-center gap-1 px-2 py-2">
                    {trees.map((t) => {
                      const isSel = selected?._id === t._id;
                      return (
                        <button
                          key={t._id}
                          onClick={() => select(t)}
                          title={t.treeCode}
                          style={tileStyle(t.color)}
                          className={`shrink-0 w-8 h-8 rounded border flex items-center justify-center text-[10px] font-bold leading-none ${
                            t.color ? '' : 'bg-white text-slate-400 border-dashed border-slate-300'
                          } ${isSel ? 'ring-2 ring-offset-1 ring-slate-800' : ''}`}
                        >
                          {t.position ?? t.treeCode}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => addTreeToRow(row)}
                      disabled={busy}
                      title={`Add a tree to row ${row}`}
                      className="shrink-0 w-8 h-8 rounded border border-dashed border-emerald-400 text-emerald-500 flex items-center justify-center text-base leading-none hover:bg-emerald-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected tree action sheet */}
      {selected && (
        <div className="fixed bottom-20 md:bottom-4 left-0 right-0 px-4 z-40">
          <div className="card max-w-md mx-auto shadow-xl border flex items-center gap-3">
            <span
              className="inline-block w-8 h-8 rounded border border-black/10 shrink-0"
              style={{ backgroundColor: selected.color ? hexFor(selected.color) : '#fff' }}
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
            {confirmRemove ? (
              <button
                onClick={() => removeTree(selected)}
                disabled={busy}
                className="btn-danger text-xs px-3 min-h-0 py-2 shrink-0"
              >
                Confirm
              </button>
            ) : (
              <button
                onClick={() => setConfirmRemove(true)}
                disabled={busy}
                className="text-xs font-medium text-red-600 px-3 py-2 rounded hover:bg-red-50 shrink-0"
              >
                Remove
              </button>
            )}
            <button onClick={closeSheet} className="text-slate-400 px-2 shrink-0" aria-label="Close">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
