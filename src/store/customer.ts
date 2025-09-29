import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  extraDocuments: [{ id: 1, name: '', doc: [] }],
  personalDocuments: [{ id: 1, name: '', doc: [] }],
  loanDocuments: [{ id: 1, name: '', doc: [] }],
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
