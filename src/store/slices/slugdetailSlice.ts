import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IsbtApiUrl, ApiAccessToken } from "../../config/constent";

// Define the structure for the state
interface SlugDetailState {
    loading: boolean;
    error: string | null;
    success: boolean;
    slug: string | null; // Store slug value
}

// Define the initial state
const initialState: SlugDetailState = {
    loading: false,
    error: null,
    success: false,
    slug: null, // Initially, no slug is set
};

const url = IsbtApiUrl;
const apiAccessToken = ApiAccessToken;

const defaultHeader = {
    "X-Access-Token": apiAccessToken,
    "Content-Type": "application/json",
};

// Define async thunk to fetch the slug detail with transformed slug
export const fetchSlug = createAsyncThunk(
    "slug/slugdetail",
    async (payload: { slug: string }, { rejectWithValue }) => {
        try {
            // Transform slug: replace spaces with hyphens
            const transformedSlug = payload.slug.replace(/\s+/g, "-").toLowerCase();
            // Create the payload with the transformed slug
            const requestPayload = { slug: transformedSlug };

            // Use axios to send the POST request with the payload in the body
            const response = await axios.post(
                `${url}/user/slugdetail`, // API endpoint
                requestPayload, // Payload in the body
                { headers: defaultHeader } // Headers
            );
            return response.data; // Assuming the response contains a 'slug' field
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch slug");
        }
    }
);

// Create the slice
const slugDetailSlice = createSlice({
    name: "slugDetail",
    initialState,
    reducers: {
        setSlug: (state, action) => {
            state.slug = action.payload; // Set the slug directly
        },
        resetSlugState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.slug = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSlug.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(fetchSlug.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.slug = action.payload; // Set the slug when API call succeeds
            })
            .addCase(fetchSlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });
    },
});

// Export the actions and reducer
export const { setSlug, resetSlugState } = slugDetailSlice.actions;
export default slugDetailSlice.reducer;
