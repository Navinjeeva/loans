import AsyncStorage from "@react-native-async-storage/async-storage";

export function storeData(key: string, value: string): Promise<string> {
  return new Promise((resolve, reject) => {
    AsyncStorage.setItem(key, value)
      .then((value) => resolve("Data stored successfully"))
      .catch(() => reject());
  });
}

export function getData(key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(key)
      .then((value) => resolve(value))
      .catch(() => reject());
  });
}

export function removeData(key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    AsyncStorage.removeItem(key)
      .then((value) => resolve("success"))
      .catch(() => reject());
  });
}
