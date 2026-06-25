import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


export interface Disbursement {

  //for linked 
  accountId : string;

  // external option
  bankName: string;
  holderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscSwift: string;
  accountType: string;
  branchName: string;
  cancelledCheque?: { uri: string; name: string } | null;
  bankStatement?: { uri: string; name: string } | null;

  // for open new buisness acc
  preferredAccountType: string;
}


const SAMPLE_EXTRACTION = {
  company: {
    name: "Meridian Auto Components Pvt Ltd",
    cin: "U29299MH2009PTC192847",
    pan: "AAFCM1234Q",
    gst: "27AAFCM1234Q1Z5",
    doi: "2009-03-15",
    businessType: "Private Limited",
    industry: "Manufacturing",
    country: "India",
  },
  office: {
    reg: {
      country: "India",
      address: "Plot 47B, Andheri MIDC",
      locality: "MIDC Industrial Area",
      city: "Mumbai",
      state: "Maharashtra",
      postal: "400093",
    },
    op: {
      country: "India",
      address: "Plot 47B, Andheri MIDC",
      locality: "MIDC Industrial Area",
      city: "Mumbai",
      state: "Maharashtra",
      postal: "400093",
    },
  },
  financial: {
    annualRevenue: "240000000",
    monthlyTurnover: "20000000",
    netProfit: "28800000",
    employeeCount: "312",
    vintage: "15",
  },
  directors: [
    {
      id: "1",
      name: "Rajiv Mehta",
      designation: "Managing Director",
      mobile: "9988776655",
      isdCode: "91",
      email: "rajiv.mehta@meridian.com",
      din: "02145673",
      isOwner: true,
      ownership: "45",
    },
    {
      id: "2",
      name: "Priya Mehta",
      designation: "Whole-time Director",
      mobile: "9977665544",
      isdCode: "91",
      email: "priya.mehta@meridian.com",
      din: "03987654",
      isOwner: true,
      ownership: "30",
    },
  ],
};

const initialCompany = {
  name: "",
  cin: "",
  pan: "",
  gst: "",
  doi: "",
  udyam: "",
  businessType: "",
  industry: "",
  country: "India",
  otherCountry: "",
};

const initialOffice = {
  reg: { country: "India", address: "", locality: "", city: "", state: "", postal: "" },
  op: { country: "India", address: "", locality: "", city: "", state: "", postal: "" },
};

const initialFinancial = {
  annualRevenue: "",
  monthlyTurnover: "",
  netProfit: "",
  employeeCount: "",
  vintage: "",
};

const initialLoan: Loan = {
  category: "",
  product: "",
  schema: "",
  amount: "",
  tenure: "",
  moratorium: "0",
  purpose: "",
  purposeDesc: "",
  emiCalculated: false,
  disbMode: "linked",
  disbursement: {
    accountId: "",
    bankName: "",
    holderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscSwift: "",
    accountType: "",
    branchName: "",
    cancelledCheque: null,
    bankStatement: null,
    preferredAccountType: "",
  },
};

//  Types 
export type OnboardMode = "manual" | "ai";

export interface Company {
  name: string;
  cin: string;
  pan: string;
  gst: string;
  doi: string;
  udyam: string;
  businessType: string;
  industry: string;
  country: string;
  otherCountry: string;
}

export interface Address {
  country: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  postal: string;
}

export interface Office {
  reg: Address;
  op: Address;
}

export interface Financial {
  annualRevenue: string;
  monthlyTurnover: string;
  netProfit: string;
  employeeCount: string;
  vintage: string;
}

export interface Director {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  isdCode: string;
  email: string;
  din: string;
  isOwner: boolean;
  ownership: string;
}

export interface Loan {
  category: string;
  product: string;
  schema: string;
  amount: string;
  tenure: string;
  moratorium: string;
  purpose: string;
  purposeDesc: string;
  emiCalculated: boolean;
  disbMode: "linked" | "external" | "open";
  disbursement: Disbursement;
}

