import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  data: any;
  loading: boolean;
  error: string | null;
  specificagent: any;
}

const initialState: UserState = {
  data: null,
  loading: false,
  error: null,
  specificagent: null,
};

const authReducer = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    fetchUserStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUserSuccess(state, action: PayloadAction<any>) {
      state.data = action.payload;
      state.loading = false;
    },
    fetchUserFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    resetUserData: () => initialState,
  },
});

export const { fetchUserStart, fetchUserSuccess, fetchUserFailure, resetUserData } = authReducer.actions;

export default authReducer.reducer;
