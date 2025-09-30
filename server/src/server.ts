import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/environment.js';
import { setupMiddleware } from './middleware/index.js';
import apiRoutes from './routes/index.js';
import * as Sentry from '@sentry/node';

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  sendDefaultPii: true,
  enableLogs: true,
  integrations: [
    Sentry.expressIntegration(),
    Sentry.consoleLoggingIntegration({ levels: ['error','warn'] }),
  ],
});

const app = express();

// Setup middleware
setupMiddleware(app);

// API routes
app.use('/api', apiRoutes);

// Explicitly handle the auth callback route
app.get('/auth/callback', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

// Fallback route to serve the SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

// Dev-only route to verify Sentry captures server errors
if (process.env.NODE_ENV !== 'production') {
  app.get('/debug-sentry', () => {
    throw new Error('Sentry server test');
  });
}

// Register Sentry error handler for Express (v10 API)
Sentry.setupExpressErrorHandler(app);

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

// Export for Vercel serverless functions
export default app; 