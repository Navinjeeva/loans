# Document Upload Manager Solution

## Problem Statement

When multiple documents were uploaded simultaneously in the application, network errors occurred because:

1. Each upload was independent and uncoordinated
2. No queue management for parallel uploads
3. Race conditions when uploading multiple documents quickly
4. Responses couldn't be mapped back correctly to specific documents

## Solution Overview

A centralized **Document Upload Manager** that handles parallel document uploads with:

- ✅ Queue management for uploads
- ✅ Configurable concurrency control (default: 3 parallel uploads)
- ✅ Response mapping based on `screenId` and `index`
- ✅ Progress tracking per document
- ✅ Error handling per document
- ✅ No network conflicts or race conditions

## Architecture

### 1. Document Upload Manager (`src/common/utils/documentUploadManager.ts`)

The core singleton service that manages all document uploads:

```typescript
// Key Features:
- Queue system for pending uploads
- Concurrent upload control (max 3 by default)
- Task ID generation: `${screenId}_${indexOfDoc}_${timestamp}`
- Result storage and retrieval by screenId + index
- Progress callbacks for UI updates
```

**Main Methods:**

- `queueUpload()` - Add document to upload queue
- `getResult()` - Get extracted data for a specific document
- `clearResult()` - Clear cached result
- `getStats()` - Get upload statistics

### 2. React Hook (`src/common/hooks/useDocumentUpload.ts`)

Reusable hook for components that need to upload documents:

```typescript
const { uploadDocument, getUploadState, hasActiveUploads } = useDocumentUpload({
  applicationId: 'APP123',
  screenId: 'PERSONAL_DOCUMENTS',
});
```

**Features:**

- State management for upload progress
- Easy integration with React components
- Progress tracking per document
- Error handling

### 3. Integration in Screens

Updated screens to use the centralized manager:

- ✅ `PersonalDoc.tsx` - Personal documents
- ✅ `LoanDoc.tsx` - Loan documents
- ✅ `LinkedEntities.tsx` - Linked entities documents

## How It Works

### Flow Diagram

```
User uploads Document 1
    ↓
DocumentUploadManager.queueUpload()
    ↓
Queue: [Doc1] → Processing (0/3 active)
    ↓
Start Upload Doc1 (1/3 active)
    ↓
User uploads Document 2 (before Doc1 finishes)
    ↓
Queue: [Doc2] → Processing (1/3 active)
    ↓
Start Upload Doc2 (2/3 active)
    ↓
User uploads Document 3
    ↓
Queue: [Doc3] → Processing (2/3 active)
    ↓
Start Upload Doc3 (3/3 active)
    ↓
User uploads Document 4
    ↓
Queue: [Doc4] → Waiting (3/3 active - at limit)
    ↓
Doc1 completes → onSuccess callback
    ↓
Response mapped to: PERSONAL_DOCUMENTS_0
    ↓
Redux state updated for document index 0
    ↓
Queue: [Doc4] → Start Upload Doc4 (3/3 active again)
```

### Key Benefits

1. **No Network Conflicts**

   - Controlled concurrency prevents overwhelming the server
   - Queue ensures orderly processing

2. **Correct Response Mapping**

   - Each upload has unique ID: `${screenId}_${index}_${timestamp}`
   - Responses are correctly mapped back to the right document
   - Works even if responses arrive out of order

