export interface BaseGalleryItemProps<T> {
  index: number,
  data: T,
  imageUrl: string,
  bodyClickHandler?: (data: T, index: number) => void,
  favoriteClickHandler?: (data: T) => void,
}