import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState: any = {
  loggedIn: false,
  connected: true,
  publicKey:"",
  access_token: "",
  refresh_token: "",
  username: "",
  password: "",
  notifications: [],
  sessionTime: new Date(),
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<any>) => {
      return (state = { ...state, ...action.payload });
    },
    resetState: (state) => {
      return (state = initialState);
    },
  },
});

export const { setState, resetState } = authSlice.actions;

export default authSlice.reducer;
