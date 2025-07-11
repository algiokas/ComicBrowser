export interface Book {
  id: number;
  title: string | null;
  folderName: string | null;
  artGroup: string | null;
  prefix: string | null;
  language: string | null;
  pageCount: number | null;
  coverIndex: number | null;
  pages: string | null;
  addedDate: string | null;
  hiddenPages: string | null;
  isFavorite: number | null;
  originalTitle: string | null;
}

export interface Artist {
  id: number;
  name: string;
}

export interface BookArtist {
  bookId: number;
  artistId: number;
}

export interface Tag {
  id: number;
  name: string;
}

export interface BookTag {
  bookId: number;
  tagId: number;
}

export interface Collection {
  id: number;
  name: string;
  coverImage: string | null;
  coverBook: number | null;
  coverPage: number | null;
}

export interface CollectionBook {
  collectionId: number;
  bookId: number;
  sortOrder: number | null;
}
