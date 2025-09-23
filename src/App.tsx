/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { AlertProvider } from './common/components/Alert/provider';
import { ThemeProvider } from './common/utils/ThemeContext';
import { Provider } from 'react-redux';
import store from '@src/store/index';
import { PaperProvider, ProgressBar } from 'react-native-paper';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  enableScreens(true);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ThemeProvider>
        <PaperProvider>
          <Provider store={store}>
            <AlertProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </AlertProvider>
          </Provider>
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
