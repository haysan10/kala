/**
 * Google Drive Service
 * 
 * Handles file creation and synchronization with Google Drive.
 */

import { google } from 'googleapis';
import { env } from '../config/env.js';
import { db } from '../config/database.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export class GoogleDriveService {
    private oauth2Client;

    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
            env.GOOGLE_CALLBACK_URL
        );
    }

    /**
     * Set credentials for the user
     */
    async setCredentials(userId: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user || !user.googleAccessToken) {
            throw new Error('Google account not connected or access token missing');
        }

        this.oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken || undefined,
        });

        // Handle token refresh if needed
        this.oauth2Client.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                await db.update(users)
                    .set({
                        googleAccessToken: tokens.access_token,
                        ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {})
                    })
                    .where(eq(users.id, userId));
            }
        });
    }

    /**
     * List folders in Google Drive
     */
    async listFolders(parentId?: string) {
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
        const query = [
            "mimeType = 'application/vnd.google-apps.folder'",
            "trashed = false",
            parentId ? `'${parentId}' in parents` : "'root' in parents"
        ].join(' and ');

        try {
            const response = await drive.files.list({
                q: query,
                fields: 'files(id, name)',
                spaces: 'drive',
            });
            return response.data.files;
        } catch (error: any) {
            console.error('Google Drive List Folders Error:', error);
            throw new Error(`Failed to list folders: ${error.message}`);
        }
    }

    /**
     * Get or create a specific folder by name
     */
    async getOrCreateFolder(name: string, parentId?: string) {
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

        // Check if exists
        const query = [
            `name = '${name}'`,
            "mimeType = 'application/vnd.google-apps.folder'",
            "trashed = false",
            parentId ? `'${parentId}' in parents` : "'root' in parents"
        ].join(' and ');

        const existing = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
        });

        if (existing.data.files && existing.data.files.length > 0) {
            return existing.data.files[0];
        }

        // Create new
        const fileMetadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            ...(parentId ? { parents: [parentId] } : {}),
        };

        const folder = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name',
        });

        return folder.data;
    }

    /**
     * Create a Markdown file on Google Drive
     */
    async createMarkdownFile(name: string, content: string, parentId?: string) {
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

        const fileMetadata = {
            name: `${name}.md`,
            mimeType: 'text/markdown',
            ...(parentId ? { parents: [parentId] } : {}),
        };

        const media = {
            mimeType: 'text/markdown',
            body: content,
        };

        try {
            const response = await drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, webViewLink',
            });
            return response.data;
        } catch (error: any) {
            console.error('Google Drive Create Error:', error);
            throw new Error(`Failed to create file on Google Drive: ${error.message}`);
        }
    }
}

export const googleDriveService = new GoogleDriveService();
