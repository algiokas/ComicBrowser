import React, { Component } from "react";
import Navigation from "../shared/navigation";
import MultiView from "./multiView";
import { BooksViewMode } from "../../util/enums";
import IBook from "../../interfaces/book";
import ISlideshow, { ICollection } from "../../interfaces/slideshow";
import { IBookSearchQuery } from "../../interfaces/searchQuery";
import { SubAppProps } from "../../App";
import INavItem from "../../interfaces/navItem";
import { filterAlphanumeric, isAlphanumeric } from "../../util/helpers";

const apiBaseUrl = process.env.REACT_APP_BOOKS_API_BASE_URL

interface BooksAppProps extends SubAppProps  {
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

class BooksApp extends Component<BooksAppProps, BooksAppState> {
  constructor(props: BooksAppProps) {
    super(props);

    this.state = {
      galleryPageSize: 12,
      allBooks: [],
      allCollections: [],
      viewMode: BooksViewMode.Loading,
      singleBookPage: 0,
      slideshowPage: 0,
      currentBook: null,
      currentSlideshow: this.getEmptySlideshow(),
      currentSearchQuery: this.getEmptyQuery(),
      slideshowInterval: 5,
    }
  }
  
  componentDidMount() {
    this.fillBooks();
    this.setState({
      viewMode: BooksViewMode.Listing
    })
  }

  //#region API
  fillBooks = () => {
    fetch(`${apiBaseUrl}/books`)
      .then(res => res.json())
      .then(data => {
        this.setState({ allBooks: this.booksFromJson(data) })
      })
      .then(() => this.getCollections())
  }

