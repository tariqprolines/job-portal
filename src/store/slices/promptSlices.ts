import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiAccessToken, IsbtApiUrl } from "../../config/constent";
import axios from "axios";

interface UrlUploadState {
    loading: boolean;
    error: string | null;
    success: boolean;
    promptData: any[];
}

const initialState: UrlUploadState = {
    loading: false,
    error: null,
    success: false,
    promptData: [],
};

// API Config
const url = IsbtApiUrl;
const apiAccessToken = ApiAccessToken;

const defaultHeader = {
    "X-Access-Token": apiAccessToken,
    "Content-Type": "application/json",
};

// Async Thunk to Post Prompts
export const promptsPost = createAsyncThunk(
    "url/promptsPost",
    async (formData: { user_query?: string; outlinetype: string; parentid: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${url}/gpt/prompts`, formData, { headers: defaultHeader });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "Text extraction failed" });
        }
    }
);

const promptSlice = createSlice({
    name: "prompt",
    initialState,
    reducers: {
        updatePrompt: (state, action) => {
            state.promptData = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(promptsPost.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
                // 🔄 Keep existing `promptData` instead of resetting it
            })
            .addCase(promptsPost.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.promptData = action.payload;
            })
            .addCase(promptsPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });
    },
});

// Export actions and reducer
export const { updatePrompt } = promptSlice.actions;
export default promptSlice.reducer;
