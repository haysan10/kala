/**
 * Vercel Serverless Function Entry Point
 * This file serves as the entry point for all API routes
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Dynamically import the backend app
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Import the Express app
        const { default: app } = await import('../backend/dist/app.js');
        
        // Rewrite the path to match Express routes
        // Vercel sends /api/xyz to api/index.ts, but Express expects /api/xyz
        const originalUrl = req.url;
        
        // If URL doesn't start with /api, prepend it
        if (!req.url?.startsWith('/api')) {
            req.url = `/api${req.url}`;
        }
        
        // Handle the request
        app(req, res);
    } catch (error) {
        console.error('Error in API handler:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
