import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Customer from "@src/screens/Loan/index";
import Application from "@src/screens/Loan/Application";
import Verification from "@src/screens/Loan/Verification";
import AdditionalDetails from "@src/screens/Loan/AdditionalDetails";
import AddBeneficiary from "@src/screens/Loan/AddBeneficiary";
import Pep from "@src/screens/Loan/Pep";
import Fatca from "@src/screens/Loan/Fatca";
import DocumentHolderVerification from "@src/screens/Loan/DocumentHolderVerification";
import MemberDetails from "@src/screens/Loan/MemberDetails";
import ReviewDocument from "@src/screens/Loan/ReviewDocument";
import Signature from "@src/screens/Loan/Signature";
import FinalScreen from "@src/screens/Loan/FinalScreen";

const Stack = createNativeStackNavigator();

const LoanNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="LoanCustomer"
    >
      <Stack.Screen name="LoanCustomer" component={Customer} />
      <Stack.Screen name="LoanApplication" component={Application} />
      <Stack.Screen name="LoanVerification" component={Verification} />
      <Stack.Screen name="LoanAdditionalDetails" component={AdditionalDetails} />
      <Stack.Screen name="LoanAddBeneficiary" component={AddBeneficiary} />
      <Stack.Screen name="LoanPep" component={Pep} />
      <Stack.Screen name="LoanFatca" component={Fatca} />
      <Stack.Screen
        name="LoanDocumentHolderVerification"
        component={DocumentHolderVerification}
      />
      <Stack.Screen name="LoanMemberDetails" component={MemberDetails} />
      <Stack.Screen name="LoanReviewDocument" component={ReviewDocument} />
      <Stack.Screen name="LoanSignature" component={Signature} />
      <Stack.Screen name="LoanFinalScreen" component={FinalScreen} />
    </Stack.Navigator>
  );
};

export default LoanNavigator;
