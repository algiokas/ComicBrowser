import React, { Component } from "react";
import Navigation from "../shared/navigation";
import MultiView from "./multiView";
import { BooksViewMode } from "../../util/enums";
import IBook from "../../interfaces/book";
import ISlideshow from "../../interfaces/slideshow";
import { IBookSearchQuery } from "../../interfaces/searchQuery";
import { SubAppProps } from "../../App";
import INavItem from "../../interfaces/navItem";

const apiBaseUrl = process.env.REACT_APP_BOOKS_API_BASE_URL

interface BooksAppProps extends SubAppProps  {
}

export interface BooksAppState {
  galleryPageSize: number,
  allBooks: IBook[],
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
      viewMode: BooksViewMode.Loading,
      singleBookPage: 0,
      slideshowPage: 0,
      currentBook: null,
      currentSlideshow: {
        id: null,
        name: "",
        pageCount: 0,
        books: [],
      },
      currentSearchQuery: {
        filled: false,
        artist: '',
        group: '',
        prefix: '',
        tag: '',
      },
      slideshowInterval: 5,
    }
  }
  
  componentDidMount() {
    this.fillBooks();
    this.setState({
      viewMode: BooksViewMode.Listing
    })
  }

  booksFromJson(bookJson: any): IBook[] {
    let bookList: IBook[] = []
    if (!bookJson || bookJson.length < 1) console.log("booksFromJson - no books in input")
    bookJson.forEach((e: any): any => {
      let newBook = e as IBook
      if (e.addedDate) {
        newBook.addedDate = new Date(e.addedDate)
      }
      bookList.push(newBook)
    });
    return bookList
  } 

  fillBooks = () => {
    fetch(apiBaseUrl + "books")
      .then(res => res.json())
      .then(data => {
        this.setState({ allBooks: this.booksFromJson(data) })
      });
  }

  getEmptySlideshow = (): ISlideshow => {
    return {
      id: null,
      name: "",
      pageCount: 0,
      books: []
    }
  }

  resetSlideshow = () => {
    this.setState({
      viewMode: BooksViewMode.Listing,
      currentSlideshow: this.getEmptySlideshow()
    })
  }

  updateBook = (book : IBook) => {
    fetch(apiBaseUrl + 'books/update/' + book.id, {
      method: 'post',
      headers: { 'Content-Type': 'BooksApplication/json' },
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
              books[i] = data.book
              return { allBooks: books}
            })
          } 
        }
      }
    });
  }

  deleteBook = (bookId : number) => {
    console.log('delete book with id: ' + bookId)
    fetch(apiBaseUrl + 'books/' + bookId, {
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
    fetch(apiBaseUrl + 'books/import', {
      method: 'get',
      headers: { 'Content-Type': 'BooksApplication/json' }
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

  getEmptyQuery() : IBookSearchQuery {
    return {
      filled: false,
      artist: '',
      group: '',
      prefix: '',
      tag: '',
    }
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

  viewSlideshow = () => {
    if (this.state.currentSlideshow.pageCount > 0) {
      this.setState({
        viewMode: BooksViewMode.Slideshow
      })
    }
  }

  viewListing = () => {
    this.setState({
      viewMode: BooksViewMode.Listing
    })
  }

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
          return {
            currentSlideshow: {
              pageCount: state.currentSlideshow.pageCount - matchingBook.pageCount,
              books: remainingBooks
            }
          }
        }
        return {
          viewMode: BooksViewMode.Listing,
          currentSlideshow: {
            pageCount: state.currentSlideshow.pageCount - matchingBook.pageCount,
            books: remainingBooks
          }
        }
      }
      console.log('Remove failed - book not found at index ' + index)
      return {}
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

  getLeftNavItems(): INavItem[] {
    return [
      {
        text: "Listing",
        viewMode: BooksViewMode.Listing,
        clickHandler: this.viewListing
      },
      {
        text: "Current book",
        viewMode: BooksViewMode.SingleBook,
        clickHandler: this.viewCurrentBook
      },
      {
        text: "Slideshow",
        viewMode: BooksViewMode.Slideshow,
        counter: this.state.currentSlideshow.books.length,
        clickHandler: this.viewSlideshow
      },
      {
        text: "Search Results",
        viewMode: BooksViewMode.SearchResults,
        clickHandler: this.viewSearchResults
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

  render() {
    const navProps = {
      viewMode: this.state.viewMode,
      leftNavItems: this.getLeftNavItems(),
      rightNavItems: this.getRightNavItems(),
      logoClick: this.viewListing,
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
      importBooks: this.importBooks
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
