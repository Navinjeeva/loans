import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { stat } from "react-native-fs";

// ─── Types ──────────────────────────────────────────────────────────────────
export type Option = { label: string; value: string };
export type BanksAccounts = {value : string, bankName : string, number:string, type : string}

export interface CatalogsState {
  designations: Option[];
  businessTypes: Option[];
  industries: Option[];
  countries: Option[];
  states: Option[];
  loaded: boolean; // flips to true once the first API fetch resolves


  // loans Details 
  loanCategory : Option[];
  loanProducts : Option[];
  purposeOfLoans : Option[];
  mortariumOptions : Option[];
  linkedBankAccounts : BanksAccounts[];
}



// ─── Sample data (replace with API later) ──────────────────────────────────
const SAMPLE_DESIGNATIONS: Option[] = [
  { label: "Managing Director", value: "Managing Director" },
  { label: "Whole-time Director", value: "Whole-time Director" },
  { label: "Director", value: "Director" },
  { label: "Non-Executive Director", value: "Non-Executive Director" },
  { label: "Independent Director", value: "Independent Director" },
  { label: "Chief Executive Officer", value: "Chief Executive Officer" },
  { label: "Chief Financial Officer", value: "Chief Financial Officer" },
  { label: "Company Secretary", value: "Company Secretary" },
];

const SAMPLE_BUSINESS_TYPES: Option[] = [
  { label: "Private Limited", value: "Private Limited" },
  { label: "LLP", value: "LLP" },
  { label: "Partnership", value: "Partnership" },
  { label: "Sole Proprietorship", value: "Sole Proprietorship" },
  { label: "Public Limited", value: "Public Limited" },
];

const SAMPLE_INDUSTRIES: Option[] = [
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Retail", value: "Retail" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Technology", value: "Technology" },
  { label: "Logistics", value: "Logistics" },
  { label: "Construction", value: "Construction" },
  { label: "Trading & Distribution", value: "Trading & Distribution" },
  { label: "Financial Services", value: "Financial Services" },
];

const SAMPLE_COUNTRIES: Option[] = [
  { label: "India", value: "India" },
  { label: "United States", value: "United States" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "UAE", value: "UAE" },
  { label: "Singapore", value: "Singapore" },
  { label: "Australia", value: "Australia" },
  { label: "Canada", value: "Canada" },
];

const SAMPLE_STATES: Option[] = [
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Delhi", value: "Delhi" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Telangana", value: "Telangana" },
  { label: "West Bengal", value: "West Bengal" },
  { label: "Rajasthan", value: "Rajasthan" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "Madhya Pradesh", value: "Madhya Pradesh" },
];

const LINKED_ACCOUNTS: BanksAccounts[] = [
  { value: "ac1", bankName: "HDFC Bank", number: "5021 0045 8871", type: "Current Account" },
  { value: "ac2", bankName: "ICICI Bank", number: "5021 0091 2247", type: "Escrow Account" },
  { value: "ac3", bankName: "Axis Bank", number: "5021 0033 7790", type: "Current Account" },
];


const CATEGORIES = [
  { label: "Secured Term Loan", value: "Secured Term Loan" },
  { label: "Unsecured Term Loan", value: "Unsecured Term Loan" },
  { label: "Working Capital - Cash Credit", value: "Working Capital - Cash Credit" },
  { label: "Working Capital - Overdraft", value: "Working Capital - Overdraft" },
];

const PRODUCTS = [
  { label: "Corporate Business Loan", value: "Corporate Business Loan" },
  { label: "Working Capital Loan", value: "Working Capital Loan" },
  { label: "Business Expansion Loan", value: "Business Expansion Loan" },
  { label: "Corporate Unsecured Loan", value: "Corporate Unsecured Loan" },
];

const PURPOSES = [
  { label: "Business expansion", value: "Business expansion" },
  { label: "Working capital", value: "Working capital" },
  { label: "Equipment purchase", value: "Equipment purchase" },
  { label: "Infrastructure development", value: "Infrastructure development" },
  { label: "Technology upgrade", value: "Technology upgrade" },
  { label: "Debt consolidation", value: "Debt consolidation" },
  { label: "Trade finance", value: "Trade finance" },
];

const MORATORIUM_OPTIONS = [
  { label: "0 months", value: "0" },
  { label: "1 month", value: "1" },
  { label: "2 months", value: "2" },
  { label: "3 months", value: "3" },
  { label: "6 months", value: "6" },
];


// ─── Initial state ─────────────────────────────────────────────────────────
const initialState: CatalogsState = {
  designations: SAMPLE_DESIGNATIONS,
  businessTypes: SAMPLE_BUSINESS_TYPES,
  industries: SAMPLE_INDUSTRIES,
  countries: SAMPLE_COUNTRIES,
  states: SAMPLE_STATES,
  loaded: false,

  // loans related 
  loanCategory : CATEGORIES,
  loanProducts : PRODUCTS,
  purposeOfLoans : PURPOSES,
  mortariumOptions : MORATORIUM_OPTIONS,
  linkedBankAccounts : LINKED_ACCOUNTS

};

// ─── Slice ─────────────────────────────────────────────────────────────────
export const catalogsSlice = createSlice({
  name: "catalogs",
  initialState,
  reducers: {
    
    setDesignations: (state, action: PayloadAction<Option[]>) => {
      state.designations = action.payload;
    },
    setBusinessTypes: (state, action: PayloadAction<Option[]>) => {
      state.businessTypes = action.payload;
    },
    setIndustries: (state, action: PayloadAction<Option[]>) => {
      state.industries = action.payload;
    },
    setCountries: (state, action: PayloadAction<Option[]>) => {
      state.countries = action.payload;
    },
    setStates: (state, action: PayloadAction<Option[]>) => {
      state.states = action.payload;
    },


    // loans related 
    setLoanCategory : (state, action : PayloadAction<any>) => {
      state.loanCategory = action.payload
    },

    setLoanProducts : (state, action : PayloadAction<any>) => {
      state.loanProducts = action.payload
    },

    setPurposeOfLoan : (state, action : PayloadAction<any>) => {
      state.purposeOfLoans = action.payload
    },

    setMortariumOptions: (state, action : PayloadAction<any>) => {
      state.mortariumOptions = action.payload
    },

    setLinkedBankAccounts : (state, action : PayloadAction<any>) => {
      state.linkedBankAccounts = action.payload
    },

    // Bulk replace (when one /catalogs API returns everything)
    setCatalogs: (state, action: PayloadAction<Partial<CatalogsState>>) => {
      Object.assign(state, action.payload);
      state.loaded = true;
    },

    setLoaded: (state, action: PayloadAction<boolean>) => {
      state.loaded = action.payload;
    },
  },
});

export const {
  setDesignations,
  setBusinessTypes,
  setIndustries,
  setCountries,
  setStates,
  setLoanCategory,
  setLoanProducts,
  setPurposeOfLoan,
  setMortariumOptions,
  setLinkedBankAccounts,
  setCatalogs,
  setLoaded,
} = catalogsSlice.actions;

export default catalogsSlice.reducer;
