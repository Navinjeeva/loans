import { useEffect, useState } from "react";
import { addMonthsToDate } from "./format";
import { Platform } from "react-native";
import RNFS from "react-native-fs";

export function camelCaseToNormal(text: string): string {
  const result = text.replace(/([a-z])([A-Z])/g, "$1 $2");
  // Capitalize the first letter of each word
  const capitalizedResult = result.replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );
  return capitalizedResult.trim();
}

export function isPastDate(dateString: string) {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
}

export const validateAndSanitizeInput = (text: string | String) => {
  const allowedPattern = /^[a-zA-Z0-9.,'\- ]*$/;
  if (!allowedPattern.test(text)) {
    text = text
      .split("")
      .filter((char) => /^[a-zA-Z0-9.,'\- ]$/.test(char))
      .join("");
  }
  return text.toUpperCase();
};

export function useDebounce(value: string, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup the timeout if the value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function convertArrayToObj(
  array: {
    [keyDesc: string]: string;
  }[]
) {
  return array.reduce((obj, item) => {
    obj[item.keyDesc] = item.keyId;
    return obj;
  }, {});
}

export function convertArrayToObjForModal(
  array: {
    [keyDesc: string]: string;
  }[]
) {
  let arr: { label: string; value: string }[] = [];
  array.forEach((item) => {
    arr.push({
      label: item.keyDesc,
      value: item.keyId,
    });
  });
  return arr;
}

export function capitalizeFirstLetter(inputString: string) {
  return inputString
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function removeDashFromNumberString(number: string) {
  return number.replace(/-/g, "");
}

export function stringSeperator(
  text: string,
  seperator: string
): string[][] | string[] {
  if (typeof seperator === "object") {
    const records = text.split("\n");
    const result = records.map((record) => record.split(seperator[0]));
    return result;
  } else {
    return text.split(seperator);
  }
}

export const formatCriteria = (criteria: string) => {
  return criteria.toUpperCase().replace(/\s+/g, "_");
};

export const currencyFormatter = (number: number | string | null) => {
  number = Number(number);

  return (
    "$ " +
    number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

export const convertBase64ToMultipartURI = (base64String: string) => {
  let cleanBase64 = base64String;
  if (base64String.includes(",")) {
    cleanBase64 = base64String.split(",")[1];
  }

  const binaryData = atob(cleanBase64);
  const byteNumbers = new Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    byteNumbers[i] = binaryData.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Create a Blob from the byte array
  const blob = new Blob([byteArray], { type: "image/png" });

  return Platform.OS === "ios" ? blob._data.name : "file://" + blob._data.name;
};

export interface NavigationOptions {
  name: string;
  navigate: (route: string, params?: any) => void;
  goBack: () => void;
  reset: (state: {
    index: number;
    routes: { name: string; params?: any }[];
  }) => void;
  replace: (route: string, params?: any) => void;
  pop: () => void;
  push: (route: string, params?: any) => void;
  popToTop: () => void;
  setParams: (params: any) => void;
  isFocused: () => boolean;
  canGoBack: () => boolean;
  getParent: () => any;
  getState: () => any;
}

export function parseFullName(fullName: string) {
  const nameParts = fullName.trim().split(/\s+/);
  let firstName = "",
    middleName = "",
    lastName = "";

  if (nameParts.length === 1) {
    firstName = nameParts[0];
  } else if (nameParts.length === 2) {
    firstName = nameParts[0];
    lastName = nameParts[1];
  } else {
    firstName = nameParts[0];
    lastName = nameParts[nameParts.length - 1];
    middleName = nameParts.slice(1, -1).join(" ");
  }

  return {
    firstName,
    middleName,
    lastName,
  };
}

export function calculateAge(dateString: string) {
  const birthDate = new Date(dateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  const dayDifference = today.getDate() - birthDate.getDate();

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age--;
  }

  return age.toString();
}

export function calculateExpiry(expiryDateStr: string) {
  const expiryDate: any = new Date(expiryDateStr);
  const today: any = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);
  const timeDifference = expiryDate - today;
  const daysRemaining = timeDifference / (1000 * 60 * 60 * 24);
  if (daysRemaining < 0) {
    return "0";
  }
  return Math.ceil(daysRemaining).toString();
}

export const formDataFileFormer = async ({
  uri,
  type,
  name,
}: {
  uri: string;
  type: string;
  name: string;
}) => {
  try {
    if (
      uri.startsWith("data:application/pdf;base64") ||
      uri.startsWith("JVBER")
    ) {
      // Define a temporary file path
      const filePath = `${RNFS.DocumentDirectoryPath}/${name}`;

      let base64Data;
      // Extract only the Base64 content (remove metadata)
      if (uri.startsWith("data:application/pdf;base64,")) {
        base64Data = uri.replace("data:application/pdf;base64,", "");
      } else if (uri.startsWith("JVBER")) {
        base64Data = uri; // Already pure base64 PDF data
      } else {
        base64Data = uri.split(",")[1];
      }

      // Write the Base64 string to a file
      await RNFS.writeFile(filePath, base64Data, "base64");

      return {
        uri: "file://" + filePath, // Ensure correct file path format
        name: name,
        type: type,
      };
    } else {
      return {
        uri: uri,
        type: type,
        name: name,
      };
    }
  } catch (error) {
    console.error(error);
  }
};
