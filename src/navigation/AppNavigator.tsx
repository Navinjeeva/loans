import React, { useEffect, useRef, useState } from 'react';
import AuthNavigator from './AuthNavigator';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  PanResponder,
  Modal,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Vibration,
  Platform,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Loader from '../common/components/Loader';
import DrawerNavigator from './DrawerNavigator';
import { setState } from '@src/store/auth';

const TWO_MINUTES_THIRTY_SECONDS = 1000 * 60 * 2; // 2 minutes

const AppNavigator = () => {
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const { loggedIn } = useSelector((state: any) => state.auth);
  const refreshTokenRef = useRef(loggedIn);

  console.log(loggedIn, 'h9g9g');

  useEffect(() => {
    refreshTokenRef.current = loggedIn;
  }, [loggedIn]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      dispatch(
        setState({
          loggedIn: true,
        }),
      );

      setLoading(false);
    })();
  }, [loggedIn]);

  console.log(loggedIn, 'uoh00h');

  if (loading)
    return (
      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Loader loading={loading} />
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
    >
      {!loggedIn ? <AuthNavigator /> : <DrawerNavigator />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: wp(80),
    backgroundColor: 'white',
    borderRadius: 10,
    padding: hp(2),
    paddingTop: hp(3),
    alignItems: 'center',
  },
  modalText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: hp(2),
    marginBottom: hp(4),
    color: '#000',
  },
  modalImage: {
    width: wp(25),
    height: hp(12),
    marginBottom: hp(3),
  },
  counter: {
    backgroundColor: '#E3781C',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: hp(3),
    // marginBottom: hp(2),
  },
});
export default AppNavigator;
