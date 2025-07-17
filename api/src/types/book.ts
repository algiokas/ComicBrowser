import { BaseResponse } from "./shared";

export interface BookRow {
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

export interface ClientBook {
  id: number,
  title: string,
  originalTitle: string,
  folderName: string,
  artGroup: string,
  prefix: string,
  language: string,
  pageCount: number,
  coverIndex: number,
  addedDate: string, 
  isFavorite: boolean,
  pages: string[],
  artists: string[],
  tags: string[],
  hiddenPages: number[]
}

export interface FolderJSON {
  folderName: string;
  prefix: string;
  artists: string[];
  artGroup: string;
  title: string;
  tags: string[];
  language: string;
  pageCount: number;
  coverIndex: number;
  pages: string[];
  addedDate: number;
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

export interface CollectionRow {
  id: number;
  name: string;
  coverImage: string | null;
  coverBook: number | null;
  coverPage: number | null;
}

export interface ClientCollection {
  id: number;
  name: string;
  coverImage: string;
  coverBook: number;
  coverPage: number;
  books: CollectionBook[]
}

export interface CollectionBook {
  collectionId: number;
  bookId: number;
  sortOrder: number | null;
}

export interface CreateCollectionRequest {
  name: string,
  books: ClientBook[],
  coverBookId: number
}

export interface ImportBooksResult extends BaseResponse {
  books: ClientBook[],
  importCount: number
}

export interface UpdateBookResult extends BaseResponse {
  book?: ClientBook
}
