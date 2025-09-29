import { useNavigation } from '@react-navigation/native';
import { loginBgIcon } from '@src/common/assets';
import Button from '@src/common/components/Button';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import { logAlert } from '@src/common/utils/logger';
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const Register = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Image
            source={loginBgIcon}
            resizeMode="contain"
            style={styles.hero}
          />

          <View style={styles.headingBlock}>
            <Text style={styles.brand}>IMPACTO</Text>
            <Text style={styles.title}>LOAN ORIGINATION SYSTEM</Text>
            <Text style={styles.subtitle}>
              {`Efficiency in Motion, Accuracy in View  Redefining Lending, Designed for You`}
            </Text>
          </View>

          <View style={styles.actions}>
            <Button text="Login" onPress={() => navigation.navigate('Login')} />

            <View style={styles.separatorRow}>
              <View style={styles.separator} />
              <Text style={styles.separatorText}>or</Text>
              <View style={styles.separator} />
            </View>

            <Button text="Sign Up" onPress={() => logAlert('Comming Soon')} />
          </View>
        </View>
      </KeyboardAwareScrollView>
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
    fontSize: 24,
    lineHeight: 28,
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
  scrollContent: {
    flexGrow: 1,
  },
});

export default Register;
