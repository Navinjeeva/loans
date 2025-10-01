import { configureStore } from '@reduxjs/toolkit';

import authSlice from './auth';
import customerSlice from './customer';
import memberOnboardingSlice from './memberOnboarding';

const store = configureStore({
  reducer: {
    auth: authSlice,
    customer: customerSlice,
    memberOnboarding: memberOnboardingSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
