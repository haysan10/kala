/**
 * FileManager Page Component
 * 
 * Full file management interface combining FileExplorer and FilePreviewModal
 */

import React, { useState, useCallback } from 'react';
import FileExplorer from './FileExplorer';
import FilePreviewModal from './FilePreviewModal';
import { FileMetadata, storageApi } from '../services/storageApi';

interface FileManagerProps {
    assignmentId?: string;
}

const FileManager: React.FC<FileManagerProps> = ({ assignmentId }) => {
    return (
        <div className="h-[calc(100vh-200px)] min-h-[500px]">
            <FileExplorer
                assignmentId={assignmentId}
            />
        </div>
    );
};

export default FileManager;
