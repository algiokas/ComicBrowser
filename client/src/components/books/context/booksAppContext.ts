import { createContext, useContext, useReducer, Dispatch } from 'react';
import IBook from '../../../interfaces/book';
import { IBookSearchQuery } from '../../../interfaces/searchQuery';
import ISlideshow, { ICollection } from '../../../interfaces/slideshow';
import { BooksViewMode } from '../../../util/enums';

export interface BooksAppState {
    galleryPageSize: number,
    allBooks: IBook[],
    allCollections: ICollection[],
    viewMode: BooksViewMode,
    singleBookPage: number,
    slideshowPage: number,
    currentBook: IBook | null,
    currentSlideshow: ISlideshow,
    currentSearchQuery: IBookSearchQuery,
    slideshowInterval: number,
}

const getEmptySlideshow = (): ISlideshow => {
    return {
        id: null,
        name: "",
        pageCount: 0,
        books: []
    }
}

const getEmptyQuery = (): IBookSearchQuery => {
    return {
        filled: false,
        artists: '',
        groups: '',
        prefix: '',
        tags: '',
    }
}

const initialAppState = {
    galleryPageSize: 12,
    allBooks: [],
    allCollections: [],
    viewMode: BooksViewMode.Loading,
    singleBookPage: 0,
    slideshowPage: 0,
    currentBook: null,
    currentSlideshow: getEmptySlideshow(),
    currentSearchQuery: getEmptyQuery(),
    slideshowInterval: 5,
}


const BooksAppContext = createContext<BooksAppState>(initialAppState)