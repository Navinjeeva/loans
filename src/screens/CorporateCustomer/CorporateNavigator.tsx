import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./HomeScreen";
import ClassificationScreen from "./ClassificationScreen";
import AIExtractionScreen from "./AIExtractionScreen";
import VerifyCompanyScreen from "./VerifyCompanyScreen";
import LoanScreen from "./LoanScreen";
import DocumentsScreen from "./DocumentsScreen";
import ReviewScreen from "./ReviewScreen";
import GeneratedFormScreen from "./GeneratedFormScreen";
import SignatureScreen from "./SignatureScreen";
import OtpScreen from "./OtpScreen";
import SubmittedScreen from "./SubmittedScreen";
import TrackScreen from "./TrackScreen";

const Stack = createNativeStackNavigator();

const CorporateNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="CorporateHome">
      <Stack.Screen name="CorporateHome" component={HomeScreen} />
      <Stack.Screen name="CorporateClassification" component={ClassificationScreen} />
      <Stack.Screen name="CorporateAIExtraction" component={AIExtractionScreen} />
      <Stack.Screen name="CorporateVerifyCompany" component={VerifyCompanyScreen} />
      <Stack.Screen name="CorporateLoan" component={LoanScreen} />
      <Stack.Screen name="CorporateDocuments" component={DocumentsScreen} />
      <Stack.Screen name="CorporateReview" component={ReviewScreen} />
      <Stack.Screen name="CorporateGeneratedForm" component={GeneratedFormScreen} />
      <Stack.Screen name="CorporateSignature" component={SignatureScreen} />
      <Stack.Screen name="CorporateOtp" component={OtpScreen} />
      <Stack.Screen name="CorporateSubmitted" component={SubmittedScreen} />
      <Stack.Screen name="CorporateTrack" component={TrackScreen} />
    </Stack.Navigator>
  );
};

export default CorporateNavigator;
