/**
 * Vercel Serverless Function Entry Point
 * This file serves as the entry point for all API routes
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/src/app';

// Export handler for Vercel serverless
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Rewrite the path to match Express routes
        // Vercel sends /api/xyz to this handler, Express expects /api/xyz
        if (!req.url?.startsWith('/api')) {
            req.url = `/api${req.url}`;
        }
        
        // Handle the request with Express app
        app(req, res);
    } catch (error) {
        console.error('Error in API handler:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
