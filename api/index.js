/**
 * KALA API - Vercel Serverless Function Entry Point
 * This file serves as the entry point for all backend API routes
 * Deployed as a Vercel Serverless Function
 */


import app from '../backend/dist/app.js';

/**
 * Main serverless function handler
 * Handles all requests to /api/* and /health
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Add request metadata for logging
        const startTime = Date.now();
        
        console.log(`[API] ${req.method} ${req.url} - Started`);
        
        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        
        // Normalize URL path
        // Vercel sends /api/xyz, Express expects /api/xyz
        let url = req.url || '/';
        
        // If the URL doesn't start with /api or /health, prepend /api
        if (!url.startsWith('/api') && !url.startsWith('/health')) {
            url = '/api' + url;
        }
        
        // Update request URL
        req.url = url;
        
        // Handle the request with Express app
        // Express will handle routing, middleware, and responses
        await new Promise<void>((resolve, reject) => {
            app(req, res);
            
            // Listen for response finish
            res.on('finish', () => {
                const duration = Date.now() - startTime;
                console.log(`[API] ${req.method} ${url} - ${res.statusCode} (${duration}ms)`);
                resolve();
            });
            
            // Listen for errors
            res.on('error', (error) => {
                console.error(`[API] ${req.method} ${url} - Error:`, error);
                reject(error);
            });
        });
        
    } catch (error) {
        // Catch any uncaught errors
        console.error('[API] Unhandled error in serverless function:', error);
        
        // Only send error response if headers haven't been sent
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Unknown error',
                requestId: req.headers['x-vercel-id'] || 'unknown'
            });
        }
    }
}
