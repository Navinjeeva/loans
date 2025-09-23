import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import CustomTabBar from '@src/common/components/CustomTabBar/CustomTabBar';
import { NavigationOptions } from '@src/common/utils/string';
import { CustomerStack } from '@src/screens/Customer';
import { closeIcon } from '@src/common/assets';

const Tab = createBottomTabNavigator();

const DrawerNavigator = () => {
  const navigation = useNavigation<NavigationOptions>();
  const [cameraOn, setCameraOn] = useState(false);

  const handleTabPress = (routeName: any) => {
    navigation.navigate(routeName);
  };

  return (
    <>
      <Tab.Navigator
        initialRouteName="Products"
        screenOptions={{
          headerShown: false,
          unmountOnBlur: true,
        }}
      >
        {/* <Tab.Screen
          name="DASHBOARD"
          component={DASHBOARDSTACK}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? dashboardActive : dashboard}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        /> */}
        <Tab.Screen
          name="Products"
          component={CustomerStack}
          options={{
            tabBarLabel: 'Products',
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? closeIcon : closeIcon}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Scan"
          component={CustomerStack}
          options={{
            tabBarIcon: () => (
              <Image
                source={closeIcon}
                style={{ width: wp(4.8), height: wp(4.8), tintColor: '#fff' }}
              />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: e => {
              setCameraOn(true);
            },
          })}
        />

        <Tab.Screen
          name="Productss"
          component={CustomerStack}
          options={{
            tabBarLabel: 'Products',
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? closeIcon : closeIcon}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

export default DrawerNavigator;
