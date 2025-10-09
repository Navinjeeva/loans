import axios from 'axios';

const IDP_BASE_URL = 'http://3.146.230.106:8000';

// Step 1: Upload file to IDP and get file_id
export const uploadFileToIDP = async (
  document: any,
  applicationId: string,
  screenId: string = 'PERSONAL_DOCUMENTS',
  deviceId: string = 'MOBILE_DEVICE',
): Promise<string> => {
  try {
    const formData = new FormData();

    // React Native FormData requires this specific structure
    const fileToUpload = {
      uri: document.uri,
      type: document.type || 'image/jpeg',
      name: document.fileName || document.name || 'document.jpg',
    };

    console.log('[IDP] Preparing to upload file:', {
      uri: fileToUpload.uri,
      type: fileToUpload.type,
      name: fileToUpload.name,
      applicationId,
      screenId,
      deviceId,
    });

    formData.append('file', fileToUpload as any);
    formData.append('applicationId', applicationId);
    formData.append('screenId', screenId);
    formData.append('deviceId', deviceId);

    console.log('[IDP] Uploading file to IDP...');

    const response = await axios.post(`${IDP_BASE_URL}/ws/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
      timeout: 60000, // 60 second timeout
      transformRequest: (data, headers) => {
        // Return the data as-is for React Native
        return data;
      },
    });

    console.log('[IDP] File uploaded successfully:', response.data);

    // Extract file_id from response
    const fileId = response.data?.file_id || response.data?.fileId;

    if (!fileId) {
      throw new Error('No file_id received from IDP upload');
    }

    return fileId;
  } catch (error: any) {
    // Enhanced error logging
    console.error('[IDP] Upload error details:', {
      message: error?.message,
      code: error?.code,
      response: error?.response?.data,
      status: error?.response?.status,
      url: `${IDP_BASE_URL}/ws/upload`,
    });

    // Provide more specific error messages
    if (error?.message === 'Network request failed') {
      throw new Error(
        'Network request failed. Please check:\n' +
          '1. Server is running at ' +
          IDP_BASE_URL +
          '\n' +
          '2. Network connection is active\n' +
          '3. App has been rebuilt after network config changes',
      );
    }

    throw error;
  }
};

// Step 2: Extract document data via WebSocket
export const extractDocumentViaWebSocket = (
  fileId: string,
  applicationId: string,
  indexOfDoc: number = 0,
  screenId: string = 'PERSONAL_DOCUMENTS',
  deviceId: string = 'MOBILE_DEVICE',
): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const wsUrl = `ws://3.146.230.106:8000/ws/extract`;
      console.log('[IDP] Connecting to WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);
      let lastExtractedData: any = null;
      let messageCount = 0;
      let inactivityTimeout: NodeJS.Timeout | null = null;
      let globalTimeout: NodeJS.Timeout | null = null;

      // Function to close connection after no messages for 2 seconds
      const resetInactivityTimer = () => {
        if (inactivityTimeout) {
          clearTimeout(inactivityTimeout);
        }

        inactivityTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            console.log(
              '[IDP] No more messages received, closing WebSocket...',
            );
            ws.close();
          }
        }, 2000); // Close after 2 seconds of inactivity
      };

      ws.onopen = () => {
        console.log('[IDP] WebSocket connected');

        const extractionRequest = {
          action: 'extract_document',
          file_id: fileId,
          applicationId: applicationId,
          screenId: screenId,
          indexOfDoc: indexOfDoc,
          deviceId: deviceId,
        };

        ws.send(JSON.stringify(extractionRequest));
        console.log('[IDP] Extraction request sent:', extractionRequest);
      };

      ws.onmessage = event => {
        messageCount++;
        console.log(`[IDP] Received message ${messageCount}:`, event.data);

        try {
          const extractedData = JSON.parse(event.data);
          console.log(`[IDP] Parsed message ${messageCount}:`, extractedData);

          // Store the latest data (will be the last one when connection closes)
          lastExtractedData = extractedData?.result?.data;

          // Reset the inactivity timer - close if no more messages come
          resetInactivityTimer();
        } catch (error) {
          console.error('[IDP] Error parsing extraction result:', error);
        }
      };

      ws.onerror = error => {
        console.error('[IDP] WebSocket error:', error);
        reject(new Error('WebSocket connection error'));
      };

      ws.onclose = event => {
        // Clean up all timeouts
        if (inactivityTimeout) {
          clearTimeout(inactivityTimeout);
        }
        if (globalTimeout) {
          clearTimeout(globalTimeout);
        }

        console.log('[IDP] WebSocket closed:', event.code, event.reason);
        console.log(`[IDP] Total messages received: ${messageCount}`);

        // Resolve with the last received data
        if (lastExtractedData) {
          console.log(
            '[IDP] Returning last extracted data:',
            lastExtractedData,
          );
          resolve(lastExtractedData);
        } else {
          reject(new Error('No extraction data received from WebSocket'));
        }
      };

      // Global timeout after 60 seconds as a safety fallback
      globalTimeout = setTimeout(() => {
        if (inactivityTimeout) {
          clearTimeout(inactivityTimeout);
        }
        if (ws.readyState !== WebSocket.CLOSED) {
          console.warn('[IDP] Global timeout - closing connection');
          ws.close();
          reject(new Error('WebSocket timeout - extraction took too long'));
        }
      }, 60000);
    } catch (error) {
      console.error('[IDP] Error creating WebSocket:', error);
      reject(error);
    }
  });
};

// Combined function: Upload + Extract
export const uploadAndExtractDocument = async (
  document: any,
  applicationId: string,
  indexOfDoc: number = 0,
  screenId: string = 'PERSONAL_DOCUMENTS',
  deviceId: string = 'MOBILE_DEVICE',
): Promise<any> => {
  try {
    // Step 1: Upload file
    const fileId = await uploadFileToIDP(
      document,
      applicationId,
      screenId,
      deviceId,
    );

    console.log('[IDP] File uploaded, file_id:', fileId);

    // Step 2: Extract data
    const extractedData = await extractDocumentViaWebSocket(
      fileId,
      applicationId,
      indexOfDoc,
      screenId,
      deviceId,
    );

    console.log('[IDP] Document extracted successfully:', extractedData);

    return {
      ...extractedData,
    };
  } catch (error: any) {
    console.error('[IDP] Upload and extract failed:', error.message);
    throw error;
  }
};
