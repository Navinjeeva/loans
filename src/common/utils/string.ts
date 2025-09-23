import { useEffect, useState } from 'react';

import { Platform } from 'react-native';

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

export function capitalizeFirstLetter(inputString: string) {
  return inputString
    .split(' ')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

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
