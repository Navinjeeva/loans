import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

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
  businessType: "",
  industry: "",
  country: "India",
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

const initialLoan = {
  category: "",
  product: "",
  amount: "",
  tenure: "",
  moratorium: "0",
  purpose: "",
  purposeDesc: "",
  emiCalculated: false,
};

const initialState: any = {
  onboardMode: "manual",
  stepKey: "classification",
  lookup: { website: "" },
  company: initialCompany,
  office: initialOffice,
  directors: [] as any[],
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
    setDirectors: (state, action: PayloadAction<any[]>) => {
      state.directors = action.payload;
    },
    setDocuments: (state, action: PayloadAction<any>) => {
      state.documents = { ...state.documents, ...action.payload };
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
  setRegOffice,
  setOpOffice,
  setFinancial,
  setLoan,
  setDirectors,
  setDocuments,
  setSignatures,
  setApplication,
  setOtpVerified,
  applyExtraction,
  resetCorporate,
} = corporateSlice.actions;

export default corporateSlice.reducer;
