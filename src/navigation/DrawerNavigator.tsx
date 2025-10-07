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
import { useDispatch, useSelector } from 'react-redux';
import { setState } from '@src/store/auth';
import { getData, removeData } from '@src/common/utils/storage';
import { authInstance, scheduleTokenRefresh } from '@src/services';

const Tab = createBottomTabNavigator();

const DrawerNavigator = () => {
  const navigation = useNavigation<NavigationOptions>();
  const [cameraOn, setCameraOn] = useState(false);
  const { username, modules } = useSelector((state: any) => state.auth);

  const dispatch = useDispatch();

  const handleTabPress = (routeName: any) => {
    navigation.navigate(routeName);
  };

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       if (!username) {
  //         dispatch(
  //           setState({
  //             access_token: '',
  //             refresh_token: '',
  //             sessionTime: new Date(),
  //           }),
  //         );
  //         await removeData('access_token');
  //         await removeData('refresh_token');
  //       }

  //       const access = await getData('access_token');

  //       if (access) {
  //         scheduleTokenRefresh(access);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   })();
  // }, [username]);

  return (
    <>
      <Tab.Navigator
        initialRouteName="Products"
        screenOptions={{
          headerShown: false,
          unmountOnBlur: true,
          tabBarStyle: { display: 'none' },
          tabBarVisible: false,
        }}
        tabBar={() => null}
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
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tab.Navigator>
    </>
  );
};

export default DrawerNavigator;
