import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import ColorBadge from '../components/ColorBadge.jsx';

function daysUntil(date) {
  const ms = new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [days, setDays] = useState(90);
  const [showHarvest, setShowHarvest] = useState(false);
  const [harvest, setHarvest] = useState({
    fruitsHarvested: 0,
    weightKg: 0,
    qualityGrade: 'A',
    pricePerKg: 0,
    buyer: '',
    notes: '',
  });

  async function load() {
    const r = await api.get(`/batches/${id}`);
    setBatch(r.data);
    setDays(r.data.harvestDurationDays);
    setHarvest((h) => ({ ...h, fruitsHarvested: r.data.totalFruits }));
  }

  useEffect(() => {
    load();
  }, [id]);

  if (!batch) return <div>Loading...</div>;

  async function saveDays() {
    await api.patch(`/batches/${batch._id}`, { harvestDurationDays: Number(days) });
    load();
  }

  async function submitHarvest() {
    await api.post('/harvests', { batchId: batch._id, ...harvest });
    alert('Harvest logged ✓');
    navigate('/harvests');
  }

  const dleft = daysUntil(batch.expectedHarvestDate);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:underline">
        ← Back
      </button>

      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <ColorBadge color={batch.color} size="lg" />
          <h1 className="text-2xl font-bold uppercase">{batch.color} Batch</h1>
          <span className="ml-auto text-sm text-slate-500">{batch.batchCode}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Stat label="Bagged" value={new Date(batch.baggedDate).toLocaleDateString()} />
          <Stat
            label="Expected harvest"
            value={new Date(batch.expectedHarvestDate).toLocaleDateString()}
          />
          <Stat
            label="Days left"
            value={
              batch.status === 'harvested'
                ? 'Harvested'
                : dleft < 0
                ? `${-dleft}d overdue`
                : `${dleft} days`
            }
          />
          <Stat label="Status" value={batch.status} />
          <Stat label="Trees" value={batch.trees.length} />
          <Stat label="Total fruits" value={batch.totalFruits} />
        </div>

        {batch.status !== 'harvested' && (
          <div className="mt-4 flex items-end gap-3 border-t border-slate-100 pt-4">
            <div>
              <label className="label">Adjust harvest duration (days)</label>
              <input
                type="number"
                className="input w-32"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
            <button onClick={saveDays} className="btn-secondary">
              Save
            </button>
            <div className="ml-auto">
              <button onClick={() => setShowHarvest((v) => !v)} className="btn-primary">
                🧺 Log Harvest
              </button>
            </div>
          </div>
        )}
      </div>

      {showHarvest && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Log Harvest</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Fruits picked">
              <input
                type="number"
                className="input"
                value={harvest.fruitsHarvested}
                onChange={(e) =>
                  setHarvest({ ...harvest, fruitsHarvested: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Weight (kg)">
              <input
                type="number"
                step="0.1"
                className="input"
                value={harvest.weightKg}
                onChange={(e) => setHarvest({ ...harvest, weightKg: Number(e.target.value) })}
              />
            </Field>
            <Field label="Quality">
              <select
                className="input"
                value={harvest.qualityGrade}
                onChange={(e) => setHarvest({ ...harvest, qualityGrade: e.target.value })}
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>Mixed</option>
              </select>
            </Field>
            <Field label="Price per kg (Rs)">
              <input
                type="number"
                className="input"
                value={harvest.pricePerKg}
                onChange={(e) => setHarvest({ ...harvest, pricePerKg: Number(e.target.value) })}
              />
            </Field>
            <Field label="Buyer">
              <input
                className="input"
                value={harvest.buyer}
                onChange={(e) => setHarvest({ ...harvest, buyer: e.target.value })}
              />
            </Field>
            <Field label="Notes">
              <input
                className="input"
                value={harvest.notes}
                onChange={(e) => setHarvest({ ...harvest, notes: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <button onClick={submitHarvest} className="btn-primary">
              Save Harvest
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Trees in this batch ({batch.trees.length})</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-96 overflow-y-auto">
          {batch.trees.map((t) => (
            <div key={t.treeCode} className="border border-slate-200 rounded p-2 text-center text-xs">
              <div className="font-medium">{t.treeCode}</div>
              <div className="text-slate-500">🍈 {t.fruitCount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-500 uppercase">{label}</div>
      <div className="font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
