import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

interface NewsState {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
}

const initialState: NewsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchNewsData = createAsyncThunk('news/fetchNewsData', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<NewsItem[]>('/api/news');
    if (!Array.isArray(response.data)) throw new Error('Invalid news response');
    return response.data;
  } catch {
    return rejectWithValue('Failed to fetch news. Please try again later.');
  }
});

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNewsData.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items = action.payload;
      })
      .addCase(fetchNewsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default newsSlice.reducer;
