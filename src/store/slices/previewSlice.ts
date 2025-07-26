import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { IsbtApiUrl,ApiAccessToken } from '../../config/constent';

interface previewData {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: previewData = {
  loading: false,
  error: null,
  success: false,
};

const url = IsbtApiUrl;
const apiAccessToken =ApiAccessToken;

const defaultHeader = {
  "X-Access-Token": apiAccessToken,
  "Content-Type": "Application/json",
};

// Fetch Course

export const fetchPreviewData = createAsyncThunk(
    "url/fetchPreviewData",
    async (
        formData: {
            userid: number;
            slugid: string
        },
        { rejectWithValue }
    ) => {
        try {
            const payload = {
                userid: formData.userid ?? 0,
                slugid: formData.slugid ?? "",
            };

            const response = await axios.post(`${url}/course/detail`, payload, { headers: defaultHeader });
            return response.data.data[0];
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "Fetching Data failed" });
        }
    }
);

export const fetchPreviewAndSubmitData = createAsyncThunk(
  "url/fetchPreviewData",
  async (
      formData: {
          userid: number;
          slugid: string
      },
      { rejectWithValue }
  ) => {
      try {
          const payload = {
              userid: formData.userid ?? 0,
              slugid: formData.slugid ?? "",
          };

          const response = await axios.post(`${url}/course/document-preview`, payload, { headers: defaultHeader });          
          return response.data.html;
      } catch (error: any) {
          return rejectWithValue(error.response?.data || { message: "Fetching Data failed" });
      }
  }
);

const priviewSlice = createSlice({
  name: "preview",
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreviewData.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchPreviewData.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(fetchPreviewData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
  },
});

export const { resetState } = priviewSlice.actions;

export default priviewSlice.reducer;
