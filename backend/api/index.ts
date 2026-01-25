/**
 * Vercel Serverless Function Entry Point
 * This file wraps the Express app for deployment on Vercel
 */

import app from '../src/app.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Export the Express app as a serverless function
export default async (req: VercelRequest, res: VercelResponse) => {
    // Handle the request using Express app
    return app(req, res);
};
