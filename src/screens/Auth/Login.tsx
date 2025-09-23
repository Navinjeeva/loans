import { useNavigation } from '@react-navigation/native';
import { closeEyeIcon, eyeIcons, loginBgIcon } from '@src/common/assets';
import Button from '@src/common/components/Button';
import Loader from '@src/common/components/Loader';
import MobileNumberInputComponent from '@src/common/components/MobileNumberComponent';
import TextInputComponent from '@src/common/components/TextInputComponent';
import { logErr } from '@src/common/utils/logger';
import { storeData } from '@src/common/utils/storage';
import { useTheme } from '@src/common/utils/ThemeContext';
import { authInstance } from '@src/services';
import { setState } from '@src/store/auth';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const Login = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { username, password } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { data } = await authInstance.post('/api/v1/auth/login', {
        userName: username,
        password: password,
      });

      const { accessToken, refreshToken } = data.responseStructure.data;

      await storeData('access_token', accessToken);
      await storeData('refresh_token', refreshToken);

      dispatch(
        setState({
          access_token: accessToken,
          refresh_token: refreshToken,
          loggedIn: true,
        }),
      );
    } catch (error) {
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Loader loading={loading} />
      <View style={styles.container}>
        <Image source={loginBgIcon} resizeMode="contain" style={styles.hero} />

        <View style={styles.headingBlock}>
          <Text style={styles.brand}>Welcome Back</Text>
        </View>

        <View style={{ gap: wp(2), width: '90%' }}>
          <TextInputComponent
            header="User Name"
            maxLength={10}
            inputStyles={{ height: hp(6), fontSize: hp(1.7) }}
            value={username}
            onChange={value =>
              dispatch(
                setState({
                  username: value,
                }),
              )
            }
          />
          <View style={styles.inputWrapper}>
            <TextInputComponent
              header="Enter Password"
              inputStyles={{
                fontSize: hp(1.8),
              }}
              placeholder="Enter Password"
              maxLength={16}
              value={password}
              onChange={(text: string) => {
                dispatch(
                  setState({
                    password: text,
                  }),
                );
              }}
              autocapitalize="none"
              keyboardType="default"
              required={false}
              secureTextEntry={!passwordVisible}
              caps={false}
            />
            {/* Eye Icon */}
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.inputIcon}
            >
              {passwordVisible ? (
                <Image
                  source={eyeIcons}
                  style={{ width: wp(5), height: wp(5) }}
                  tintColor={colors.text}
                />
              ) : (
                <Image
                  source={closeEyeIcon}
                  style={{ width: wp(5), height: wp(5) }}
                  tintColor={colors.text}
                />
              )}
            </TouchableOpacity>
          </View>
          <Text style={{ color: colors.primary, textAlign: 'right' }}>
            Forgot Password?
          </Text>
        </View>

        <View style={styles.actions}>
          <Button text="Log In" onPress={handleLogin} />
          <Text style={{ textAlign: 'center' }}>
            Don't you have an account?{' '}
            <Text style={{ color: colors.primary }}>Sign up</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  hero: {
    width: width * 0.8,
    height: width * 0.8,
    marginTop: 24,
  },
  headingBlock: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  brand: {
    fontSize: hp(2.5),
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    color: '#6B7280',
  },
  actions: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 24,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#6C4AF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    marginHorizontal: 12,
    color: '#6B7280',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#6C4AF2',
    fontSize: 16,
    fontWeight: '700',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: hp(2.5),
  },
  inputIcon: {
    position: 'absolute',
    right: wp(4),
    top: '65%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
});

export default Login;
