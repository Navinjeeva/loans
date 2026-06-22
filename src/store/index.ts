import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./auth";
import customerSlice from "./customer";
import loansSlice from "./loans";
import corporateSlice from "./corporate";

const store = configureStore({
  reducer: {
    auth: authSlice,
    customer: customerSlice,
    loans: loansSlice,
    corporate: corporateSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
