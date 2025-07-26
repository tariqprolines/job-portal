import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { IsbtApiUrl, ApiAccessToken } from '../../config/constent';

interface UserState {
  id: number | null;
  name: string | null;
  email: string | null;
  status: number | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  status: null,
  loading: false,
  error: null,
  success: false,
};

const url = IsbtApiUrl;
const apiAccessToken = ApiAccessToken;
const defaultHeader = {
  "X-Access-Token": apiAccessToken,
  "Content-Type": "application/json",
};

// createUserLog
export const createUserLog = createAsyncThunk(
  "createUserLog",
  async (formData: { name: string; email: string; orgid: number; status: number; user_id: number }, { rejectWithValue }) => {
    try {   
          
      const response = await fetch(`${url}/user/create`, {
        method: "POST",
        headers: defaultHeader,
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "User Creation failed");
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "User Creation failed");
      }
      return rejectWithValue("User Creation failed");
    }
  }
);

// createUserLog
export const updateUserLog = createAsyncThunk(
  "updateUserLog",
  async (formData: { id: number; status: number; }, { rejectWithValue }) => {
    try {   
      console.log('formData', formData);
          
      const response = await fetch(`${url}/user/update/${formData.id}`, {
        method: "PUT",
        headers: defaultHeader,
        body: JSON.stringify({status:formData.status}),
      });

      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "User Creation failed");
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "User Creation failed");
      }
      return rejectWithValue("User Creation failed");
    }
  }
);

/**
 * Fetch UserLogs based on OutLineType
 */
export const fetchUserLog = createAsyncThunk(
  "fetchUserLog",
  async (formData: { slugid: string;userid: number;outlinetype: string; }, { rejectWithValue }) => {
    try {   
          
      const response = await fetch(`${url}/user/userlogs`, {
        method: "POST",
        headers: defaultHeader,
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Fetch User log failed");
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Fetch User log failed");
      }
      return rejectWithValue("Fetch User log failed");
    }
  }
);

export const feedback = createAsyncThunk(
  "feedback",
  async (formData: FormData, { rejectWithValue }) => {
    try {       
      const response = await fetch(`${url}/text/create_sys_feedback`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "User Feedback failed");
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "User Feedback failed");
      }
      return rejectWithValue("User Feedback failed");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetState: (state) => {
      state.id = null;
      state.name = null;
      state.email = null;
      state.status = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUserLog.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createUserLog.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(createUserLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(updateUserLog.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserLog.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(updateUserLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { resetState } = userSlice.actions;
export default userSlice.reducer;
