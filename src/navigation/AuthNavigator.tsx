import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { defaultOptionsForStack } from '../common/config/navigator';
import Register from '../screens/Auth/Register';
import Login from '@src/screens/Auth/Login';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={'Register'}
      screenOptions={defaultOptionsForStack}
    >
      <Stack.Screen name={'Register'} component={Register} />
      <Stack.Screen name={'Login'} component={Login} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
