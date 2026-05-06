import { v4 as uuidv4 } from 'uuid';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';

declare module 'crypto-js';
import CryptoJS from 'crypto-js';
import { getData, logErr } from '@src/common';

// Secret key for signature generation - should be stored securely
// In a real app, this would be stored in a secure storage or environment variable
const SECRET_KEY = 'AMBANK_SECURE_KEY';

/**
 * Generates a unique nonce value for API requests
 * Falls back to timestamp-based string if crypto is not available
 * 
 * 
 */


export const createSecurityHeaders = (signatureData) => {
  try {
    if (!CryptoJS || !CryptoJS.SHA256) {
      console.error('CryptoJS or SHA256 is not available');
      return {};
    }

    const timestamp = new Date().toISOString();
    const signature = CryptoJS.SHA256(`${signatureData}-${timestamp}`).toString();

    return {
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Error generating signature:', error);
    return {
      'Content-Type': 'application/json',
    };
  }
};
export const generateNonce = (): string => {
  try {
    return uuidv4();
  } catch (error) {
    // Fallback if uuid fails due to crypto not being available
    return `nonce-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
};

/**
 * Generates an idempotency key for API requests
 * This ensures duplicate requests are not processed multiple times
 */
export const generateIdempotencyKey = (): string => {
  return `key-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Generates a request signature using SHA-256 (using CryptoJS)
 * @param data - String data to sign
 * @returns SHA-256 hash of the data
 */
export const generateSignature = (data: string): string => {
  try {
    // Use CryptoJS.SHA256 to generate the signature
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Base64);  // You can choose other encodings like Hex
  } catch (error) {
    console.error('Error generating signature:', error);
    // Return a fallback signature in case of error
    return `signature-error-${Date.now()}`;
  }
};

/**
 * Creates security headers for API requests
 * @param signatureData - Data to be used for signature generation
 * @returns Object containing security headers
 */
// export const createSecurityHeaders = (signatureData: string) => {
//   const nonce = generateNonce();
//   const timestamp = new Date().toISOString();
//   const idempotencyKey = generateIdempotencyKey();

//   const signature = generateSignature(signatureData + timestamp + nonce);  // Generate the signature

//   return {
//     'X-Request-Nonce': nonce,
//     'X-Request-Timestamp': timestamp,
//     'X-Idempotency-Key': idempotencyKey,
//     'X-Request-Signature': signature
//   };
// };

/**
 * Prepares security headers for ACH transfers
 */
export const prepareAchTransferHeaders = async (mpin, transferData) => {
  try {
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const generateNonce = () => {
      const nonceBytes = new Uint8Array(16);
      for (let i = 0; i < nonceBytes.length; i++) {
        nonceBytes[i] = Math.floor(Math.random() * 256);
      }
      return Buffer.from(nonceBytes)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };
    const idempotencyKey = generateUUID();
    const nonce = generateNonce();

    // Ensure the timestamp is in seconds and in sync with the server
    const timeStamp = () => Math.floor(Date.now());  // Now in seconds
    const timestampInMilliseconds = timeStamp();

    const sourceAcc = 'SHARE'; // replace with actual account type

    const dataToSign = [
      transferData?.payeeDetails.payeeId || '',
      Number(transferData?.amount).toFixed(2) || '',
      sourceAcc || '',
      transferData.remarks || '',
      mpin || '',
      idempotencyKey || '',
      timestampInMilliseconds || '',
      nonce || '',
    ].join('');

    const calculateHmacSignature = (dataToSign, secretKey) => {
      if (!dataToSign) {
        throw new Error('Data to sign or secret key is empty or invalid');
      }

      const hash = CryptoJS.HmacSHA256(dataToSign, secretKey);
      return hash.toString(CryptoJS.enc.Base64);
    };

    const secretKey = await getData('publicKey');
    const signature = calculateHmacSignature(dataToSign, secretKey);

    const headers = {
      'X-Nonce': nonce,
      'X-Timestamp': timestampInMilliseconds,
      'X-Request-Signature': signature,
      'Content-Type': 'application/json',
    };

    const requestData = {
      mobilePin: mpin,
      payeeId: transferData?.payeeDetails.payeeId,
      amount: Number(transferData?.amount).toFixed(2),
      sourceAccountType: sourceAcc,
      remarks: transferData?.remarks || '',
      idempotencyKey: idempotencyKey,
    };

    return { requestData, headers };
  } catch (error) {
  }
};

/**
 * Prepares security headers for Internal Fund transfers
 */
export const prepareInternalFundTransferHeaders = async( mpin,transferData) => {
  try {
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const generateNonce = () => {
      const nonceBytes = new Uint8Array(16);
      for (let i = 0; i < nonceBytes.length; i++) {
        nonceBytes[i] = Math.floor(Math.random() * 256);
      }
      return Buffer.from(nonceBytes)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    };
    const idempotencyKey = generateUUID();
    const nonce = generateNonce();

    // Ensure the timestamp is in seconds and in sync with the server
    const timeStamp = () => Math.floor(Date.now());  // Now in seconds
    const timestampInMilliseconds = timeStamp();

    const sourceAcc = 'SHARE'; // replace with actual account type

    const dataToSign = [
      transferData?.payeeDetails.payeeId || '',
      Number(transferData?.amount).toFixed(2) || '',
      sourceAcc || '',
      transferData.remarks || '',
      mpin || '',
      idempotencyKey || '',
      timestampInMilliseconds || '',
      nonce || '',
    ].join('');


    const calculateHmacSignature = (dataToSign, secretKey) => {
      if (!dataToSign) {
        throw new Error('Data to sign or secret key is empty or invalid');
      }

      const hash = CryptoJS.HmacSHA256(dataToSign, secretKey);
      return hash.toString(CryptoJS.enc.Base64);
    };

    const secretKey = await getData('publicKey');

    const signature = calculateHmacSignature(dataToSign, secretKey);

    const headers = {
      'X-Nonce': nonce,
      'X-Timestamp': timestampInMilliseconds,
      'X-Request-Signature': signature,
      'Content-Type': 'application/json',
    };

    const requestData = {
      mobilePin: mpin,
      payeeId: transferData?.payeeDetails.payeeId,
      amount: Number(transferData?.amount).toFixed(2),
      sourceAccountType: sourceAcc,
      remarks: transferData?.remarks || '',
      idempotencyKey: idempotencyKey,
    };

    return { requestData, headers };
  } catch (error) {
    if (error.response) {
      logErr(error.response.data?.message);
    }
  }
};

/**
 * Prepares security headers for LinCU transfers
 */
export const prepareLinCUTransferHeaders = (
  payeeId: string,
  amount: string,
  sourceAccountType: string,
  remarks: string,
  mobilePin: string
) => {
  const nonce = generateNonce();
  const timestamp = new Date().toISOString();
  const idempotencyKey = generateIdempotencyKey();

  const dataToSign = payeeId + amount + sourceAccountType + remarks + mobilePin + idempotencyKey + timestamp + nonce;
  const signature = generateSignature(dataToSign);

  return {
    'X-Request-Nonce': nonce,
    'X-Request-Timestamp': timestamp,
    'X-Idempotency-Key': idempotencyKey,
    'X-Request-Signature': signature
  };
};

/**
 * Prepares security headers for Self transfers
 */
export const prepareSelfTransferHeaders = (
  sourceAccountMemberId: string,
  sourceAccountType: string,
  destinationAccountType: string,
  amount: string,
  remarks: string,
  mobilePin: string
) => {
  const nonce = generateNonce();
  const timestamp = new Date().toISOString();
  const idempotencyKey = generateIdempotencyKey();

  const dataToSign = sourceAccountMemberId + sourceAccountType + destinationAccountType + amount + remarks + mobilePin + idempotencyKey + timestamp + nonce;
  const signature = generateSignature(dataToSign);

  return {
    'X-Request-Nonce': nonce,
    'X-Request-Timestamp': timestamp,
    'X-Idempotency-Key': idempotencyKey,
    'X-Request-Signature': signature
  };
};
