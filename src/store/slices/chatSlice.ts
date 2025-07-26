import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { IsbtApiUrl, ApiAccessToken } from "../../config/constent";

// Define the shape of the chat history
interface ChatHistory {
    user_query: string;
    response: string;
    type: "titledata" | "descriptions"; // Default to "titledata"
    prompt?: boolean
    selectedtitle: ""
}

// Define the state shape for the URL upload process
interface UrlUploadState {
    loading: boolean;
    error: string | null;
    success: boolean;
    isTyping: boolean; // Track typing status globally
    chatId: string | null; // 👈 Add this
    tabs: {
        Program: { currentText: string; history: ChatHistory[] };
        Course: { currentText: string; history: ChatHistory[] };
        Chapter: { currentText: string; history: ChatHistory[] };
        Ppt: { currentText: string; history: ChatHistory[] };
        Quiz: { currentText: string; history: ChatHistory[] };
    };
    history: any[]
}

// Initial state with 5 tabs
const initialState: UrlUploadState = {
    loading: false,
    error: null,
    success: false,
    isTyping: false,
    chatId: null, // 👈 Initialize it
    tabs: {
        Program: { currentText: "", history: [] },
        Course: { currentText: "", history: [] },
        Chapter: { currentText: "", history: [] },
        Ppt: { currentText: "", history: [] },
        Quiz: { currentText: "", history: [] },
    },
    history: []
};

const url = IsbtApiUrl;
const apiAccessToken = ApiAccessToken;

const defaultHeader = {
    "X-Access-Token": apiAccessToken,
    "Content-Type": "application/json",
};

// Streaming API: Extract chat in real-time
export const extractChat = createAsyncThunk(
    "llama/chat",
    async (
        formData: {
            user_query: string;
            user_id: string;
            slug_id?: string,
            extracted_text?: string,
            is_file_single?: string,
            systemPrompt: string,
            structure_type?: string,
            defaultPrompt: string;
            tabId?: string,
            file_paths?: string[],
            type?: "titledata" | "descriptions",
            prompt?: boolean,
            selectedtitle?: string,
            actiontype?: string,
            selected?: string,
            querytype?: string
        },
        { rejectWithValue, dispatch, getState }
    ) => {
        try {
            const body = {
                file_paths: formData.file_paths || [""],
                user_query: formData.user_query,
                user_id: formData.user_id,
                systemPrompt: formData.systemPrompt,
                defaultPrompt: formData.defaultPrompt,
                slug_id: formData?.slug_id ? formData.slug_id : "",
                extracted_text: formData?.extracted_text ? formData.extracted_text : "",
                is_file_single: formData?.is_file_single ? formData?.is_file_single : "",
                structure_type: formData?.structure_type ? formData.structure_type : "",
                actiontype: formData?.type || "titledata",
                selected: formData?.selectedtitle || "",
                querytype: formData?.prompt ? `${formData?.prompt}` : "false",
            };

            const response = await fetch(`${url}/llama/chat`, {
                method: "POST",
                headers: defaultHeader,
                body: JSON.stringify(body),
            });

            // ✅ Get the `x-chat-id` header here
            const chatId = response.headers.get("x-chat-id");
            console.log("Chat ID:", chatId);
            if (chatId) {
                dispatch(setChatId(chatId));
            }
            if (!response.body) throw new Error("No response body");

            dispatch(setTyping(true)); // Start typing loader

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let newExtractedText = "";
            let isFirstChunk = true; // To track the first chunk

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                newExtractedText += chunk;

                if (isFirstChunk) {
                    dispatch(setTyping(false)); // Stop loader when the first chunk arrives
                    isFirstChunk = false;
                }

                // Update UI in real-time for the specific tab
                if (formData.tabId) {
                    dispatch(updateExtractedText({ tabId: formData.tabId, text: newExtractedText }));
                }
            }

            // Store user query and response for the specific tab
            if (formData.tabId) {
                dispatch(addToHistory({ tabId: formData.tabId, user_query: formData.user_query, response: newExtractedText, type: formData.type || "titledata", prompt: formData.prompt || false, selectedtitle: formData.selectedtitle || "" }));
                // dispatch(fetchUserLog({ userid: Number(formData?.user_id), outlinetype: formData?.structure_type, slugid: formData?.slug_id }))
                dispatch(updateExtractedText({ tabId: formData.tabId, text: "" }));
            }
            return newExtractedText;
        } catch (error: any) {
            dispatch(setTyping(false)); // Ensure loader stops on error
            return rejectWithValue(error.message || "Text extraction failed");
        }
    }
);

