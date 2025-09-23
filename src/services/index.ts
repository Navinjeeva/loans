import { getData, removeData, storeData } from '@src/common/utils/storage';
import store from '@src/store';
import { setState } from '@src/store/auth';
import axios from 'axios';
import { Platform } from 'react-native';
import base64 from 'base-64';

export let ENVIROMENT: string = 'QA'; // DEV, QA, UAT, PROD, VAPT

let urls: {
  [key: string]: {
    ENVIROMENT: string;
    ANDROID_VERSION_NAME: string;
    LOAN_BASE_URL: string;
    IDP_BASE_URL: string;
    AMBANKING_APP_BASE_URL: string;
    AUTH_BASE_URL: string;
    KYC_AML_URL: string;
    ONESIGNAL_ID: string;
  };
} = {
  DEV: {
    ENVIROMENT: 'DEV',
    ANDROID_VERSION_NAME: '1.0.0',
    LOAN_BASE_URL: 'https://dev-api-los.impactodigifin.xyz/api/v1/ambassador',
    IDP_BASE_URL: 'https://qa-ocr.impactodigifin.xyz',
    AMBANKING_APP_BASE_URL: 'https://dev-api.ambanking.impactodigifin.xyz',
    AUTH_BASE_URL: 'https://dev-api-iam.impactodigifin.xyz',
    KYC_AML_URL: 'https://dev-api-kyc.impactodigifin.xyz',
    ONESIGNAL_ID: 'bd28081a-518b-4761-93d0-6280f1853d55',
  },
  QA: {
    ENVIROMENT: 'QA',
    ANDROID_VERSION_NAME: '2.2.9',
    LOAN_BASE_URL: 'https://qa-api-los.impactodigifin.xyz/api/v1/ambassador',
    IDP_BASE_URL: 'http://3.146.230.106:8000/',
    AMBANKING_APP_BASE_URL: 'http://10.0.3.196:8070/',
    AUTH_BASE_URL: 'http://10.0.3.196:8071/',
    KYC_AML_URL: 'https://qa-api-kyc.impactodigifin.xyz',
    ONESIGNAL_ID: 'bd28081a-518b-4761-93d0-6280f1853d55',
  },
};

export const ANDROID_VERSION_NAME = urls[ENVIROMENT].ANDROID_VERSION_NAME;
export const LOAN_BASE_URL = urls[ENVIROMENT].LOAN_BASE_URL;
export const IDP_BASE_URL = urls[ENVIROMENT].IDP_BASE_URL;
export const AMBANKING_APP_BASE_URL = urls[ENVIROMENT].AMBANKING_APP_BASE_URL;
export const AUTH_BASE_URL = urls[ENVIROMENT].AUTH_BASE_URL;
export const KYC_AML_URL = urls[ENVIROMENT].KYC_AML_URL;
export const ENV = urls[ENVIROMENT].ENVIROMENT;
export const ONESIGNAL_ID = urls[ENVIROMENT].ONESIGNAL_ID;

let refreshTimer: NodeJS.Timeout | null = null;

const refreshAccessToken = async () => {
  console.log('vug');
  try {
    const refreshToken = await getData('refresh_token');

    if (!refreshToken) return;

    const { data } = await authInstance.post('api/v1/auth/refresh-token');

    const { accessToken, refreshToken: newRefreshToken } =
      data.responseStructure.data;
    await storeData('access_token', accessToken);
    await storeData('refresh_token', newRefreshToken);

    authInstance.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${accessToken}`;

    instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    idpInstance.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${accessToken}`;
  } catch (refreshError) {
    store.dispatch(
      setState({
        access_token: '',
        refresh_token: '',
        loggedIn: false,
      }),
    );
    await removeData('access_token');
  }
};

const getTokenExpirationTime = (_token: string) => {
  // Always return 3 minutes from now
  return Date.now() + 3 * 60 * 1000;
};

export const scheduleTokenRefresh = (accessToken: string) => {
  const expirationTime = getTokenExpirationTime(accessToken);

  if (expirationTime) {
    const now = Date.now();
    const refreshBefore = 100 * 1000; // Refresh 30 =seconds before expiration
    // const timeout = expirationTime - now - refreshBefore;
    const timeout = refreshBefore;

    if (timeout > 0) {
      clearTimeout(refreshTimer!); // Clear any existing timer
      refreshTimer = setInterval(() => {
        refreshAccessToken(); // Refreshing token proactively...
      }, timeout);
    } else {
      refreshAccessToken(); // Token already expired or about to expire. Refreshing now
    }
  } else {
    //  "Unable to determine token expiration. No refresh scheduled."
  }
};

export const authInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

authInstance.interceptors.request.use(
  async config => {
    const token = await getData('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

authInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    console.log(error, 'errorr');
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getData('refresh_token');

        if (!refreshToken) return;

        const { data } = await authInstance.post('/api/v1/auth/refresh-token');
        const payload = data?.responseStructure?.data ?? data?.data ?? {};
        const { accessToken, refreshToken: newRefreshToken } = payload;
        await storeData('access_token', accessToken);
        await storeData('refresh_token', newRefreshToken);

        instance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${accessToken}`;
        idpInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${accessToken}`;

        return authInstance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        store.dispatch(
          setState({
            access_token: '',
            refresh_token: '',
            loggedIn: false,
          }),
        );
        await removeData('access_token');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export const idpInstance = axios.create({
  baseURL: IDP_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// idpInstance.interceptors.request.use(
//   async config => {
//     const token = await getData('access_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//       config.headers['X-Env'] = ENV;
//       config.headers['clientID'] = 'AMB';
//     }
//     return config;
//   },
//   error => {
//     return Promise.reject(error);
//   },
// );

idpInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    console.log(error);
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getData('refresh_token');

        if (!refreshToken) return;

        const { data } = await authInstance.post('/api/v1/auth/refresh-token');
        const payload = data?.responseStructure?.data ?? data?.data ?? {};
        const { accessToken, refreshToken: newRefreshToken } = payload;
        await storeData('access_token', accessToken);
        await storeData('refresh_token', newRefreshToken);

        instance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${accessToken}`;
        idpInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${accessToken}`;

        return idpInstance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        store.dispatch(
          setState({
            access_token: '',
            refresh_token: '',
            loggedIn: false,
          }),
        );
        await removeData('access_token');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export const instance = axios.create({
  baseURL: `${AMBANKING_APP_BASE_URL}/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  async config => {
    const token = await getData('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getData('refresh_token');

        if (!refreshToken) return;

        const { data } = await authInstance.post('/api/v1/auth/refresh-token');
        const payload = data?.responseStructure?.data ?? data?.data ?? {};
        const { accessToken, refreshToken: newRefreshToken } = payload;
        await storeData('access_token', accessToken);
        await storeData('refresh_token', newRefreshToken);

        instance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${accessToken}`;
        idpInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${accessToken}`;
        return instance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export const DROPDOWNS = async (
  type: string,
  search = '',
  subtype: string | undefined = undefined,
) => {
  try {
    let url = '';

    if (subtype) {
      url = `api/v1/kym/drop-downs/search?type=${type}&searchKey=${search}&subtype=${subtype}`;
    } else {
      url = `api/v1/kym/drop-downs/search?type=${type}&searchKey=${search}`;
    }

    const response = await instance.get(url);
    return response.data.data.payload;
  } catch (error) {
    return [];
  }
};
