import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Tree from '../models/Tree.js';
import Batch from '../models/Batch.js';
import { ensureFarmerAccount } from './bootstrap.js';

const TREE_COUNT = 1000;
const PLOTS = ['A', 'B', 'C', 'D'];

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

async function seed() {
  await connectDB();
  await ensureFarmerAccount();

  const existing = await Tree.countDocuments();
  if (existing >= TREE_COUNT) {
    console.log(`✓ ${existing} trees already exist — skipping tree seed`);
  } else {
    const trees = [];
    for (let i = 1; i <= TREE_COUNT; i++) {
      const plot = PLOTS[Math.floor((i - 1) / (TREE_COUNT / PLOTS.length))];
      trees.push({
        treeCode: `T-${String(i).padStart(4, '0')}`,
        variety: 'Thai Guava',
        plantedDate: new Date(2022, 0, 1),
        location: {
          plot,
          row: Math.ceil(i / 10),
          position: ((i - 1) % 10) + 1,
        },
      });
    }
    await Tree.insertMany(trees);
    console.log(`✓ Inserted ${trees.length} trees`);
  }

  // Sample batches mimicking the real-world scenario
  const allTrees = await Tree.find({ status: 'active' }).limit(500);
  const samples = [
    { color: 'red', daysAgo: 83, treeCount: 120, fruitMin: 3, fruitMax: 8 },
    { color: 'yellow', daysAgo: 76, treeCount: 85, fruitMin: 2, fruitMax: 7 },
    { color: 'blue', daysAgo: 69, treeCount: 60, fruitMin: 2, fruitMax: 6 },
    { color: 'green', daysAgo: 62, treeCount: 95, fruitMin: 3, fruitMax: 9 },
  ];

  await Batch.deleteMany({ batchCode: /^(RED|YELLOW|BLUE|GREEN)-/ });

  for (const s of samples) {
    const baggedDate = addDays(new Date(), -s.daysAgo);
    const picked = allTrees
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, s.treeCount);
    const trees = picked.map((t) => ({
      treeId: t._id,
      treeCode: t.treeCode,
      fruitCount: Math.floor(Math.random() * (s.fruitMax - s.fruitMin + 1)) + s.fruitMin,
    }));
    const d = baggedDate;
    const code = `${s.color.toUpperCase()}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    await Batch.create({
      batchCode: code,
      color: s.color,
      baggedDate,
      harvestDurationDays: 90,
      expectedHarvestDate: addDays(baggedDate, 90),
      trees,
    });
    console.log(`✓ Seeded batch ${code} (${trees.length} trees)`);
  }

  await mongoose.disconnect();
  console.log('✓ Seed complete');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
