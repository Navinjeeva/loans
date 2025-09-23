import axios from 'axios';
import { Platform } from 'react-native';

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
    IDP_BASE_URL: 'https://qa-ocr.impactodigifin.xyz',
    AMBANKING_APP_BASE_URL: 'https://qa-api.ambanking.impactodigifin.xyz',
    AUTH_BASE_URL: 'https://qa-api-iam.impactodigifin.xyz',
    KYC_AML_URL: 'https://qa-api-kyc.impactodigifin.xyz',
    ONESIGNAL_ID: 'bd28081a-518b-4761-93d0-6280f1853d55',
  },
  UAT: {
    ENVIROMENT: 'UAT',
    ANDROID_VERSION_NAME: '3.0.0',
    LOAN_BASE_URL: 'https://uat-api-los.impactodigifin.xyz/api/v1/ambassador',
    IDP_BASE_URL: 'https://qa-ocr.impactodigifin.xyz',
    AMBANKING_APP_BASE_URL: 'https://uat-api-ambanking.impactodigifin.xyz',
    AUTH_BASE_URL: 'https://uat-api-iam.impactodigifin.xyz',
    KYC_AML_URL: 'https://uat-api-kyc.impactodigifin.xyz',
    ONESIGNAL_ID: 'bd28081a-518b-4761-93d0-6280f1853d55',
  },
  VAPT: {
    ENVIROMENT: 'VAPT',
    ANDROID_VERSION_NAME: '2.2.5',
    LOAN_BASE_URL: 'https://vapt-api-los.tecutt.com/api/v1/ambassador',
    IDP_BASE_URL: 'http://192.168.240.112:8000',
    AMBANKING_APP_BASE_URL: 'https://vapt-api-ambanking.tecutt.com',
    AUTH_BASE_URL: 'https://vapt-api-iam.tecutt.com',
    KYC_AML_URL: 'https://vapt-api-kyc.tecutt.com',
    ONESIGNAL_ID: 'bd28081a-518b-4761-93d0-6280f1853d55',
  },
  PREPROD: {
    ENVIROMENT: 'PREPROD',
    ANDROID_VERSION_NAME: '2.3.0',
    LOAN_BASE_URL: 'https://api-los-preprod.tecutt.com/api/v1/ambassador',
    IDP_BASE_URL: 'http://192.168.240.112:8000',
    AMBANKING_APP_BASE_URL: 'https://api-ambanking-preprod.tecutt.com',
    AUTH_BASE_URL: 'https://api-iam-preprod.tecutt.com',
    KYC_AML_URL: 'https://api-kyc-preprod.tecutt.com',
    ONESIGNAL_ID: 'bd28081a-518b-4761-93d0-6280f1853d55',
  },
  PROD: {
    ENVIROMENT: 'PROD',
    ANDROID_VERSION_NAME: '2.2.7',
    LOAN_BASE_URL: 'https://api-los.tecutt.com/api/v1/ambassador',
    IDP_BASE_URL: 'http://192.168.240.112:8000',
    AMBANKING_APP_BASE_URL: 'https://api-ambanking.tecutt.com',
    AUTH_BASE_URL: 'https://api-iam.tecutt.com',
    KYC_AML_URL: 'https://api-kyc.tecutt.com',
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

const instance = axios.create({
  baseURL: `${AMBANKING_APP_BASE_URL}/`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

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
