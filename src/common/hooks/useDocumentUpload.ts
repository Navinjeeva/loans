import { useState, useCallback } from 'react';
import {
  documentUploadManager,
  UploadProgress,
} from '@src/common/utils/documentUploadManager';
import { logErr } from '@src/common/utils/logger';

/**
 * Custom hook for document upload with IDP extraction
 * Handles upload queuing, progress tracking, and response mapping
 */

interface UseDocumentUploadProps {
  applicationId: string;
  screenId?: string;
  deviceId?: string;
}

interface UploadState {
  [key: string]: {
    // key format: `${screenId}_${index}`
    isUploading: boolean;
    progress?: UploadProgress;
    error?: string;
  };
}

export const useDocumentUpload = ({
  applicationId,
  screenId = 'PERSONAL_DOCUMENTS',
  deviceId = 'MOBILE_DEVICE',
}: UseDocumentUploadProps) => {
  const [uploadStates, setUploadStates] = useState<UploadState>({});

  /**
   * Upload a document and extract data
   */
  const uploadDocument = useCallback(
    (
      document: any,
      index: number,
      onSuccess?: (data: any, taskId: string) => void,
      onError?: (error: Error, taskId: string) => void,
    ) => {
      const stateKey = `${screenId}_${index}`;

      // Set uploading state
      setUploadStates(prev => ({
        ...prev,
        [stateKey]: {
          isUploading: true,
          progress: { status: 'queued', message: 'Queued for upload' },
        },
      }));

      // Queue the upload
      const taskId = documentUploadManager.queueUpload(
        document,
        applicationId,
        index,
        screenId,
        deviceId,
        // Progress callback
        progress => {
          setUploadStates(prev => ({
            ...prev,
            [stateKey]: {
              isUploading: progress.status !== 'completed',
              progress,
            },
          }));
        },
        // Success callback
        (data, taskId) => {
          setUploadStates(prev => ({
            ...prev,
            [stateKey]: {
              isUploading: false,
              progress: { status: 'completed', message: 'Upload completed' },
            },
          }));

          if (onSuccess) {
            onSuccess(data, taskId);
          }
        },
        // Error callback
        (error, taskId) => {
          setUploadStates(prev => ({
            ...prev,
            [stateKey]: {
              isUploading: false,
              error: error.message,
              progress: { status: 'error', message: error.message },
            },
          }));

          logErr(error);

          if (onError) {
            onError(error, taskId);
          }
        },
      );

      return taskId;
    },
    [applicationId, screenId, deviceId],
  );

  /**
   * Get upload state for a specific document
   */
  const getUploadState = useCallback(
    (index: number) => {
      const stateKey = `${screenId}_${index}`;
      return uploadStates[stateKey];
    },
    [uploadStates, screenId],
  );

  /**
   * Check if any uploads are in progress
   */
  const hasActiveUploads = useCallback(() => {
    return Object.values(uploadStates).some(state => state.isUploading);
  }, [uploadStates]);

  /**
   * Get stored result for a document
   */
  const getResult = useCallback(
    (index: number) => {
      return documentUploadManager.getResult(screenId, index);
    },
    [screenId],
  );

  /**
   * Clear result for a specific document
   */
  const clearResult = useCallback(
    (index: number) => {
      documentUploadManager.clearResult(screenId, index);
    },
    [screenId],
  );

  /**
   * Get upload statistics
   */
  const getStats = useCallback(() => {
    return documentUploadManager.getStats();
  }, []);

  return {
    uploadDocument,
    getUploadState,
    hasActiveUploads,
    getResult,
    clearResult,
    getStats,
    uploadStates,
  };
};
