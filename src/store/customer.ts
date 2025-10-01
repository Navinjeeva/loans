import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  // Loan Application Data
  loanPurpose: 'Personal Loan',
  isdCode: '+91',
  mobileNumber: '',
  email: '',
  loanAmount: '',
  loanTenure: '',
  tentativeInterestRate: '',

  // Member Onboarding Data
  whatsappNumber: '',
  whatsappIsdCode: '+91',
  mobileVerified: false,
  whatsappVerified: false,
  emailVerified: false,

  // Calculated EMI Data
  monthlyEMI: '00,000',
  principalAmount: '00,00,000',
  totalInterest: '00,000',
  totalAmountPayable: '00,00,000',

  // Personal Information
  name: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  aadhaarNumber: '',
  vid: '',

  isMember: false,

  // Documents
  extraDocuments: [{ id: 1, name: '', doc: [], details: {} }],
  personalDocuments: [{ id: 1, name: '', doc: [], details: {} }],
  loanDocuments: [{ id: 1, name: '', doc: [], details: {} }],

  // Joint Partner Documents (2 documents)
  jointPartnerDocuments: [
    { id: 1, name: 'Joint Partner Document 1', doc: [], details: {} },
    { id: 2, name: 'Joint Partner Document 2', doc: [], details: {} },
  ],

  // Beneficiary Documents (2 documents)
  beneficiaryDocuments: [
    { id: 1, name: 'Beneficiary Document 1', doc: [], details: {} },
    { id: 2, name: 'Beneficiary Document 2', doc: [], details: {} },
  ],

  // Linked Identities Documents (2 documents)
  linkedIdentitiesDocuments: [
    { id: 1, name: 'Linked Identity Document 1', doc: [], details: {} },
    { id: 2, name: 'Linked Identity Document 2', doc: [], details: {} },
  ],
};
export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<any>) => {
      return (state = { ...state, ...action.payload });
    },
    resetState: state => {
      return (state = initialState);
    },
  },
});
export const { setState, resetState } = customerSlice.actions;
export default customerSlice.reducer;
