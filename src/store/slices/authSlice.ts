
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../types';

interface AuthState {
  user: UserProfile | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isInitialized = true;
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;