export interface Lookup {
  website: string;
}

export interface Draft {
  id: string;
  company: string;
  type: string;
  amount: string;
  updatedAt: string;
  stepKey: string;
}

export interface DocumentEntry {
  status: "uploaded" | "pending" | "rejected";
  fileName?: string;
  size?: string;
  uploadedAt?: number;
  uri?: string;
  mimeType?: string;
  source?: "camera" | "gallery" | "file";
}

// Owner / shareholder (partner)
export interface Owner {
  id: string;
  name: string;
  ownerType: string; // Individual / Corporate Body / Holding Company / Trust
  shareholding: string;
}

// Existing borrowing obligation
export interface Obligation {
  id: string;
  lender: string;
  facilityType: string;
  sanctioned: string;
  outstanding: string;
  emi?: string;
  endDate?: string;
}

export interface Collateral {
  id: string;
  kind: string;
  desc?: string;
  value?: string | number;
  ownedBy?: string;
  charge?: string;
}

export interface CorporateState {
  onboardMode: OnboardMode;
  stepKey: string;
  lookup: Lookup;
  company: Company;
  office: Office;
  directors: Director[];
  owners: Owner[];
  obligations: Obligation[];
  collateral: Collateral[];
  financial: Financial;
  loan: Loan;
  documents: Record<string, DocumentEntry>;
  signatures: Record<string, any>;
  otpVerified: boolean;
  application: any | null;
  drafts: Draft[];
}

const initialState: CorporateState = {
  onboardMode: "manual",
  stepKey: "classification",
  lookup: { website: "" },
  company: initialCompany,
  office: initialOffice,
  directors: [],
  owners: [],
  obligations: [],
  collateral: [],
  financial: initialFinancial,
  loan: initialLoan,
  documents: {},
  signatures: {},
  otpVerified: false,
  application: null,
  drafts: [
    {
      id: "draft-1",
      company: "Meridian Auto Components Pvt Ltd",
      type: "Private Limited",
      amount: "₹5 Cr",
      updatedAt: "2 hours ago",
      stepKey: "loan",
    },
  ],
};

