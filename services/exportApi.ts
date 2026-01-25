/**
 * Export API Service
 * 
 * Frontend API client for exporting data to external services.
 */

import api from './api';

export interface GoogleDriveExportResponse {
    message: string;
    fileId: string;
    link: string;
}

export interface GoogleDriveFolder {
    id: string;
    name: string;
}

export const listFolders = async (parentId?: string): Promise<GoogleDriveFolder[]> => {
    const response = await api.get<{ data: GoogleDriveFolder[] }>('/api/export/google-drive/folders', { params: { parentId } });
    return response.data.data;
};

export const exportToGoogleDrive = async (title: string, content: string, folderId?: string): Promise<GoogleDriveExportResponse> => {
    const response = await api.post<{ data: GoogleDriveExportResponse }>('/api/export/google-drive', { title, content, folderId });
    return response.data.data;
};

export const exportApi = {
    listFolders,
    exportToGoogleDrive,
};
