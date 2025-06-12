import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/environment.js';

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupMiddleware(app: Application): void {
  // CORS middleware
  app.use(cors());
  
  // JSON parsing middleware with increased limit for PDF uploads
  app.use(express.json({ limit: config.server.jsonLimit }));
  
  // Static file serving for the built client
  app.use(express.static(path.join(__dirname, '../../../dist')));
} 