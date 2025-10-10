import { uploadAndExtractDocument } from './idpWebSocket';

/**
 * DocumentUploadManager - Centralized manager for handling parallel document uploads
 * Prevents network errors by managing concurrent uploads and queuing
 */

interface UploadTask {
  id: string;
  document: any;
  applicationId: string;
  indexOfDoc: number;
  screenId: string;
  deviceId: string;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess: (data: any, taskId: string) => void;
  onError: (error: Error, taskId: string) => void;
}

interface UploadProgress {
  status: 'queued' | 'uploading' | 'extracting' | 'completed' | 'error';
  message?: string;
}

interface ActiveUpload {
  taskId: string;
  promise: Promise<any>;
}

class DocumentUploadManager {
  private queue: UploadTask[] = [];
  private activeUploads: Map<string, ActiveUpload> = new Map();
  private maxConcurrentUploads: number = 1; // Limit to 1 concurrent upload to prevent network errors
  private isProcessing: boolean = false;
  private uploadResults: Map<string, any> = new Map(); // Store results by taskId
  private uploadDelay: number = 500; // 500ms delay between starting uploads

  /**
   * Generate unique task ID based on screenId and index
   */
  private generateTaskId(screenId: string, indexOfDoc: number): string {
    return `${screenId}_${indexOfDoc}_${Date.now()}`;
  }

  /**
   * Add document to upload queue
   */
  public queueUpload(
    document: any,
    applicationId: string,
    indexOfDoc: number,
    screenId: string = 'PERSONAL_DOCUMENTS',
    deviceId: string = 'MOBILE_DEVICE',
    onProgress?: (progress: UploadProgress) => void,
    onSuccess?: (data: any, taskId: string) => void,
    onError?: (error: Error, taskId: string) => void,
  ): string {
    const taskId = this.generateTaskId(screenId, indexOfDoc);

    console.log(`[UploadManager] Queueing upload task: ${taskId}`);

    const task: UploadTask = {
      id: taskId,
      document,
      applicationId,
      indexOfDoc,
      screenId,
      deviceId,
      onProgress,
      onSuccess: onSuccess || (() => {}),
      onError: onError || (() => {}),
    };

    this.queue.push(task);

    // Notify queued status
    if (onProgress) {
      onProgress({ status: 'queued', message: 'Document queued for upload' });
    }

    // Start processing queue
    this.processQueue();

    return taskId;
  }

