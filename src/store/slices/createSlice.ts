import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiAccessToken, IsbtApiUrl } from "../../config/constent";
import axios from "axios";

interface UrlUploadState {
    loading: boolean;
    error: string | null;
    success: boolean;
    couseHistory: any[];
    courseDetails: any[];
}

const initialState: UrlUploadState = {
    loading: false,
    error: null,
    success: false,
    couseHistory: [],
    courseDetails: []
};

// API Config
const url = IsbtApiUrl;
const apiAccessToken = ApiAccessToken;

const defaultHeader = {
    "X-Access-Token": apiAccessToken,
    "Content-Type": "application/json",
};

// Async Thunk to Post Prompts
export const storeCourse = createAsyncThunk(
    "url/courseCreate",
    async (
        formData: {
            user_query?: string;
            outlinetype: string;
            programdetail?: any;
            coursedetail?: any;
            chapterdetail?: string;
            pptdetail?: string;
            quizdetail?: string;
            userid: string;
            slugid: string
        },
        { rejectWithValue }
    ) => {
        try {
            const payload = {
                user_query: formData.user_query || "",
                outlinetype: formData.outlinetype,
                programdetail: formData.programdetail || "",
                coursedetail: formData.coursedetail || "",
                chapterdetail: formData.chapterdetail || "",
                pptdetail: formData.pptdetail || "",
                quizdetail: formData.quizdetail || "",

                userid: formData.userid ?? 0,
                slugid: formData.slugid ?? 0,
            };

            const response = await axios.post(`${url}/course/create`, payload, { headers: defaultHeader });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "Course creation failed" });
        }
    }
);

export const courseDetail = createAsyncThunk(
    "url/coursedetails",
    async (
        formData: {
            userid: string;
            slugid: string
        },
        { rejectWithValue }
    ) => {
        try {
            const payload = {
                userid: formData.userid ?? 0,
                slugid: formData.slugid ?? 0,
            };

            const response = await axios.post(`${url}/course/detail`, payload, { headers: defaultHeader });
            return response.data.data[0];
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "Course creation failed" });
        }
    }
);


const courseSlice = createSlice({
    name: "course",
    initialState,
    reducers: {
        updatePrompt: (state, action) => {
            state.couseHistory = action.payload;
        },

        resetCourseDetails: (state) => {
            state.courseDetails = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(storeCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
                // 🔄 Keep existing `promptData` instead of resetting it
            })
            .addCase(storeCourse.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.couseHistory = action.payload;
            })
            .addCase(storeCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            })
            .addCase(courseDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
                // 🔄 Keep existing `promptData` instead of resetting it
            })
            .addCase(courseDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.courseDetails = action.payload;
            })
            .addCase(courseDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });
    },
});

// Export actions and reducer
export const { updatePrompt, resetCourseDetails } = courseSlice.actions;
export default courseSlice.reducer;
