import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

import store from "@src/store";
import { ThemeProvider } from "@src/common/ThemeContext";
import LoanNavigator from "@src/navigation/LoanNavigator";
import { AlertProvider } from "@src/common/components/Alert/provider";

const App = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <ThemeProvider>
          <PaperProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                <AlertProvider>
                  <SafeAreaView style={styles.root}>
                    <LoanNavigator />
                  </SafeAreaView>
                </AlertProvider>
              </NavigationContainer>
            </SafeAreaProvider>
          </PaperProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