3. **Better User Experience**

   - Progress tracking per document
   - Non-blocking: users can upload multiple documents quickly
   - Error handling per document (one failure doesn't affect others)

4. **Maintainable Code**
   - Centralized upload logic
   - Easy to add new screens
   - Reusable hook for consistency

## Usage Example

### Basic Usage in a Screen Component

```typescript
import { documentUploadManager } from '@src/common/utils/documentUploadManager';

const MyComponent = () => {
  const custData = useSelector((state: any) => state.customer);

  const handleDocumentUpload = (document: any, index: number) => {
    documentUploadManager.queueUpload(
      document,
      custData.customerId,
      index,
      'MY_SCREEN_ID',
      'MOBILE_DEVICE',
      // Progress callback
      progress => {
        console.log(`Upload ${index}:`, progress.status);
      },
      // Success callback
      (response, taskId) => {
        console.log('Extracted data:', response);
        // Update Redux state with extracted data
      },
      // Error callback
      (error, taskId) => {
        console.error('Upload failed:', error);
      },
    );
  };

  return (
    <DocumentUpload
      setImages={images => {
        const firstImage = Array.isArray(images) ? images[0] : images;
        handleDocumentUpload(firstImage, 0);
      }}
    />
  );
};
```

### Using the Hook

```typescript
import { useDocumentUpload } from '@src/common/hooks/useDocumentUpload';

const MyComponent = () => {
  const { uploadDocument, getUploadState, hasActiveUploads } =
    useDocumentUpload({
      applicationId: 'APP123',
      screenId: 'PERSONAL_DOCUMENTS',
    });

  const handleUpload = (document: any, index: number) => {
    uploadDocument(
      document,
      index,
      data => {
        // Success - update UI
      },
      error => {
        // Error - show message
      },
    );
  };

  const uploadState = getUploadState(0); // Get state for document at index 0
  console.log(uploadState?.isUploading); // true/false
  console.log(uploadState?.progress?.status); // 'queued', 'uploading', 'completed', 'error'
};
```

## Configuration

### Adjust Max Concurrent Uploads

```typescript
import { documentUploadManager } from '@src/common/utils/documentUploadManager';

// Set to 5 concurrent uploads (default is 3)
documentUploadManager.setMaxConcurrentUploads(5);
```

### Get Upload Statistics

```typescript
const stats = documentUploadManager.getStats();
console.log(stats);
// {
//   queueSize: 2,           // Documents waiting in queue
//   activeUploads: 3,       // Currently uploading
//   completedUploads: 10,   // Completed since app start
//   maxConcurrent: 3        // Configured limit
// }
```

## Screen IDs Used

Different screens use different `screenId` values to separate their uploads:

- `PERSONAL_DOCUMENTS` - Personal documents screen
- `LOAN_DOCUMENTS` - Loan documents screen
- `LINKED_ENTITIES_DOCUMENTS` - Linked entities screen
- `EXTRA_DOCUMENTS` - Additional documents (if needed)

This ensures responses are mapped to the correct screen and document index.

## Response Storage

Responses are stored with a composite key:

```
Key: PERSONAL_DOCUMENTS_0_1696845120000
     └─────┬────────┘  │  └──────┬──────┘
        screenId    index   timestamp
```

To retrieve:

```typescript
const extractedData = documentUploadManager.getResult('PERSONAL_DOCUMENTS', 0);
```

This returns the most recent extraction for that screen and index.

## Error Handling

Each upload has independent error handling:

- Network errors don't affect other uploads
- Specific error callbacks per document
- Errors are logged and user is notified
- Failed uploads can be retried independently

## Future Enhancements

Possible improvements:

1. **Retry Logic** - Auto-retry failed uploads
2. **Offline Queue** - Store uploads when offline, process when online
3. **Upload Progress** - Show percentage progress for large files
4. **Batch Operations** - Cancel all uploads, clear all results
5. **Priority Queue** - Prioritize certain documents over others

## Testing

To test the solution:

1. Upload multiple documents rapidly (e.g., 5 documents within 2 seconds)
2. Verify no network errors occur
3. Check that each document gets its correct extracted data
4. Monitor console logs for queue management

Expected console output:

```
[UploadManager] Queueing upload task: PERSONAL_DOCUMENTS_0_1696845120000
[UploadManager] Starting upload: PERSONAL_DOCUMENTS_0_1696845120000
[IDP] Preparing to upload file: {...}
[IDP] File uploaded successfully: {...}
[UploadManager] Upload successful: PERSONAL_DOCUMENTS_0_1696845120000
```

## Migration Guide

For screens not yet using the new manager:

1. Import the manager:

```typescript
import { documentUploadManager } from '@src/common/utils/documentUploadManager';
```

2. Replace direct `uploadAndExtractDocument()` calls with:

```typescript
documentUploadManager.queueUpload(
  document,
  appId,
  index,
  screenId,
  deviceId,
  onProgress,
  onSuccess,
  onError,
);
```

3. Move data processing logic into the `onSuccess` callback

4. Add error handling in the `onError` callback

## Support

For issues or questions:

- Check console logs for `[UploadManager]` and `[IDP]` messages
- Use `documentUploadManager.getStats()` to debug queue state
- Verify `screenId` and `index` are correct for each document

## Summary

This solution provides a robust, scalable way to handle parallel document uploads without network conflicts. All responses are correctly mapped back to their respective documents using the `screenId` and `index` combination, ensuring data integrity across the application.
