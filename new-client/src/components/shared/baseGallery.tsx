export interface BaseGalleryProps<T> {
    allItems: T[]
    pageSize: number,
    showFilters?: boolean,
}