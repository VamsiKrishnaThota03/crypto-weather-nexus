import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavoritesState {
  cities: string[];
  cryptos: string[];
}

const FAVORITES_STORAGE_KEY = 'crypto-weather-favorites';

const emptyFavorites = (): FavoritesState => ({ cities: [], cryptos: [] });

/** Read favorites from localStorage (browser only). */
export const loadFavorites = (): FavoritesState => {
  if (typeof window === 'undefined') return emptyFavorites();
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return emptyFavorites();
    const parsed = JSON.parse(stored);
    return {
      cities: Array.isArray(parsed?.cities) ? parsed.cities.filter((c: unknown) => typeof c === 'string') : [],
      cryptos: Array.isArray(parsed?.cryptos) ? parsed.cryptos.filter((c: unknown) => typeof c === 'string') : [],
    };
  } catch {
    return emptyFavorites();
  }
};

const saveFavorites = (state: FavoritesState): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ cities: state.cities, cryptos: state.cryptos }));
  } catch {
    // Storage may be full or disabled; favorites just won't persist.
  }
};

const toggle = (list: string[], value: string) => {
  const index = list.indexOf(value);
  if (index === -1) list.push(value);
  else list.splice(index, 1);
};

// Start empty so server and client render the same markup; the stored
// favorites are loaded after mount (see app/providers.tsx).
const initialState: FavoritesState = emptyFavorites();

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavoriteCity: (state, action: PayloadAction<string>) => {
      toggle(state.cities, action.payload);
      saveFavorites(state);
    },
    toggleFavoriteCrypto: (state, action: PayloadAction<string>) => {
      toggle(state.cryptos, action.payload);
      saveFavorites(state);
    },
    setFavorites: (state, action: PayloadAction<FavoritesState>) => {
      state.cities = action.payload.cities;
      state.cryptos = action.payload.cryptos;
      saveFavorites(state);
    },
    /** Replace state with stored favorites without writing back. */
    hydrateFavorites: (state, action: PayloadAction<FavoritesState>) => {
      state.cities = action.payload.cities;
      state.cryptos = action.payload.cryptos;
    },
  },
});

export const { toggleFavoriteCity, toggleFavoriteCrypto, setFavorites, hydrateFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
