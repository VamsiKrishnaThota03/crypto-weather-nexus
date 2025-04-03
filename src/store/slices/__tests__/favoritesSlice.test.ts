import favoritesReducer, {
  toggleFavoriteCity,
  toggleFavoriteCrypto,
  setFavorites,
} from '../favoritesSlice';

describe('favorites slice', () => {
  const initialState = {
    cities: [],
    cryptos: [],
  };

  it('should handle initial state', () => {
    expect(favoritesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle toggleFavoriteCity - add', () => {
    const actual = favoritesReducer(initialState, toggleFavoriteCity('New York'));
    expect(actual.cities).toEqual(['New York']);
  });

  it('should handle toggleFavoriteCity - remove', () => {
    const state = { cities: ['New York'], cryptos: [] };
    const actual = favoritesReducer(state, toggleFavoriteCity('New York'));
    expect(actual.cities).toEqual([]);
  });

  it('should handle toggleFavoriteCrypto - add', () => {
    const actual = favoritesReducer(initialState, toggleFavoriteCrypto('bitcoin'));
    expect(actual.cryptos).toEqual(['bitcoin']);
  });

  it('should handle toggleFavoriteCrypto - remove', () => {
    const state = { cities: [], cryptos: ['bitcoin'] };
    const actual = favoritesReducer(state, toggleFavoriteCrypto('bitcoin'));
    expect(actual.cryptos).toEqual([]);
  });

  it('should handle setFavorites', () => {
    const newFavorites = {
      cities: ['New York', 'London'],
      cryptos: ['bitcoin', 'ethereum'],
    };
    const actual = favoritesReducer(initialState, setFavorites(newFavorites));
    expect(actual).toEqual(newFavorites);
  });
}); 