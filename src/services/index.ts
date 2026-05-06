import store from "@src/store";
import { setState } from "@src/store/auth";
import { getData, removeData, storeData } from "@src/common";
import axios from "axios";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}
import base64 from "base-64";
import { generateNonce, generateSignature } from "./securityUtils";
import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";

export let ENVIROMENT: string = "DEV"; // DEV, QA, UAT, PROD, VAPT

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
    LOAN_URL: string;
    LOAN_DOC_UPLOAD_URL: string;
    LOANS_IDP_BASE_URL: string;
  };
} = {
  DEV: {
    ENVIROMENT: "DEV",
    ANDROID_VERSION_NAME: "1.0.0",
    LOAN_BASE_URL: "https://dev-api-los.impactodigifin.xyz/api/v1/ambassador",
    IDP_BASE_URL: "https://qa-ocr.impactodigifin.xyz",
    AMBANKING_APP_BASE_URL: "https://dev-api.ambanking.impactodigifin.xyz",
    AUTH_BASE_URL: "https://dev-api-iam.impactodigifin.xyz",
    KYC_AML_URL: "https://dev-api-kyc.impactodigifin.xyz",
    ONESIGNAL_ID: "bd28081a-518b-4761-93d0-6280f1853d55",
    // LOAN_URL: "https://dev-api-los-service.impactodigifin.xyz",
     LOAN_DOC_UPLOAD_URL: "https://dev-api-doc.impactodigifin.xyz",
    LOAN_URL: "http://10.0.3.187:8081",
    //LOAN_DOC_UPLOAD_URL: "http://10.0.3.187:8081",
    LOANS_IDP_BASE_URL: "http://3.146.230.106:8000",
  },
  QA: {
    ENVIROMENT: "QA",
    ANDROID_VERSION_NAME: "2.2.9",
    LOAN_BASE_URL: "https://qa-api-los.impactodigifin.xyz/api/v1/ambassador",
    IDP_BASE_URL: "https://qa-ocr.impactodigifin.xyz",
    AMBANKING_APP_BASE_URL: "https://qa-api.ambanking.impactodigifin.xyz",
    AUTH_BASE_URL: "https://qa-api-iam.impactodigifin.xyz",
    KYC_AML_URL: "https://qa-api-kyc.impactodigifin.xyz",
    ONESIGNAL_ID: "bd28081a-518b-4761-93d0-6280f1853d55",
    // LOAN_URL: "https://dev-api-los-service.impactodigifin.xyz",
    // LOAN_DOC_UPLOAD_URL: "https://dev-api-doc.impactodigifin.xyz",
    LOAN_URL: "http://10.0.3.46:8080",
    LOAN_DOC_UPLOAD_URL: "http://10.0.3.46:8083",
    LOANS_IDP_BASE_URL: "http://3.146.230.106:8000",
  },
  UAT: {
    ENVIROMENT: "UAT",
    ANDROID_VERSION_NAME: "3.0.0",
    LOAN_BASE_URL: "https://uat-api-los.impactodigifin.xyz/api/v1/ambassador",
    IDP_BASE_URL: "https://qa-ocr.impactodigifin.xyz",
    AMBANKING_APP_BASE_URL: "https://uat-api-ambanking.impactodigifin.xyz",
    AUTH_BASE_URL: "https://uat-api-iam.impactodigifin.xyz",
    KYC_AML_URL: "https://uat-api-kyc.impactodigifin.xyz",
    ONESIGNAL_ID: "bd28081a-518b-4761-93d0-6280f1853d55",
    LOAN_URL: "https://dev-api-los-service.impactodigifin.xyz",
    LOAN_DOC_UPLOAD_URL: "https://dev-api-doc.impactodigifin.xyz",
    LOANS_IDP_BASE_URL: "http://3.146.230.106:8000",
  },
  VAPT: {
    ENVIROMENT: "VAPT",
    ANDROID_VERSION_NAME: "2.2.5",
    LOAN_BASE_URL: "https://vapt-api-los.tecutt.com/api/v1/ambassador",
    IDP_BASE_URL: "http://192.168.240.112:8000",
    AMBANKING_APP_BASE_URL: "https://vapt-api-ambanking.tecutt.com",
    AUTH_BASE_URL: "https://vapt-api-iam.tecutt.com",
    KYC_AML_URL: "https://vapt-api-kyc.tecutt.com",
    ONESIGNAL_ID: "bd28081a-518b-4761-93d0-6280f1853d55",
    LOAN_URL: "https://dev-api-los-service.impactodigifin.xyz",
    LOAN_DOC_UPLOAD_URL: "https://dev-api-doc.impactodigifin.xyz",
    LOANS_IDP_BASE_URL: "http://3.146.230.106:8000",
  },
  PREPROD: {
    ENVIROMENT: "PREPROD",
    ANDROID_VERSION_NAME: "2.3.0",
    LOAN_BASE_URL: "https://api-los-preprod.tecutt.com/api/v1/ambassador",
    IDP_BASE_URL: "http://192.168.240.112:8000",
    AMBANKING_APP_BASE_URL: "https://api-ambanking-preprod.tecutt.com",
    AUTH_BASE_URL: "https://api-iam-preprod.tecutt.com",
    KYC_AML_URL: "https://api-kyc-preprod.tecutt.com",
    ONESIGNAL_ID: "bd28081a-518b-4761-93d0-6280f1853d55",
    LOAN_URL: "https://dev-api-los-service.impactodigifin.xyz",
    LOAN_DOC_UPLOAD_URL: "https://dev-api-doc.impactodigifin.xyz",
    LOANS_IDP_BASE_URL: "http://3.146.230.106:8000",
  },
  PROD: {
    ENVIROMENT: "PROD",
    ANDROID_VERSION_NAME: "2.2.7",
    LOAN_BASE_URL: "https://api-los.tecutt.com/api/v1/ambassador",
    IDP_BASE_URL: "http://192.168.240.112:8000",
    AMBANKING_APP_BASE_URL: "https://api-ambanking.tecutt.com",
    AUTH_BASE_URL: "https://api-iam.tecutt.com",
    KYC_AML_URL: "https://api-kyc.tecutt.com",
    ONESIGNAL_ID: "bd28081a-518b-4761-93d0-6280f1853d55",
    LOAN_URL: "https://dev-api-los-service.impactodigifin.xyz",
    LOAN_DOC_UPLOAD_URL: "https://dev-api-doc.impactodigifin.xyz",
    LOANS_IDP_BASE_URL: "http://3.146.230.106:8000",
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
export const LOAN_URL = urls[ENVIROMENT].LOAN_URL;
export const LOAN_DOC_UPLOAD_URL = urls[ENVIROMENT].LOAN_DOC_UPLOAD_URL;
export const LOANS_IDP_BASE_URL = urls[ENVIROMENT].LOANS_IDP_BASE_URL;

const logApiDuration = (config: any, startTime: number) => {
  const duration = Date.now() - startTime;
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url} — ${duration}ms`);
};

let refreshTimer: NodeJS.Timeout | null = null;

const refreshAccessToken = async () => {
  try {
    const refreshToken = await getData("refresh_token");

    if (!refreshToken) return;

    const { data } = await authInstance.post(
      "/api/v2/auth/refresh-token",
      {
        refreshToken: refreshToken,
        clientId: "aMBankingClient",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const {
      access_token,
      refresh_token: newRefreshToken,
      publicKey,
    } = data.data;
    await storeData("access_token", access_token);
    await storeData("refresh_token", newRefreshToken);
    await storeData("publicKey", publicKey);

    instance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${access_token}`;
    LOSInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${access_token}`;
    KYC_AML_ISTANCE.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${access_token}`;
    idpInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${access_token}`;
  } catch (refreshError) {
    store.dispatch(
      setState({
        access_token: "",
        refresh_token: "",
        loggedIn: false,
      })
    );
    await removeData("access_token");
  }
};

const getTokenExpirationTime = (token: string) => {
  try {
    const decodeToken = JSON.parse(base64.decode(token.split(".")[1]));

    return decodeToken.exp ? decodeToken.exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    return null; // Error decoding token
  }
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
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const loanInstance = axios.create({
  baseURL: LOAN_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const loanDocumentInstance = axios.create({
  baseURL: LOAN_DOC_UPLOAD_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

loanInstance.interceptors.request.use(
  async (config) => {
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

loanInstance.interceptors.response.use(
  (response) => {
    if (response.config.metadata?.startTime) {
      logApiDuration(response.config, response.config.metadata.startTime);
    }
    return response;
  },
  (error) => {
    if (error.config?.metadata?.startTime) {
      logApiDuration(error.config, error.config.metadata.startTime);
    }
    return Promise.reject(error);
  }
);

authInstance.interceptors.request.use(
  async (config) => {
    config.metadata = { startTime: Date.now() };
    const token = await getData("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["X-Client-ID"] = `aMBankingClient`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authInstance.interceptors.response.use(
  (response) => {
    if (response.config.metadata?.startTime) {
      logApiDuration(response.config, response.config.metadata.startTime);
    }
    return response;
  },
  async (error) => {
    if (error.config?.metadata?.startTime) {
      logApiDuration(error.config, error.config.metadata.startTime);
    }
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getData("refresh_token");

        if (!refreshToken) return;

        const { data } = await authInstance.post(
          "/api/v2/auth/refresh-token",
          {
            refreshToken: refreshToken,
            clientId: "aMBankingClient",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const {
          access_token,
          refresh_token: newRefreshToken,
          publicKey,
        } = data.data;

        await storeData("access_token", access_token);
        await storeData("refresh_token", newRefreshToken);
        await storeData("publicKey", publicKey);

        instance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        LOSInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        KYC_AML_ISTANCE.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        idpInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;

        return authInstance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        store.dispatch(
          setState({
            access_token: "",
            refresh_token: "",
            loggedIn: false,
          })
        );
        await removeData("access_token");
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

const instance = axios.create({
  baseURL: `${AMBANKING_APP_BASE_URL}/`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

instance.interceptors.request.use(
  async (config) => {
    const token = await getData("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getData("refresh_token");

        if (!refreshToken) return;

        const { data } = await authInstance.post(
          "/api/v2/auth/refresh-token",
          {
            refreshToken: refreshToken,
            clientId: "aMBankingClient",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const {
          access_token,
          refresh_token: newRefreshToken,
          publicKey,
        } = data.data;

        await storeData("access_token", access_token);
        await storeData("refresh_token", newRefreshToken);
        await storeData("publicKey", publicKey);

        instance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        LOSInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        KYC_AML_ISTANCE.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        idpInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;

        return instance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        store.dispatch(
          setState({
            access_token: "",
            refresh_token: "",
            loggedIn: false,
          })
        );
        await removeData("access_token");
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const KYC_AML_ISTANCE = axios.create({
  baseURL: `${KYC_AML_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

KYC_AML_ISTANCE.interceptors.request.use(
  async (config) => {
    const token = await getData("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["X-Client-ID"] = `aMBankingClient`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

KYC_AML_ISTANCE.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getData("refresh_token");

        if (!refreshToken) return;

        const { data } = await authInstance.post(
          "/api/v2/auth/refresh-token",
          {
            refreshToken: refreshToken,
            clientId: "aMBankingClient",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const {
          access_token,
          refresh_token: newRefreshToken,
          publicKey,
        } = data.data;

        await storeData("access_token", access_token);
        await storeData("refresh_token", newRefreshToken);
        await storeData("publicKey", publicKey);

        instance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        LOSInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        KYC_AML_ISTANCE.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        idpInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;

        return KYC_AML_ISTANCE(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        store.dispatch(
          setState({
            access_token: "",
            refresh_token: "",
            loggedIn: false,
          })
        );
        await removeData("access_token");
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const idpInstance = axios.create({
  baseURL: IDP_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

idpInstance.interceptors.request.use(
  async (config) => {
    const token = await getData("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["X-Env"] = ENV;
      config.headers["clientID"] = "AMB";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

idpInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getData("refresh_token");

        if (!refreshToken) return;

        const { data } = await authInstance.post(
          "/api/v2/auth/refresh-token",
          {
            refreshToken: refreshToken,
            clientId: "aMBankingClient",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const {
          access_token,
          refresh_token: newRefreshToken,
          publicKey,
        } = data.data;

        await storeData("access_token", access_token);
        await storeData("refresh_token", newRefreshToken);
        await storeData("publicKey", publicKey);

        instance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        LOSInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        KYC_AML_ISTANCE.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        idpInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;

        return idpInstance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        store.dispatch(
          setState({
            access_token: "",
            refresh_token: "",
            loggedIn: false,
          })
        );
        await removeData("access_token");
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const loanIdpInstance = axios.create({
  baseURL: LOANS_IDP_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

loanIdpInstance.interceptors.request.use(
  async (config) => {
    const token = await getData("access_token");
    if (token) {
      //config.headers.Authorization = `Bearer ${token}`;
      //config.headers["X-Env"] = ENV;
      //config.headers["clientID"] = "AMB";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

loanIdpInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error.response exists before accessing its properties
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getData("refresh_token");

        if (!refreshToken) return Promise.reject(error);

        const { data } = await authInstance.post(
          "/api/v2/auth/refresh-token",
          {
            refreshToken: refreshToken,
            clientId: "aMBankingClient",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const {
          access_token,
          refresh_token: newRefreshToken,
          publicKey,
        } = data.data;

        await storeData("access_token", access_token);
        await storeData("refresh_token", newRefreshToken);
        await storeData("publicKey", publicKey);

        instance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        LOSInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        KYC_AML_ISTANCE.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        // loanIdpInstance.defaults.headers.common[
        //   "Authorization"
        // ] = `Bearer ${access_token}`;

        return loanIdpInstance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        store.dispatch(
          setState({
            access_token: "",
            refresh_token: "",
            loggedIn: false,
          })
        );
        await removeData("access_token");
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const LOSInstance = axios.create({
  baseURL: LOAN_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

LOSInstance.interceptors.request.use(
  async (config) => {
    const token = await getData("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

LOSInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getData("refresh_token");

        if (!refreshToken) return;

        const { data } = await authInstance.post(
          "/api/v2/auth/refresh-token",

          {
            refreshToken: refreshToken,
            clientId: "aMBankingClient",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const {
          access_token,
          refresh_token: newRefreshToken,
          publicKey,
        } = data.data;

        await storeData("access_token", access_token);
        await storeData("refresh_token", newRefreshToken);
        await storeData("publicKey", publicKey);

        instance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        LOSInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        KYC_AML_ISTANCE.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;
        idpInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${access_token}`;

        return LOSInstance(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        store.dispatch(
          setState({
            access_token: "",
            refresh_token: "",
            loggedIn: false,
          })
        );
        await removeData("access_token");
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

const setupAxiosInstances = () => {
  const currentUrls = urls[ENVIROMENT];

  LOSInstance.defaults.baseURL = currentUrls.LOAN_BASE_URL;
  idpInstance.defaults.baseURL = currentUrls.IDP_BASE_URL;
  authInstance.defaults.baseURL = currentUrls.AUTH_BASE_URL;
  instance.defaults.baseURL = `${currentUrls.AMBANKING_APP_BASE_URL}/`;
};

export const updateEnvironment = (newEnv: string) => {
  ENVIROMENT = newEnv;
  setupAxiosInstances();
};

setupAxiosInstances();

export default instance;

// Export other security-enhanced API functions
export * from "./securityUtils";

// export const DROPDOWNS = async (
//   type: string,
//   search = "",
//   subtype: string | undefined = undefined
// ) => {
//   try {
//     let url = "";

//     if (subtype) {
//       url = `api/v1/kym/drop-downs/search?type=${type}&searchKey=${search}&subtype=${subtype}`;
//     } else {
//       url = `api/v1/kym/drop-downs/search?type=${type}&searchKey=${search}`;
//     }

//     const response = await instance.get(url);
//     return response.data.data.payload;
//   } catch (error) {
//     return [];
//   }
// };

export const DROPDOWNS = async (
  type: string,
  search = "",
  subtype: string | undefined = undefined
) => {
  try {
    let url = "";

    if (subtype) {
      url = `api/v1/loans/customer/drop-downs/search?type=${type}&searchKey=${search}&subtype=${subtype}`;
    } else {
      url = `api/v1/loans/customer/drop-downs/search?type=${type}&searchKey=${search}`;
    }

    const response = await loanInstance.get(url);
    return response.data.responseStructure.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const EMBASSYDROPDOWN = async (type = "", search = "", subtype = "") => {
  try {
    let url = `api/v1/letter-request/embassy-name?searchKey=${search}`;

    const response = await instance.get(url);

    return response.data.data;
  } catch (error) {
    return [];
  }
};

export const GET_TELLER_MEMBER_DETAILS = async (data: any) => {
  try {
    const response = await instance.post("v1/api/loan/member", data);
    return response.data;
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

export const QR_TRANSACTION = async (data: any) => {
  try {
    const response = await instance.post("v1/api/teller/member", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

export const GET_BALANCE = async (memID: string, dob: string) => {
  try {
    const response = await instance.get(
      `v1/api/ienquiry/account?memberId=${memID}&dob=${dob}`
    );
    return response.data;
  } catch (error) {
    // logErr(error);
  }
};

export const FETCH_BALANCE = async (
  customerNo: string,
  accountClass: string
) => {
  try {
    const response = await instance.get(
      `v1/api/ienquiry/balance?memberId=${customerNo}&accountType=${
        accountClass == "SHARES" ? "SHARE" : "SHARE_DEPOSIT"
      }`

      // branchcode=${branchcode}&customerAccountNo=${customerAccountNo}`
    );
    return response.data;
  } catch (error) {
    // logErr(error);
  }
};

export const FETCH_LETTER = async (memID: string, dob: string) => {
  try {
    const response = await instance.get(
      `api/letter/findAll?customerId=${memID}&dob=${dob}`
    );
    return response.data;
  } catch (error) {
    // logErr(error);
  }
};

export const INFO = async (customerID: string) => {
  try {
    const response = await instance.get(
      `v1/api/loan/profile?custNo=${customerID}`
    );
    return response.data;
  } catch (error) {
    // logErr(error);
  }
};

export const ACCOUNT_OPENING = async (data: any) => {
  try {
    const response = await instance.post("v1/api/account/create", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    // logErr(error);
  }
};

export const GET_CHEQUE = async (cifId: string, dob: string) => {
  try {
    let response = await instance.get(
      `v1/api/cheque/cheques?customerId=${cifId}&dob=${dob}`
    );
    return response.data;
  } catch (error) {
    // logErr(error);
  }
};

export const GET_MEMBER_DETAIL_REKYM = async (
  customerNo: string,
  dob: string
) => {
  try {
    let response = await instance.get(
      `/api/v1/rekym/fetch-contact-info?customerNo=${customerNo}&memberDob=${dob}`
    );
    return response.data.data;
  } catch (error) {
    // logErr(error);
  }
};

export const Bank_To_Tecu = async (payload: any) => {
  try {
    const nonce = generateNonce();
    const timestamp = new Date().toISOString();
    const idempotencyKey = generateNonce(); // Using nonce function for idempotency key as well

    // Construct signature data according to the specified order
    const signatureData =
      payload.payeeId.toString() +
      payload.amount +
      payload.sourceAccountType +
      payload.remarks +
      payload.mobilePin +
      idempotencyKey +
      timestamp +
      nonce;

    const signature = generateSignature(signatureData);

    const response = await instance.post(
      "/v1/api/transactions/bank-to-tecu",
      payload,
      {
        headers: {
          "X-Request-Nonce": nonce,
          "X-Request-Timestamp": timestamp,
          "X-Idempotency-Key": idempotencyKey,
          "X-Request-Signature": signature,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GET_ACCOUNTS = async (customerID: string) => {
  try {
    const response = await instance.get(
      `v1/api/teller/accounts?custNo=${customerID}`
    );

    return response.data;
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

//Balance Enquiry

//fetch all transactions

export const FETCH_ALL_TRANSACTIONS = async (
  memberId: string,
  accountNumber: string
) => {
  try {
    // Generate security parameters
    const nonce = generateNonce();
    const timestamp = new Date().toISOString();
    const signatureData = memberId + accountNumber + timestamp + nonce;
    const signature = generateSignature(signatureData);

    const response = await instance.get(
      `/v1/api/enquiry/balance-transaction?memberId=${memberId}&accountNumber=${accountNumber}`,
      {
        headers: {
          "X-Request-Nonce": nonce,
          "X-Request-Timestamp": timestamp,
          "X-Request-Signature": signature,
        },
      }
    );

    return response.data;
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

//all accounts (common for general and balance enq.)

export const FETCH_ALL_ACCOUNTS = async (memberId: string) => {
  try {
    const response = await instance.get(
      `/v1/api/ienquiry/account?memberId=${memberId}`
    );

    return response.data;
  } catch (error) {
    // logErr(error);
    throw error;
  }
};

export const getIpAddressSafely = () => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve("0.0.0.0");
    }, 2000);

    DeviceInfo.getIpAddress()
      .then((ip) => {
        clearTimeout(timeoutId);
        if (ip && ip !== "0.0.0.0") {
          resolve(ip);
        } else {
          // Fallback to public IP
          fetch("https://api.ipify.org?format=json")
            .then((res) => res.json())
            .then((data) => resolve(data.ip || "0.0.0.0"))
            .catch(() => resolve("0.0.0.0"));
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        resolve("0.0.0.0");
      });
  });
};
export const getDeviceDetails = async () => {
  const deviceIdd = DeviceInfo.getDeviceId();
  const rawdeviceName = await DeviceInfo.getDeviceName();
  const osVersion = DeviceInfo.getSystemVersion();
  const isSecure = await DeviceInfo.isPinOrFingerprintSet();

  const deviceInfo = `${
    Platform.OS === "ios" ? "iOS" : "Android"
  } ${osVersion}, ${isSecure ? "TouchID/biometrics enabled" : "No biometrics"}`;

  const deviceName = rawdeviceName
    .replaceAll("'", "") // remove apostrophes
    .replace(/[^\w\s\-()]/g, "") // remove invalid characters
    .trim();

  return {
    deviceIdd,
    deviceName,
    deviceInfo,
    osVersion: `${Platform.OS === "ios" ? "iOS" : "Android"} ${osVersion}`,
  };
};
