import React from "react";
import { isDate, parse } from "date-fns";
import moment from "moment";
import { Linking, PermissionsAndroid } from "react-native";
import RNFetchBlob from "react-native-blob-util";

export type showNumberOptions = {
  thousands?: string;
  currency?: string;
  separator?: string;
  style?: string | undefined;
};

export function formatNumber(price: number = 0) {
  let number = price;
  const formattedCurrency = number.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formattedCurrency;
}

export function formatWithoutInr(price: number = 0) {
  let number = price;
  const formattedNumber = new Intl.NumberFormat().format(number);
  return formattedNumber;
}

export function fixedNumber(price: any) {
  let value = Math.floor(price * 1000) / 1000;
  return value;
}

export function fixedTwoNumber(price: any) {
  let value = Math.floor(price * 100) / 100;
  return value;
}

export function parseDateString(value: Date, originalValue: Date) {
  const parsedDate = isDate(originalValue)
    ? originalValue
    : parse(originalValue, "yyyy-MM-dd", new Date());

  return parsedDate;
}

export function showMinuteFromSeconds(value: number) {
  const minute = Math.floor(value / 60);
  const seconds = value - minute * 60;
  return [
    String(minute).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

export const YEARS = () => {
  const years = [];
  const dateStart = moment().subtract(100, "y");
  const dateEnd = moment().subtract(18, "y");
  while (dateEnd.diff(dateStart, "years") >= 0) {
    years.push({
      label: dateStart.format("YYYY"),
      value: dateStart.format("YYYY"),
    });
    dateStart.add(1, "year");
  }
  return years.reverse();
};

export const MONTH_LIST = () => {
  const months = [];
  const dateStart = moment();
  const dateEnd = moment().add(12, "month");
  while (dateEnd.diff(dateStart, "months") >= 0) {
    months.push({
      label: dateStart.format("MMM"),
      value: dateStart.format("MM"),
    });
    dateStart.add(1, "M");
  }
  return months;
};

export const DAYS = () => {
  const days = [];
  const dateStart = moment();
  const dateEnd = moment().add(30, "days");
  while (dateEnd.diff(dateStart, "days") >= 0) {
    days.push({ label: dateStart.format("DD"), value: dateStart.format("DD") });
    dateStart.add(1, "days");
  }
  return days;
};

export const openLink = (url: string) => {
  Linking.canOpenURL(url)
    .then(() => {
      Linking.openURL(url);
    })
    .catch((err) => {
      // toastFailed(err.message)
    });
};

export const useComponentWillUnmount = (handler: any) => {
  return React.useEffect(() => handler(), []);
};

export function addMonthsToDate(date: Date, months: number) {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  if (newDate.getDate() !== date.getDate()) {
    newDate.setDate(0);
  }
  return newDate;
}

function getPermissions() {
  return new Promise(async (resolve, reject) => {
    const permissions = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    if (permissions === PermissionsAndroid.RESULTS.GRANTED) resolve(true);
    else reject(false);
  });
}

export const getBase64Data = async (uri: string) => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.info("Permission granted");
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
      const base64Data = await RNFetchBlob.fs.readFile(uri, "base64");
      return base64Data;
    } else {
      throw new Error("File does not exist at the specified path.");
    }
  } catch (error) {
    console.error("Error reading file as base64:", error);
    throw new Error("Failed to read file");
  }
};

export function isValidDate(dateString: string) {
  // Regular expression to check if the format is "YYYY-MM-DD"
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  // Check if the date matches the regex pattern
  if (!regex.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day); // This uses local time

  // Check if the date is valid by comparing the input string and the Date object
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
