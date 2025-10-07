import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  customerId: '',

  // Loan Application Data
  loanPurpose: '',
  promotions: '',
  name: '',
  isdCode: '+1868',
  mobileNumber: '',
  email: '',
  loanAmount: '',
  loanTenor: '',
  tenorDuration: '',
  moratorium: '-',
  tentativeInterestRate: '',

  // Member Onboarding Data
  whatsappNumber: '',
  whatsappIsdCode: '+1868',
  mobileVerified: false,
  whatsappVerified: false,
  emailVerified: false,

  // Calculated EMI Data
  monthlyEMI: '',
  principalAmount: '',
  totalInterest: '',
  totalAmountPayable: '',

  // IDP Information
  idpFirstName: '',
  idpLastName: '',
  idpDateOfBirth: '',
  idpGender: '',
  idpAddress: '',

  // Personal Information
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

  // Linked Entities Documents (2 documents)
  linkedEntitiesDocuments: [
    { id: 1, name: 'Beneficiary Document', doc: [], details: {} },
    { id: 2, name: 'Joint Partner Document', doc: [], details: {} },
  ],

  // Joint Partner Documents
  jointPartnerDocuments: [
    { id: 1, name: 'Joint Partner Document 1', doc: [], details: {} },
    { id: 2, name: 'Joint Partner Document 2', doc: [], details: {} },
  ],

  // Beneficiary Documents
  beneficiaryDocuments: [
    { id: 1, name: 'Beneficiary Document 1', doc: [], details: {} },
    { id: 2, name: 'Beneficiary Document 2', doc: [], details: {} },
  ],

  additionalBeneficiary: [
    { id: 1, name: 'Beneficiary Document', doc: [], details: {} },
  ],

  additionalJointPartner: [
    { id: 1, name: 'Joint Partner Document', doc: [], details: {} },
  ],

  // Additional Details
  additionalDetails: {
    nationality: '',
    primaryNationalityKeyId: '',
    residency: '',
    residencyKeyId: '',
    countryOfBirth: '',
    countryOfBirthKeyId: '',
    placeOfBirth: '',
    placeOfBirthKeyId: '',
    preferredModeOfCommunication: '',
    preferredModeOfCommunicationDesc: '',
    maritalStatus: '',
    maritalStatusKeyId: '',
  },

  // PEP (Politically Exposed Person) Data
  pep: {
    isHeadOfState: false,
    isHeadOfGovt: false,
    isSenPolitician: false,
    isSenGovtOfficial: false,
    isSenJudicialOfficial: false,
    isSenMilitaryOfficial: false,
    isSenExecSOC: false,
    isImpPPO: false,
    isImmediateFamily: false,
    isMemberOfSeniorManagement: false,
    isPepAssociate: false,
    additionalPepInfo: '',
  },

  // FATCA (Foreign Account Tax Compliance Act) Data
  fatca: {
    isGreenCardHolder: false,
    isGranteePOA: false,
    hasStandingInstructIncome: false,
    isDisclosureTaxResidency: false,
    fatcaCountry1Key: '',
    fatcaCountry1Desc: '',
    fatcaCountry2Key: '',
    fatcaCountry2Desc: '',
    ssnNo1: '',
    ssnNo2: '',
    documentType: '',
    fatcaDocument: [],
    referenceLetter: [],
  },
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
