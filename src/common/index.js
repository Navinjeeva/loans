import TextInputComponent from "./components/TextInputComponent";
import Alert from "./components/Alert";
import { AlertProvider } from "./components/Alert/provider";
import DocumentUpload from "./components/DocumentUpload";
import DropdownWithModal from "./components/DropdownWithModal";

import ImageViewer from "./components/ImageViewer";
import Loader from "./components/Loader";
import MobileNumberComponent from "./components/MobileNumberComponent";
import MultiSelectDropdownModal from "./components/MultiSelectDropdownModal";
import PdfViewer from "./components/PdfViewer";
import Modal from "./components/Modal";
import CurrencyInput from "./components/CurrencyInput";
import DateInput from "./components/DateInput";
import Checkbox from "./components/Checkbox";

import IdpDocumentUpload from "./components/IdpDocumentUpload";
// Utils
import DeviceInfo from "./utils/DeviceInfo";
import { getDeviceSize, DeviceSizeConst } from "./utils/deviceSize";
import { logAlert, logErr, logSuccess } from "./utils/logger";
import metrics from "./utils/metrics";
import { getData, removeData, storeData } from "./utils/storage";
import {
  isValidDate,
  addMonthsToDate,
  fixedNumber,
  DAYS,
  MONTH_LIST,
  YEARS,
  fixedTwoNumber,
  formatNumber,
  formatWithoutInr,
  getBase64Data,
  openLink,
  parseDateString,
  showMinuteFromSeconds,
  showNumberOptions,
  useComponentWillUnmount,
} from "./utils/format";
import {
  currencyFormatter,
  NavigationOptions,
  formatCriteria,
  calculateAge,
  calculateExpiry,
  camelCaseToNormal,
  capitalizeFirstLetter,
  convertArrayToObj,
  convertArrayToObjForModal,
  convertBase64ToMultipartURI,
  formDataFileFormer,
  isPastDate,
  parseFullName,
  removeDashFromNumberString,
  stringSeperator,
  useDebounce,
  validateAndSanitizeInput,
} from "./utils/string";
import {
  calculateImageHeight,
  getScreenActualHeight,
  getScreenActualWidth,
  moderateScaling,
  verticalScaling,
} from "./utils/styleHelper";

export {
  TextInputComponent,
  Alert,
  AlertProvider,
  DocumentUpload,
  DropdownWithModal,
  IdpDocumentUpload,
  ImageViewer,
  Loader,
  MobileNumberComponent,
  MultiSelectDropdownModal,
  CurrencyInput,
  DateInput,
  Modal,
  PdfViewer,
  DeviceInfo,
  getDeviceSize,
  DeviceSizeConst,
  logAlert,
  logErr,
  logSuccess,
  metrics,
  getData,
  removeData,
  storeData,
  Checkbox,
  isValidDate,
  currencyFormatter,
  NavigationOptions,
  formatCriteria,
  calculateAge,
  calculateExpiry,
  camelCaseToNormal,
  capitalizeFirstLetter,
  convertArrayToObj,
  convertArrayToObjForModal,
  convertBase64ToMultipartURI,
  formDataFileFormer,
  isPastDate,
  parseFullName,
  removeDashFromNumberString,
  stringSeperator,
  useDebounce,
  validateAndSanitizeInput,
  addMonthsToDate,
  fixedNumber,
  DAYS,
  MONTH_LIST,
  YEARS,
  fixedTwoNumber,
  formatNumber,
  formatWithoutInr,
  getBase64Data,
  openLink,
  parseDateString,
  showMinuteFromSeconds,
  showNumberOptions,
  useComponentWillUnmount,
  calculateImageHeight,
  getScreenActualHeight,
  getScreenActualWidth,
  moderateScaling,
  verticalScaling,
};
