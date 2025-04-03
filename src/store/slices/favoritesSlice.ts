import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FavoritesState {
  cities: string[];
  cryptos: string[];
}

const FAVORITES_STORAGE_KEY = 'crypto-weather-favorites';

const loadFavorites = (): FavoritesState => {
  if (typeof window === 'undefined') {
    return { cities: [], cryptos: [] };
  }

  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { cities: [], cryptos: [] };
  } catch (error) {
    return { cities: [], cryptos: [] };
  }
};

const saveFavorites = (state: FavoritesState): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Handle storage errors silently
  }
};

const initialState: FavoritesState = loadFavorites();

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavoriteCity: (state, action: PayloadAction<string>) => {
      const index = state.cities.indexOf(action.payload);
      if (index === -1) {
        state.cities.push(action.payload);
      } else {
        state.cities.splice(index, 1);
      }
      saveFavorites(state);
    },
    toggleFavoriteCrypto: (state, action: PayloadAction<string>) => {
      const index = state.cryptos.indexOf(action.payload);
      if (index === -1) {
        state.cryptos.push(action.payload);
      } else {
        state.cryptos.splice(index, 1);
      }
      saveFavorites(state);
    },
    setFavorites: (state, action: PayloadAction<FavoritesState>) => {
      state.cities = action.payload.cities;
      state.cryptos = action.payload.cryptos;
      saveFavorites(state);
    },
  },
});

export const { toggleFavoriteCity, toggleFavoriteCrypto, setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer; 