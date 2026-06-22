import React, { createContext, useContext, useState, useCallback } from "react";

export interface Director {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  email: string;
  din: string;
  pan: string;
  isOwner: boolean;
  ownership: string;
}

export interface CompanyData {
  country: string;
  businessType: string;
  industry: string;
  name: string;
  cin: string;
  pan: string;
  gst: string;
  doi: string;
}

export interface OfficeData {
  address: string;
  city: string;
  state: string;
  postal: string;
  country: string;
}

export interface FinancialData {
  annualRevenue: string;
  monthlyTurnover: string;
  netProfit: string;
  employeeCount: string;
  vintage: string;
}

export interface LoanData {
  category: string;
  product: string;
  amount: string;
  tenure: string;
  moratorium: string;
  purpose: string;
  purposeDesc: string;
  emiCalculated: boolean;
  branch: string;
  officer: string;
}

export interface DocumentEntry {
  status: "uploaded" | "pending" | "rejected";
  fileName: string;
  size: string;
  uploadedAt: number;
}

export interface ApplicationData {
  id: string;
  submittedAt: string;
  status: string;
  stage: number;
}

export interface CorporateState {
  onboardMode: "ai" | "manual";
  lookup: { website: string; name: string };
  company: CompanyData;
  office: { reg: OfficeData; op: OfficeData; sameAsReg: boolean };
  financial: FinancialData;
  directors: Director[];
  loan: LoanData;
  documents: Record<string, DocumentEntry>;
  declarations: Record<string, boolean>;
  otpVerified: boolean;
  signatures: Record<string, { image: string; method: string; at: number }>;
  application: ApplicationData | null;
}

const EMPTY: CorporateState = {
  onboardMode: "ai",
  lookup: { website: "", name: "" },
  company: { country: "India", businessType: "", industry: "", name: "", cin: "", pan: "", gst: "", doi: "" },
  office: {
    reg: { address: "", city: "", state: "", postal: "", country: "India" },
    op: { address: "", city: "", state: "", postal: "", country: "India" },
    sameAsReg: false,
  },
  financial: { annualRevenue: "", monthlyTurnover: "", netProfit: "", employeeCount: "", vintage: "" },
  directors: [],
  loan: { category: "", product: "", amount: "", tenure: "", moratorium: "0", purpose: "", purposeDesc: "", emiCalculated: false, branch: "", officer: "" },
  documents: {},
  declarations: { accurate: false, verify: false, terms: false, consent: false, ubo: false },
  otpVerified: false,
  signatures: {},
  application: null,
};

const SAMPLE_EXTRACTION = {
  company: {
    country: "India",
    businessType: "Private Limited",
    industry: "Manufacturing",
    name: "Meridian Auto Components Pvt Ltd",
    cin: "U29299MH2009PTC192845",
    pan: "AAFCM7812Q",
    gst: "27AAFCM7812Q1ZX",
    doi: "2009-04-14",
  },
  office: {
    reg: { address: "Plot 47, MIDC Industrial Area", city: "Aurangabad", state: "Maharashtra", postal: "431136", country: "India" },
    op: { address: "401, Maker Chambers IV, Nariman Point", city: "Mumbai", state: "Maharashtra", postal: "400021", country: "India" },
    sameAsReg: false,
  },
  financial: { annualRevenue: "42500000", monthlyTurnover: "3541667", netProfit: "6375000", employeeCount: "214", vintage: "15" },
  directors: [
    { id: "dir1", name: "Rajiv Khanna", designation: "Managing Director", mobile: "+91 98200 11234", email: "rkhanna@meridian.in", din: "06782341", pan: "ABCPK1234F", isOwner: true, ownership: "58" },
    { id: "dir2", name: "Anita Deshmukh", designation: "Whole-time Director", mobile: "+91 98201 55678", email: "adeshmukh@meridian.in", din: "07654321", pan: "DEFAD5678G", isOwner: true, ownership: "22" },
  ],
};

interface CorporateContextType {
  data: CorporateState;
  update: (path: string, value: any) => void;
  setData: (d: CorporateState) => void;
  applyExtraction: () => void;
  resetAll: () => void;
  drafts: Array<{ id: string; name: string; stepKey: string; editedAt: number; data: CorporateState }>;
  saveDraft: (stepKey: string) => void;
  resumeDraft: (draft: { id: string; data: CorporateState; stepKey: string }) => void;
}

const CorporateContext = createContext<CorporateContextType | undefined>(undefined);

function setIn(obj: any, path: string, value: any): any {
  const parts = path.split(".");
  const key = parts[0];
  if (parts.length === 1) return { ...obj, [key]: value };
  return { ...obj, [key]: setIn(obj[key] || {}, parts.slice(1).join("."), value) };
}

export function CorporateProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CorporateState>(EMPTY);
  const [drafts, setDrafts] = useState<Array<{ id: string; name: string; stepKey: string; editedAt: number; data: CorporateState }>>([]);

  const update = useCallback((path: string, value: any) => {
    setData((d) => setIn(d, path, value));
  }, []);

  const applyExtraction = useCallback(() => {
    setData((d) => ({
      ...d,
      company: { ...d.company, ...SAMPLE_EXTRACTION.company },
      office: { ...d.office, ...SAMPLE_EXTRACTION.office },
      financial: { ...d.financial, ...SAMPLE_EXTRACTION.financial },
      directors: SAMPLE_EXTRACTION.directors,
    }));
  }, []);

  const resetAll = useCallback(() => {
    setData(EMPTY);
  }, []);

  const saveDraft = useCallback(
    (stepKey: string) => {
      const id = "draft-" + Date.now();
      const snap = { id, name: data.company.name || "Untitled application", stepKey, editedAt: Date.now(), data };
      setDrafts((prev) => [snap, ...prev.filter((x) => x.id !== id)]);
    },
    [data]
  );

  const resumeDraft = useCallback((draft: { id: string; data: CorporateState; stepKey: string }) => {
    setData(draft.data);
  }, []);

  return (
    <CorporateContext.Provider value={{ data, update, setData, applyExtraction, resetAll, drafts, saveDraft, resumeDraft }}>
      {children}
    </CorporateContext.Provider>
  );
}

export function useCorporate() {
  const ctx = useContext(CorporateContext);
  if (!ctx) throw new Error("useCorporate must be used within CorporateProvider");
  return ctx;
}

export { EMPTY, SAMPLE_EXTRACTION };
