import { useEffect, useState } from "react";
import type { SubAppProps } from "../../App";
import type IBook from "../../interfaces/book";
import type INavItem from "../../interfaces/navItem";
import type { IBookSearchQuery } from "../../interfaces/searchQuery";
import type ISlideshow from "../../interfaces/slideshow";
import type { ICollection } from "../../interfaces/slideshow";
import { BooksViewMode } from "../../util/enums";
import { filterAlphanumeric, isAlphanumeric } from "../../util/helpers";
import Navigation from "../shared/navigation";
import MultiView from "./multiView";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

interface BooksAppProps extends SubAppProps {
}

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

function BooksApp(props: BooksAppProps) {
  const [allBooks, setAllBooks] = useState<IBook[]>([])
  const [allCollections, setAllCollections] = useState<ICollection[]>([])
  const [viewMode, setViewMode] = useState<BooksViewMode>(BooksViewMode.Loading)
  const [singleBookPage, setSingleBookPage] = useState<number>(0)
  const [slideshowPage, setSlideshowPage] = useState<number>(0)
  const [currentBook, setCurrentBook] = useState<IBook | null>(null)
  const [currentSlideshow, setCurrentSlideshow] = useState<ISlideshow>(getEmptySlideshow())
  const [currentSearchQuery, setCurrentSearchQuery] = useState<IBookSearchQuery>(getEmptyQuery())
  const [slideshowInterval, setSlideshowInterval] = useState<number>(5)
  const [galleryPageSize, setGalleryPageSize] = useState<number>(12)

  useEffect(() => {
    const init = async () => {
      await fillBooks();
      setViewMode(BooksViewMode.Listing)
    }
    init();
  }, [])

  const fillBooks = async () => {
    const res = await fetch(`${apiBaseUrl}/books`)
    const data = await res.json()
    const books = booksFromJson(data)
    setAllBooks(books)
    await getCollections(books)
  }


  const bookFromJson = (e: any): any => {
    let newBook = e as IBook
    if (e.addedDate) {
      newBook.addedDate = new Date(e.addedDate)
    }
    const terms = generateBookSearchTerms(newBook)
    newBook.searchTerms = terms
    return newBook
  }

  const booksFromJson = (bookJson: any): IBook[] => {
    let bookList: IBook[] = []
    if (!bookJson || bookJson.length < 1) console.log("booksFromJson - no books in input")
    bookJson.forEach((e: any): any => {
      let newBook = bookFromJson(e)
      bookList.push(newBook)
    });
    return bookList
  }

  const collectionFromJson = (c: any, booksList: IBook[]): ICollection => {
    const newCollection: ICollection = {
      id: c.id,
      name: c.name,
      coverImage: c.coverImage,
      coverBookId: c.coverBook,
      coverPageId: c.coverPage,
      books: [],
      pageCount: 0
    }
    c.books.forEach((b: any) => {
      const matchingBook = booksList.find(book => book.id === b.bookId)
      if (matchingBook) {
        newCollection.books.push(matchingBook)
        newCollection.pageCount += matchingBook.pageCount
      } else {
        console.error(`Slideshow book with ID: ${b.bookId} not found`)
      }
    })
    return newCollection
  }

  const getCollections = async (books: IBook[]) => {
    const res = await fetch(`${apiBaseUrl}/books/collections/all`, { method: 'get' })
    const data = await res.json()
    setAllCollections(data.map((c: any) => collectionFromJson(c, books)))
  }

  const createCollection = async (collectionName: string, coverBookId: number) => {
    const createCollectionRequest = {
      name: collectionName,
      books: currentSlideshow.books,
      coverBookId: coverBookId
    }
    const res = await fetch(`${apiBaseUrl}/books/collections/create`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createCollectionRequest)
    })
    const data = await res.json()
    const newCollection = collectionFromJson(data, allBooks)
    setAllCollections([...allCollections, newCollection])
    setViewMode(BooksViewMode.Collections)
    setCurrentSlideshow(getEmptySlideshow())
  }

  const updateBook = async (book: IBook) => {
    const res = await fetch(`${apiBaseUrl}/books/${book.id}/update`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    })
    const data = await res.json()
    if (data.success) {
      console.log("Book " + book.id + " Updated")
      for (let i = 0; i < allBooks.length; i++) {
        if (allBooks[i] && allBooks[i].id === data.book.id) {
          const books = allBooks
          books[i] = bookFromJson(data.book)
          setAllBooks(books)
        }
      }
    } else {
      console.error(`updateBook failed for book ${book.id}`)
    }
  }

  const deleteBook = async (bookId: number) => {
    console.log('delete book with id: ' + bookId)
    const res = await fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: 'delete'
    })
    const data = await res.json()
    if (data.changes > 0) {
      console.log('removed book ID: ' + bookId)
      setAllBooks(allBooks.filter((b) => b.id !== bookId))
      setCurrentBook(null)
      setViewMode(BooksViewMode.Listing)
      let bookInSlideshow = currentSlideshow.books.find((b) => b.id === bookId)
      if (bookInSlideshow !== undefined) {
        setCurrentSlideshow({
          id: currentSlideshow.id,
          name: currentSlideshow.name,
          pageCount: currentSlideshow.pageCount - bookInSlideshow!.pageCount,
          books: currentSlideshow.books.filter((b) => b.id !== bookId)
        })
      }
    }
  }

  const importBooks = async () => {
    console.log("Importing Books")
    setViewMode(BooksViewMode.Loading)
    const res = await fetch(`${apiBaseUrl}/books/import`, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    if (data) {
      setAllBooks(booksFromJson(data.books))
      setCurrentBook(null)
      setCurrentSlideshow(getEmptySlideshow())
      setViewMode(BooksViewMode.Listing)
    }

  }
  //#endregion

  //#region initialization
  const generateBookSearchTerms = (book: IBook): string[] => {
    const terms = new Set<string>();

    terms.add(book.id.toString())
    terms.add(book.title)
    book.title.split(' ').forEach(s => {
      if (s.trim().length > 0) {
        terms.add(s.trim())
      }
    })
    if (book.artGroup.length > 0) {
      terms.add(book.artGroup)
      if (book.artGroup.includes(' ')) {
        book.artGroup.split(' ').forEach(s => {
          if (s.trim().length > 0) {
            terms.add(s.trim())
          }
        })
      }
    }
    book.artists.forEach(a => {
      terms.add(a)
      if (a.includes(' ')) {
        a.split(' ').forEach(s => {
          if (s.trim().length > 0) {
            terms.add(s.trim())
          }
        })
      }
    })
    book.tags.forEach(tag => {
      terms.add(tag)
      if (tag.includes(' ')) {
        tag.split(' ').forEach(s => {
          if (s.trim().length > 0) {
            terms.add(s.trim())
          }
        })
      }
    })
    terms.add(book.prefix)
    terms.add(book.language)

    const termsList = [...terms].filter(s => s).map(s => s.toLowerCase().trim()).filter(s => s.length > 0)
    termsList.forEach(t => {
      if (t) {
        if (t.includes('_')) {
          t.split('_').forEach(x => {
            if (!termsList.includes(x)) termsList.push(x)
          })
        }
        if (!isAlphanumeric(t)) {
          const filtered = filterAlphanumeric(t)
          if (!termsList.includes(filtered)) termsList.push(filtered)
        }
      }
    })
    return termsList
  }



  //#endregion

  //#region navigation
  const viewBook = (book: IBook) => {
    setViewMode(BooksViewMode.SingleBook)
    setCurrentBook(book)
    setSingleBookPage(0)
  }

  const viewCurrentBook = () => {
    if (currentBook && currentBook.title) {
      setViewMode(BooksViewMode.SingleBook)
    }
  }

  const displayCurrentBookCheck = () => {
    return currentBook ? true : false
  }

  const viewSearchResults = (query?: IBookSearchQuery) => {
    if (query) {
      let newQuery = { ...getEmptyQuery(), ...query }
      newQuery.filled = true
      setCurrentSearchQuery(newQuery)
      setViewMode(BooksViewMode.SearchResults)
    } else if (currentSearchQuery.filled) {
      setViewMode(BooksViewMode.SearchResults)
    }
  }

  const displaySearchResultsCheck = () => {
    return currentSearchQuery.filled ? true : false
  }

  const viewSlideshow = () => {
    if (currentSlideshow.pageCount > 0) {
      setViewMode(BooksViewMode.Slideshow)
    }
  }

  const displaySlideshowCheck = () => {
    return currentSlideshow.pageCount > 0 ? true : false
  }

  const viewListing = () => {
    setViewMode(BooksViewMode.Listing)
  }

  const viewCollections = () => {
    setViewMode(BooksViewMode.Collections)
  }

  const viewCollection = (col: ICollection) => {
    setViewMode(BooksViewMode.Slideshow)
    setCurrentSlideshow(col)
  }

  const getLeftNavItems = (): INavItem[] => {
    return [
      {
        text: "Listing",
        viewMode: BooksViewMode.Listing,
        clickHandler: viewListing
      },
      {
        text: "Collections",
        viewMode: BooksViewMode.Collections,
        clickHandler: viewCollections
      },
      {
        text: "Current book",
        viewMode: BooksViewMode.SingleBook,
        clickHandler: viewCurrentBook,
        displayCheck: displayCurrentBookCheck
      },
      {
        text: "Slideshow",
        viewMode: BooksViewMode.Slideshow,
        counter: currentSlideshow.books.length,
        clickHandler: viewSlideshow,
        displayCheck: displaySlideshowCheck
      },
      {
        text: "Search Results",
        viewMode: BooksViewMode.SearchResults,
        clickHandler: viewSearchResults,
        displayCheck: displaySearchResultsCheck
      }
    ]
  }

  const getRightNavItems = (): INavItem[] => {
    return [
      {
        text: "Import Books",
        clickHandler: importBooks
      },
      {
        text: "Videos",
        clickHandler: props.viewVideosApp
      }]
  }

  //#endregion

  //#region slideshow
  const addBookToSlideshow = (book: IBook) => {
    const newSlideshow: ISlideshow = {
      id: currentSlideshow.id,
      name: currentSlideshow.name,
      pageCount: currentSlideshow.pageCount + book.pageCount,
      books: [...currentSlideshow.books, book]
    }
    setCurrentSlideshow(newSlideshow)
  }

  const removeBookFromSlideshow = (index: number) => {
    let matchingBook = currentSlideshow.books[index]
    let remainingBooks = currentSlideshow.books.filter((_, i) => i !== index)
    if (matchingBook) {
      if (remainingBooks.length > 0) {
        const newSlideshow = currentSlideshow
        newSlideshow.pageCount = newSlideshow.pageCount - matchingBook.pageCount
        newSlideshow.books = remainingBooks
        setCurrentSlideshow(newSlideshow)
      } else {
        setCurrentSlideshow(getEmptySlideshow())
        setViewMode(BooksViewMode.Listing)
      }
    }
    console.log('Remove failed - book not found at index ' + index)
  }

  const resetSlideshow = () => {
    setCurrentSlideshow(getEmptySlideshow())
    setViewMode(BooksViewMode.Listing)
  }

  const setCurrentPage = (n: number) => {
    if (viewMode === BooksViewMode.SingleBook) {
      setSingleBookPage(n)
    }
    else if (viewMode === BooksViewMode.Slideshow) {
      setSlideshowPage(n)
    }
  }
  //#endregion

  const navProps = {
    viewMode: viewMode,
    leftNavItems: getLeftNavItems(),
    rightNavItems: getRightNavItems(),
    showSearch: true,
    logoClick: viewListing,
    viewSearchResults: viewSearchResults
  }

  const handlers = {
    viewBook: viewBook,
    viewSlideshow: viewSlideshow,
    viewListing: viewListing,
    viewCurrentBook: viewCurrentBook,
    viewSearchResults: viewSearchResults,
    addBookToSlideshow: addBookToSlideshow,
    removeBookFromSlideshow: removeBookFromSlideshow,
    setSlideshowInterval: setSlideshowInterval,
    setCurrentPage: setCurrentPage,
    resetSlideshow: resetSlideshow,
    updateBook: updateBook,
    deleteBook: deleteBook,
    importBooks: importBooks,
    createCollection: createCollection,
    viewCollection: viewCollection
  }

  const appState: BooksAppState = {
    galleryPageSize,
    allBooks,
    allCollections,
    viewMode,
    singleBookPage,
    slideshowPage,
    currentBook,
    currentSlideshow,
    currentSearchQuery,
    slideshowInterval,
  }

  return (
    <div className="BooksApp">
      <Navigation {...navProps}>
      </Navigation>
      <MultiView {...appState} {...handlers}></MultiView>
    </div>
  )
}

export default BooksApp;
