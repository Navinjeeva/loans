import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState: any = {
  step: 0,
  loading: false,
  data: {
    dob: "",
    customerDocument: "",
    customerName: "",
    customerNumber: "",
    criteria: "Member ID",
    currentStep: 0,
    completedTillStep: 0,
    otherDocsCount: 1,
    legalDocsCount: 1,
    salarySlipDocsCount: 1,
    jobLetterDocsCount: 1,
    bankStatementDocsCount: 1,
    success: false,
    pdfs: [],
    cifId: "",
    loanId: "",
    loanCategory: "",
    loanProduct: "",
    securityType: "Share",
    accountDetails: {
      accountNumber: "",
      accountDescription: "",
      availableBalance: "",
    },
    currency: "TTD",
    loanAmount: "",
    tenure: "36",
    moratorium: "0",
    defaultInterestRate: 0,
    tentativeEmi: "",
    startDate: "",
    tentativeDueDate: "",
    holdShares: false,
    blockAmount: "",
    purposeOfLoan: "",
    purposeOfLoanDescription: "",
    purposeDescription: "",
    remarks: "",
    preferredBranch: "",
    preferredLoanOfficer: "",
    preferredLoanOfficerDesc: "",
    collateralType: "",
    collateralAddressLine1: "",
    collateralAddressLine2: "",
    city: "",
    reference1FirstName: "",
    reference1LastName: "",
    reference1PhoneNumberCountryCode: "",
    reference1PhoneNumber: "",
    reference2FirstName: "",
    reference2LastName: "",
    reference2PhoneNumberCountryCode: "",
    reference2PhoneNumber: "",
    landAmt: "",
    buildingAmt: "",
    vehicleAmt: "",
    otherAmt: "",
    insuranceAmt: "",
    bankDepositsAmt: "",
    mutualFundsAmt: "",
    bankDepositOptions: [""],
    //loanAccount: null,
    loanAccounts: [],
    bankDepositAmounts: {
      fcbAmt: "",
      rblAmt: "",
      rbcAmt: "",
      scotiaAmt: "",
      creditUnionAmt: "",
    },
    financialDocuments: [[], [], [], [], []],
    supportingDocuments: [[], [], [], [], []],

    // For Rollover
    loanAccount: "",
    rolloverDocuments: [[], [], [], [], []],

    tnc1: false,
    tnc2: false,
    tnc3: false,
    tnc4: false,
    options: {
      purposeOfLoan: [],
      sharesData: {},
      fixedDepositData: [],
      branchData: {
        100: {},
        200: {},
        300: {},
      },
      loanOfficerData: [],
    },
  },
};

export const loansSlice = createSlice({
  name: "loans",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<any>) => {
      return (state = { ...state, data: { ...state.data, ...action.payload } });
    },
    setOptionsState: (state, action: PayloadAction<any>) => {
      return (state = {
        ...state,
        data: {
          ...state.data,
          options: {
            ...state.data.options,
            ...action.payload,
          },
        },
      });
    },
    setFieldState: (state, action: PayloadAction<any>) => {
      return (state = {
        ...state,
        data: { ...state.data, [action.payload.key]: action.payload.value },
      });
    },
    resetWithSetState: (state, action: PayloadAction<any>) => {
      return (state = {
        ...initialState,
        data: { ...initialState.data, ...action.payload },
      });
    },
    resetState: (state) => {
      return (state = initialState);
    },
    setStep: (state, action: PayloadAction<any>) => {
      return (state = { ...state, step: action.payload });
    },
    toggleLoading: (state) => {
      return (state = { ...state, loading: !state.loading });
    },
  },
});

export const {
  setState,
  resetState,
  setStep,
  setFieldState,
  toggleLoading,
  setOptionsState,
  resetWithSetState,
} = loansSlice.actions;

export default loansSlice.reducer;