export const corporateSlice = createSlice({
  name: "corporate",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<any>) => {
      return { ...state, ...action.payload };
    },
    setCompany: (state, action: PayloadAction<any>) => {
      state.company = { ...state.company, ...action.payload };
    },

    // Used by ClassificationScreen — stores company website / lookup payload
    setLookup: (state, action: PayloadAction<any>) => {
      state.lookup = { ...state.lookup, ...action.payload };
    },

    // Used by ClassificationScreen — toggles "ai" vs "manual" onboarding
    setOnboardMode: (state, action: PayloadAction<"ai" | "manual">) => {
      state.onboardMode = action.payload;
    },

    setRegOffice: (state, action: PayloadAction<any>) => {
      state.office = {
        ...state.office,
        reg: { ...state.office.reg, ...action.payload },
      };
    },
    setOpOffice: (state, action: PayloadAction<any>) => {
      state.office = {
        ...state.office,
        op: { ...state.office.op, ...action.payload },
      };
    },
    setFinancial: (state, action: PayloadAction<any>) => {
      state.financial = { ...state.financial, ...action.payload };
    },
    setLoan: (state, action: PayloadAction<any>) => {
      state.loan = { ...state.loan, ...action.payload };
    },

    setDisbursement: (state, action: PayloadAction<Partial<Disbursement>>) => {
      state.loan.disbursement = { ...state.loan.disbursement, ...action.payload };
    },
    //  Directors 
    setDirectors: (state, action: PayloadAction<Director[]>) => {
      state.directors = action.payload;
    },
    addDirector: (state, action: PayloadAction<Director>) => {
      state.directors.push(action.payload);
    },
    updateDirector: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<Director> }>,
    ) => {
      const i = state.directors.findIndex((d) => d.id === action.payload.id);
      if (i >= 0) state.directors[i] = { ...state.directors[i], ...action.payload.patch };
    },
    removeDirector: (state, action: PayloadAction<string>) => {
      state.directors = state.directors.filter((d) => d.id !== action.payload);
      const prefix = `kyc_${action.payload}_`;
      for (const key of Object.keys(state.documents)) {
        if (key.startsWith(prefix)) delete state.documents[key];
      }
    },

    //  Owners / partners (CRUD) 
    setOwners: (state, action: PayloadAction<Owner[]>) => {
      state.owners = action.payload;
    },

    addOwner: (state, action: PayloadAction<Owner>) => {
      state.owners.push(action.payload);
    },

    updateOwner: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<Owner> }>,
    ) => {
      const i = state.owners.findIndex((o) => o.id === action.payload.id);
      if (i >= 0) state.owners[i] = { ...state.owners[i], ...action.payload.patch };
    },

    removeOwner: (state, action: PayloadAction<string>) => {
      state.owners = state.owners.filter((o) => o.id !== action.payload);
      const prefix = `kyc_${action.payload}_`;
      for (const key of Object.keys(state.documents)) {
        if (key.startsWith(prefix)) delete state.documents[key];
      }
    },

    //  Obligations (CRUD) 
    setObligations: (state, action: PayloadAction<Obligation[]>) => {
      state.obligations = action.payload;
    },

    addObligation: (state, action: PayloadAction<Obligation>) => {
      state.obligations.push(action.payload);
    },

    updateObligation: (
      state,
      action: PayloadAction<{ id: string; patch: Partial<Obligation> }>,
    ) => {
      const i = state.obligations.findIndex((o) => o.id === action.payload.id);
      if (i >= 0) state.obligations[i] = { ...state.obligations[i], ...action.payload.patch };
    },

    removeObligation: (state, action: PayloadAction<string>) => {
      state.obligations = state.obligations.filter((o) => o.id !== action.payload);
    },

    //  Collateral
    setCollateral: (state, action: PayloadAction<Collateral[]>) => {
      state.collateral = action.payload;
    },

    // Bulk replace — use for server hydration only
    setDocuments: (state, action: PayloadAction<Record<string, DocumentEntry>>) => {
      state.documents = action.payload;
    },
    upsertDocument: (
      state,
      action: PayloadAction<{ id: string; entry: DocumentEntry }>,
    ) => {
      state.documents[action.payload.id] = action.payload.entry;
    },
    removeDocument: (state, action: PayloadAction<string>) => {
      delete state.documents[action.payload];
    },
    clearDocuments: (state) => {
      state.documents = {};
    },
    setSignatures: (state, action: PayloadAction<any>) => {
      state.signatures = action.payload;
    },
    setApplication: (state, action: PayloadAction<any>) => {
      state.application = action.payload;
    },
    setOtpVerified: (state, action: PayloadAction<boolean>) => {
      state.otpVerified = action.payload;
    },
    applyExtraction: (state) => {
      state.company = { ...state.company, ...SAMPLE_EXTRACTION.company };
      state.office = SAMPLE_EXTRACTION.office;
      state.financial = { ...state.financial, ...SAMPLE_EXTRACTION.financial };
      state.directors = SAMPLE_EXTRACTION.directors;
    },
    resetCorporate: () => ({ ...initialState, drafts: initialState.drafts }),
  },
});

export const {
  setState,
  setCompany,
  setLookup,
  setOnboardMode,
  setRegOffice,
  setOpOffice,
  setFinancial,
  setLoan,
  setDisbursement,
  setDirectors,
  addDirector,
  updateDirector,
  removeDirector,
  setOwners,
  addOwner,
  updateOwner,
  removeOwner,
  setObligations,
  addObligation,
  updateObligation,
  removeObligation,
  setCollateral,
  setDocuments,
  upsertDocument,
  removeDocument,
  clearDocuments,
  setSignatures,
  setApplication,
  setOtpVerified,
  applyExtraction,
  resetCorporate,
} = corporateSlice.actions;

export default corporateSlice.reducer;
