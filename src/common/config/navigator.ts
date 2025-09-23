import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export const defaultOptionsForStack: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'fade',
  contentStyle: {
    backgroundColor: 'transparent',
  },
  navigationBarColor: 'white',
  // navigationBarHidden: true,
};

export const defaultScreenOptionsForTab: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarStyle: { display: 'flex' },
};