export const stopGeneration = createAsyncThunk(
    "llama/stopGeneration",
    async (chatId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`${url}/llama/stop?chat_id=${chatId}`, {
                method: "POST",
                headers: defaultHeader,
            });

            const data = await response.json();

            if (data.status === "stopped") {
                return data;
            } else {
                return rejectWithValue("Failed to stop generation");
            }
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to stop generation");
        }
    }
);

export const fetchUserLog = createAsyncThunk(
    "fetchUserLog",
    async (formData: { slugid?: string; userid: number; outlinetype?: string; }, { rejectWithValue }) => {
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

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        // Reset the state for all tabs
        resetUrlUploadState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.isTyping = false;
            // Reset history and currentText for all tabs
            Object.keys(state.tabs).forEach((tabId) => {
                const key = tabId as keyof typeof state.tabs; // Narrowing the type of tabId to keys of state.tabs
                state.tabs[key].currentText = "";
                state.tabs[key].history = [];
            });
        },


        resetHistory: (state) => {
            state.history = [];
        },

        // Clear history for a specific tab
        clearHistory: (state, action) => {
            const { tabId } = action.payload;
            const key = tabId as keyof typeof state.tabs;
            state.tabs[key].history = []; // Reset history array for the specific tab
            state.history = [];
        },

        // Update current extracted text for a specific tab
        updateExtractedText: (state, action) => {
            const { tabId, text } = action.payload; // Destructure tabId and text
            const key = tabId as keyof typeof state.tabs; // Narrowing the type to a key of the tabs object
            state.tabs[key].currentText = text; // Update currentText for the specific tab
        },

        // Add a new history entry for a specific tab
        addToHistory: (state, action) => {
            const { tabId, user_query, selectedtitle, response, type = "titledata", prompt = false } = action.payload;
            const key = tabId as keyof typeof state.tabs; // Narrowing the type to a key of the tabs object
            state.tabs[key].history.push({ user_query, response, type, prompt, selectedtitle }); // Add to the specific tab's history
            // Add the history item to global history
            state.history.push({
                id: Date.now(), // Dynamically generate a unique ID (using timestamp)
                userquery: user_query,
                modelresponse: response,
                actiontype: type,
                selected: selectedtitle,
            });

        },

        // Set typing state globally
        setTyping: (state, action) => {
            state.isTyping = action.payload;
        },

        // Remove the last entry from the history of a specific tab
        removeLastHistoryEntry: (state, action) => {
            const { tabId } = action.payload;
            const key = tabId as keyof typeof state.tabs; // Narrowing the type to a key of the tabs object
            state.tabs[key].history.pop(); // Remove last history entry for the specific tab
        },

        // 👇 New reducer
        setChatId: (state, action) => {
            state.chatId = action.payload;
            console.log("Set Chat ID:", action.payload); // 👈 For debug only
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(extractChat.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
                state.isTyping = true; // Show loader initially
            })
            .addCase(extractChat.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
                state.isTyping = false; // Hide loader when done
                // Clear currentText for all tabs (or specific tab if needed)
                // Only clear currentText if the global history has more than 0 items
                Object.keys(state.tabs).forEach((tabId) => {
                    const key = tabId as keyof typeof state.tabs;
                    state.tabs[key].currentText = "";
                });
            })
            .addCase(extractChat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
                state.isTyping = false; // Hide loader on failure
            })

            .addCase(fetchUserLog.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(fetchUserLog.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.isTyping = false; // Hide loader when done
                state.history = action.payload.data
                // Iterate through each item in the fetched data

                // Merge the previously pushed history with the fetched data
                const mergedHistory = [...state.history, ...action.payload.data];

                // // Remove duplicates based on modelresponse or any unique identifier
                // state.history = mergedHistory.filter((value, index, self) =>
                //     index === self.findIndex((t) => (
                //         t.modelresponse === value.modelresponse // You can adjust this condition as needed
                //     ))
                // );

                // Remove duplicates based on modelresponse, but keep locally added data with Date.now() id
                state.history = mergedHistory.filter((value, index, self) =>
                    index === self.findIndex((t) => (
                        t.modelresponse === value.modelresponse && // Ensure modelresponse is unique
                        (t.id === value.id || value.id === Date.now()) // Allow local entries with Date.now() id
                    ))
                );

            })
            .addCase(fetchUserLog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
                state.isTyping = false; // Hide loader on failure
            })

            .addCase(stopGeneration.pending, (state) => {
                state.loading = true;
            })
            .addCase(stopGeneration.fulfilled, (state) => {
                state.loading = false;
                state.isTyping = false;
            })
            .addCase(stopGeneration.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    },
});

export const {
    resetUrlUploadState,
    updateExtractedText,
    addToHistory,
    setTyping,
    resetHistory,
    removeLastHistoryEntry,
    setChatId,
} = chatSlice.actions;

export default chatSlice.reducer;
