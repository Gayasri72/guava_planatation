// Vercel serverless entry point. An Express app is itself a (req, res)
// handler, so exporting it directly is all Vercel needs.
import app from '../src/app.js';

export default app;