  collectionFromJson = (c: any): ICollection => {
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
      const matchingBook = this.state.allBooks.find(book => book.id === b.bookId)
      if (matchingBook) {
        newCollection.books.push(matchingBook)
        newCollection.pageCount += matchingBook.pageCount
      } else {
        console.error(`Slideshow book with ID: ${b.bookId} not found`)
      }
    })
    return newCollection
  }

  getCollections = () => {
    fetch(`${apiBaseUrl}/books/collections/all`, { method: 'get' })
    .then(res => res.json())
    .then(data => {
      this.setState({ allCollections: data.map(this.collectionFromJson) })
    })
  }

  createCollection = (collectionName: string, coverBookId: number) => {
    const createCollectionRequest = {
      name: collectionName,
      books: this.state.currentSlideshow.books,
      coverBookId: coverBookId
    }
    fetch(`${apiBaseUrl}/books/collections/create`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createCollectionRequest)
    })
    .then(res => res.json())
    .then(data => {
      const newCollection = this.collectionFromJson(data)
      this.setState({ 
        allCollections: [...this.state.allCollections, newCollection],
        viewMode: BooksViewMode.Collections,
        currentSlideshow: this.getEmptySlideshow()
      })
    })
  }

  updateBook = (book : IBook) => {
    fetch(`${apiBaseUrl}/books/${book.id}/update`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log("Book " + book.id + " Updated")
        for (let i = 0; i < this.state.allBooks.length;  i++) {
          if (this.state.allBooks[i] && this.state.allBooks[i].id === data.book.id) {
            this.setState((state) => {
              let books = state.allBooks
              books[i] = this.bookFromJson(data.book) 
              return { allBooks: books}
            })
          } 
        }
      }
    });
  }

  deleteBook = (bookId : number) => {
    console.log('delete book with id: ' + bookId)
    fetch(`${apiBaseUrl}/books/${bookId}`, {
      method: 'delete'
    })
    .then(res => res.json())
    .then(data => {
      if (data.changes > 0) {
        console.log('removed book ID: ' + bookId)
        this.setState((state : BooksAppState) : object | null => {
          return ({
            allBooks: state.allBooks.filter((b) => b.id !== bookId),
            currentBook: {},
            viewMode: BooksViewMode.Listing
          })
        })
        let bookInSlideshow = this.state.currentSlideshow.books.find((b) => b.id === bookId)
        if (bookInSlideshow !== undefined) {
          this.setState((state) => {
            return ({
              currentSlideshow: {
                id: state.currentSlideshow.id,
                name: state.currentSlideshow.name,
                pageCount: state.currentSlideshow.pageCount - bookInSlideshow!.pageCount,
                books: state.currentSlideshow.books.filter((b) => b.id !== bookId)
              }
            })
          })
        }
      }
    });
  }

  importBooks = () => {
    console.log("Importing Books")
    this.setState({ viewMode: BooksViewMode.Loading })
    fetch(`${apiBaseUrl}/books/import`, {
      method: 'get',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        this.setState({ 
          allBooks: this.booksFromJson(data.books),
          currentBook: null,
          currentSlideshow: this.getEmptySlideshow(),
          viewMode: BooksViewMode.Listing
        })
      }
    });
  }
  //#endregion

  //#region initialization
  generateBookSearchTerms = (book: IBook): string[] => {
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

  bookFromJson = (e: any): any => {
    let newBook = e as IBook
    if (e.addedDate) {
      newBook.addedDate = new Date(e.addedDate)
    }
    const terms = this.generateBookSearchTerms(newBook)
    newBook.searchTerms = terms
    return newBook
  }

  booksFromJson(bookJson: any): IBook[] {
    let bookList: IBook[] = []
    if (!bookJson || bookJson.length < 1) console.log("booksFromJson - no books in input")
    bookJson.forEach((e: any): any => {
      let newBook = this.bookFromJson(e)
      bookList.push(newBook)
    });
    return bookList
  }

  getEmptySlideshow = (): ISlideshow => {
    return {
      id: null,
      name: "",
      pageCount: 0,
      books: []
    }
  }

  getEmptyQuery() : IBookSearchQuery {
    return {
      filled: false,
      artists: '',
      groups: '',
      prefix: '',
      tags: '',
    }
  }
  //#endregion

  //#region navigation
  viewBook = (book : IBook) => {
    this.setState({
      viewMode: BooksViewMode.SingleBook,
      currentBook: book,
      singleBookPage: 0
    })
  }

  viewCurrentBook = () => {
    if (this.state.currentBook && this.state.currentBook.title) {
      this.setState({
        viewMode: BooksViewMode.SingleBook
      })
    }
  }

  displayCurrentBookCheck = () => {
    return this.state.currentBook ? true : false
  }
  
  viewSearchResults = (query?: IBookSearchQuery) => {
    if (query) {
      let newQuery = {...this.getEmptyQuery(), ...query}
      newQuery.filled = true
      this.setState({
        currentSearchQuery: newQuery,
        viewMode: BooksViewMode.SearchResults
      })
    } else if (this.state.currentSearchQuery.filled) {
      this.setState({
        viewMode: BooksViewMode.SearchResults
      })
    }
  }

  displaySearchResultsCheck = () => {
    return this.state.currentSearchQuery.filled ? true : false
  }

  viewSlideshow = () => {
    if (this.state.currentSlideshow.pageCount > 0) {
      this.setState({
        viewMode: BooksViewMode.Slideshow
      })
    }
  }

  displaySlideshowCheck = () => {
    return this.state.currentSlideshow.pageCount > 0 ? true : false
  }

  viewListing = () => {
    this.setState({
      viewMode: BooksViewMode.Listing
    })
  }

  viewCollections = () => {
    this.setState({
      viewMode: BooksViewMode.Collections
    })
  }

  viewCollection = (col: ICollection) => {
    this.setState({
      viewMode: BooksViewMode.Slideshow,
      currentSlideshow: col
    })
  }

  getLeftNavItems(): INavItem[] {
    return [
      {
        text: "Listing",
        viewMode: BooksViewMode.Listing,
        clickHandler: this.viewListing
      },
      {
        text: "Collections",
        viewMode: BooksViewMode.Collections,
        clickHandler: this.viewCollections
      },
      {
        text: "Current book",
        viewMode: BooksViewMode.SingleBook,
        clickHandler: this.viewCurrentBook,
        displayCheck: this.displayCurrentBookCheck
      },
      {
        text: "Slideshow",
        viewMode: BooksViewMode.Slideshow,
        counter: this.state.currentSlideshow.books.length,
        clickHandler: this.viewSlideshow,
        displayCheck: this.displaySlideshowCheck
      },
      {
        text: "Search Results",
        viewMode: BooksViewMode.SearchResults,
        clickHandler: this.viewSearchResults,
        displayCheck: this.displaySearchResultsCheck
      }
    ]
  }

  getRightNavItems(): INavItem[] {
    return [
      {
        text: "Import Books",
        clickHandler: this.importBooks
      },
      {
        text: "Videos",
        clickHandler: this.props.toggleAppMode
      }]
  }

  //#endregion

  //#region slideshow
  addBookToSlideshow = (book : IBook) => {
    this.setState((state) => {
      return {
        currentSlideshow: {
          id: state.currentSlideshow.id,
          name: state.currentSlideshow.name,
          pageCount: state.currentSlideshow.pageCount + book.pageCount,
          books: [...state.currentSlideshow.books, book]
        }
      }
    })
  }

  removeBookFromSlideshow = (index : number) => {
    this.setState((state : BooksAppState) : object => {
      let matchingBook = state.currentSlideshow.books[index]
      let remainingBooks = state.currentSlideshow.books.filter((_, i) => i !== index)
      if (matchingBook) {
        if (remainingBooks.length > 0) {
          const currentSlideshow = this.state.currentSlideshow
          currentSlideshow.pageCount = currentSlideshow.pageCount - matchingBook.pageCount
          currentSlideshow.books = remainingBooks
          return {
            currentSlideshow: currentSlideshow
          }
        }
        return {
          viewMode: BooksViewMode.Listing,
          currentSlideshow: this.getEmptySlideshow()
        }
      }
      console.log('Remove failed - book not found at index ' + index)
      return {}
    })
  }

  resetSlideshow = () => {
    this.setState({
      viewMode: BooksViewMode.Listing,
      currentSlideshow: this.getEmptySlideshow()
    })
  }

  setSlideshowInterval = (interval : number) => {
    this.setState({ slideshowInterval: interval })
  }

  setSlideshowPage = (n : number) => {
    if (this.state.viewMode === BooksViewMode.SingleBook) {   
      this.setState({
        singleBookPage: n
      })
    }
    else if (this.state.viewMode === BooksViewMode.Slideshow) {
      this.setState({
        slideshowPage: n
      })
    }
  }
  //#endregion
  
  render() {
    const navProps = {
      viewMode: this.state.viewMode,
      leftNavItems: this.getLeftNavItems(),
      rightNavItems: this.getRightNavItems(),
      showSearch: true,
      logoClick: this.viewListing,
      viewSearchResults: this.viewSearchResults
    }

    const handlers = {
      viewBook: this.viewBook,
      viewSlideshow: this.viewSlideshow,
      viewListing: this.viewListing,
      viewCurrentBook: this.viewCurrentBook,
      viewSearchResults: this.viewSearchResults,
      addBookToSlideshow: this.addBookToSlideshow,
      removeBookFromSlideshow: this.removeBookFromSlideshow,
      setSlideshowInterval: this.setSlideshowInterval,
      setSlideshowPage: this.setSlideshowPage,
      resetSlideshow: this.resetSlideshow,
      updateBook: this.updateBook,
      deleteBook: this.deleteBook,
      importBooks: this.importBooks,
      createCollection: this.createCollection,
      viewCollection: this.viewCollection
    }

    return (
      <div className="BooksApp">
        <Navigation {...navProps}>
        </Navigation>
        <MultiView {...this.state} {...handlers}></MultiView>
      </div>
    )
  }
}

export default BooksApp;
