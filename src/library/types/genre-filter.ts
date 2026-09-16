/**
 * The filters that can be applied when querying for genres in the library.
 */
export type GenreFilters = {
  /**
   * Optional filter for retrieving specific genres.
   */
  genreIds?: number[];
};
