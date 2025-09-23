import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  aadhaarCard: [],
  panCard: [],
  addressProof: [],
  salarySlip1: [],
  salarySlip2: [],
  salarySlip3: [],
  form16: [],
  bankStatement: [],
  admissionLetter: [],
  feeProof: [],

  //Education
  gaurantorAadhaarCard: [],
  gaurantorPanCard: [],
  gaurantorAddressProof: [],

  //Vehicle
  rcDoc: [],
  invoice: [],
  vehicleBookingReceipt: [],

  //Business
  businessReg: [],
  gstProof: [],

  //Travel
  passport: [],

  //Marriage
  occasionProof: [],
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
