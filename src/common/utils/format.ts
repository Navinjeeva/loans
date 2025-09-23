import React from 'react';

import { Linking, PermissionsAndroid } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';

function getPermissions() {
  return new Promise(async (resolve, reject) => {
    const permissions = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    if (permissions === PermissionsAndroid.RESULTS.GRANTED) resolve(true);
    else reject(false);
  });
}

export const getBase64Data = async (uri: string) => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.info('Permission granted');
    } else {
      const data = await getPermissions();
      // let status = await PermissionsAndroid.requestMultiple(permission);
    }

    // RNFetchBlob.fs
    //   .stat(uri)
    //   .then((stats) => {})
    //   .catch((err) => {});

    const fileExists = await RNFetchBlob.fs.exists(uri);
    if (fileExists) {
      const base64Data = await RNFetchBlob.fs.readFile(uri, 'base64');
      return base64Data;
    } else {
      throw new Error('File does not exist at the specified path.');
    }
  } catch (error) {
    console.error('Error reading file as base64:', error);
    throw new Error('Failed to read file');
  }
};
