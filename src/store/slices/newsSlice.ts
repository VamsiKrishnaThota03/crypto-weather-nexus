import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface NewsItem {
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

export const fetchNewsData = createAsyncThunk(
  'news/fetchNewsData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        'https://min-api.cryptocompare.com/data/v2/news/?lang=EN'
      );

      if (!response.data.Data) {
        throw new Error('No news data available');
      }

      return response.data.Data.slice(0, 5).map((item: any) => ({
        title: item.title,
        description: item.body || 'No description available',
        url: item.url,
        source: item.source,
        publishedAt: new Date(item.published_on * 1000).toISOString(),
      }));
    } catch (error: any) {
      console.error('News API Error:', error.message);
      return rejectWithValue('Failed to fetch news data. Please try again later.');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsData.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNewsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default newsSlice.reducer; 