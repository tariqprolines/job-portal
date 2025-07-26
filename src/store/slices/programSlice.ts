import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { IsbtApiUrl,ApiAccessToken } from '../../config/constent';

interface UrlUploadState {
  loading: boolean;
  error: string | null;
  success: boolean;
  extractedText: string | null;
}

const initialState: UrlUploadState = {
  loading: false,
  error: null,
  success: false,
  extractedText: null,
};

const url = IsbtApiUrl;
const apiAccessToken =ApiAccessToken;

const defaultHeader = {
  "X-Access-Token": apiAccessToken,
  "Content-Type": "Application/json",
};

// Upload URL
export const uploadUrl = createAsyncThunk(
  "url/uploadUrl",
  async (
    formData: { agent_id: number; text_title: string; text_content: string; file_type: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${url}/api/v1/agent/urlupload`, formData, {
        headers: defaultHeader,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: "URL upload failed" });
    }
  }
);

// Extract text from uploaded URL
export const extractTextFromUrl = createAsyncThunk(
  "url/extractTextFromUrl",
  async (
    formData: { file_paths: string[]; type: string; user_id: string; user_query: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${url}/text/extract-text-user-file`,
        formData,
        {
          headers: defaultHeader,
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: "Text extraction failed" });
    }
  }
);

// Fetch Course

export const fetchCourse = createAsyncThunk(
  "url/fetchCourse",
  async (
    formData: { userid: number  },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${url}/course/list`,
        formData,
        {
          headers: defaultHeader,
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: "Text extraction failed" });
    }
  }
);

const urlUploadSlice = createSlice({
  name: "program",
  initialState,
  reducers: {
    resetUrlUploadState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.extractedText = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(uploadUrl.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(uploadUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
  },
});

export const { resetUrlUploadState } = urlUploadSlice.actions;

export default urlUploadSlice.reducer;