  /**
   * Process upload queue with concurrency control
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return; // Already processing
    }

    this.isProcessing = true;

    while (this.queue.length > 0 || this.activeUploads.size > 0) {
      // Start new uploads if below concurrent limit
      while (
        this.queue.length > 0 &&
        this.activeUploads.size < this.maxConcurrentUploads
      ) {
        const task = this.queue.shift();
        if (task) {
          this.startUpload(task);

          // Add delay between starting uploads to prevent server overload
          if (this.queue.length > 0) {
            console.log(
              `[UploadManager] Waiting ${this.uploadDelay}ms before next upload...`,
            );
            await new Promise(resolve => setTimeout(resolve, this.uploadDelay));
          }
        }
      }

      // Wait a bit before checking again
      if (this.activeUploads.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.isProcessing = false;
  }

  /**
   * Start individual upload task with retry logic
   */
  private async startUpload(
    task: UploadTask,
    retryCount: number = 0,
  ): Promise<void> {
    const { id, document, applicationId, indexOfDoc, screenId, deviceId } =
      task;
    const maxRetries = 3;
    const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff: 1s, 2s, 4s

    console.log(
      `[UploadManager] Starting upload: ${id}${
        retryCount > 0 ? ` (Retry ${retryCount}/${maxRetries})` : ''
      }`,
    );

    // Notify uploading status
    if (task.onProgress) {
      task.onProgress({
        status: 'uploading',
        message:
          retryCount > 0
            ? `Retrying upload (${retryCount}/${maxRetries})...`
            : 'Uploading document...',
      });
    }

    const uploadPromise = uploadAndExtractDocument(
      document,
      applicationId,
      indexOfDoc,
      screenId,
      deviceId,
    )
      .then(result => {
        console.log(`[UploadManager] Upload successful: ${id}`, result);

        // Store result
        this.uploadResults.set(id, result);

        // Notify extracting/completed status
        if (task.onProgress) {
          task.onProgress({
            status: 'completed',
            message: 'Document extracted successfully',
          });
        }

        // Call success callback
        task.onSuccess(result, id);

        // Remove from active uploads
        this.activeUploads.delete(id);
      })
      .catch(async error => {
        console.error(`[UploadManager] Upload failed: ${id}`, error);

        // Check if it's a network error and we haven't exceeded retry limit
        const isNetworkError =
          error.message?.includes('Network') ||
          error.code === 'ERR_NETWORK' ||
          error.message?.includes('timeout');

        if (isNetworkError && retryCount < maxRetries) {
          console.log(
            `[UploadManager] Network error, retrying in ${retryDelay}ms...`,
          );

          // Notify retry status
          if (task.onProgress) {
            task.onProgress({
              status: 'uploading',
              message: `Network error. Retrying in ${retryDelay / 1000}s...`,
            });
          }

          // Remove from active uploads before retry
          this.activeUploads.delete(id);

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));

          // Retry the upload
          return this.startUpload(task, retryCount + 1);
        }

        // Max retries reached or non-network error
        console.error(
          `[UploadManager] Upload permanently failed: ${id}`,
          error,
        );

        // Notify error status
        if (task.onProgress) {
          task.onProgress({
            status: 'error',
            message: error.message || 'Upload failed',
          });
        }

        // Call error callback
        task.onError(error, id);

        // Remove from active uploads
        this.activeUploads.delete(id);
      });

    // Track active upload
    this.activeUploads.set(id, { taskId: id, promise: uploadPromise });
  }

  /**
   * Get upload result by screenId and index
   */
  public getResult(screenId: string, indexOfDoc: number): any | null {
    // Find the most recent result for this screenId and index
    const matchingKeys = Array.from(this.uploadResults.keys()).filter(key =>
      key.startsWith(`${screenId}_${indexOfDoc}_`),
    );

    if (matchingKeys.length === 0) {
      return null;
    }

    // Get the most recent one (last in the array)
    const latestKey = matchingKeys[matchingKeys.length - 1];
    return this.uploadResults.get(latestKey);
  }

  /**
   * Clear result for specific screenId and index
   */
  public clearResult(screenId: string, indexOfDoc: number): void {
    const matchingKeys = Array.from(this.uploadResults.keys()).filter(key =>
      key.startsWith(`${screenId}_${indexOfDoc}_`),
    );

    matchingKeys.forEach(key => this.uploadResults.delete(key));
  }

  /**
   * Clear all stored results
   */
  public clearAllResults(): void {
    this.uploadResults.clear();
  }

  /**
   * Get current queue size
   */
  public getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get number of active uploads
   */
  public getActiveUploadsCount(): number {
    return this.activeUploads.size;
  }

  /**
   * Check if a specific upload is in progress
   */
  public isUploadInProgress(screenId: string, indexOfDoc: number): boolean {
    const matchingKeys = Array.from(this.activeUploads.keys()).filter(key =>
      key.startsWith(`${screenId}_${indexOfDoc}_`),
    );
    return matchingKeys.length > 0;
  }

  /**
   * Set max concurrent uploads (default: 1)
   */
  public setMaxConcurrentUploads(max: number): void {
    this.maxConcurrentUploads = Math.max(1, max);
    console.log(
      `[UploadManager] Max concurrent uploads set to: ${this.maxConcurrentUploads}`,
    );
  }

  /**
   * Set delay between starting uploads (default: 500ms)
   */
  public setUploadDelay(delayMs: number): void {
    this.uploadDelay = Math.max(0, delayMs);
    console.log(`[UploadManager] Upload delay set to: ${this.uploadDelay}ms`);
  }

  /**
   * Cancel all pending uploads in queue
   */
  public cancelQueue(): void {
    console.log(
      `[UploadManager] Cancelling ${this.queue.length} queued uploads`,
    );
    this.queue = [];
  }

  /**
   * Get upload statistics
   */
  public getStats() {
    return {
      queueSize: this.queue.length,
      activeUploads: this.activeUploads.size,
      completedUploads: this.uploadResults.size,
      maxConcurrent: this.maxConcurrentUploads,
      uploadDelay: this.uploadDelay,
    };
  }
}

// Export singleton instance
export const documentUploadManager = new DocumentUploadManager();

// Export types for use in components
export type { UploadProgress, UploadTask };
