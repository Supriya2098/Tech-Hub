// Vercel serverless entry point. Vercel's @vercel/node builder detects an
// Express app exported as default from a file under /api and wraps it as a
// serverless function automatically - no extra adapter needed.
import { app } from '../apps/api/src/app';

export default app;
