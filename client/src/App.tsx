import React, { Component } from "react";
import Navigation from "./components/navigation";
import MultiView from "./components/multiView";
import { ViewMode } from "./util/enums";
import IBook from "./interfaces/book";
import ISlideshow from "./interfaces/slideshow";
import ISearchQuery from "./interfaces/searchQuery";

const apiBaseUrl = "http://localhost:9000/api/";

interface AppProps {} //empty

export interface AppState {
  galleryPageSize: number,
  allBooks: IBook[],
  viewMode: ViewMode,
  singleBookPage: number,
  slideshowPage: number,
  currentBook: IBook | null,
  currentSlideshow: ISlideshow,
  currentSearchQuery: ISearchQuery,
  slideshowInterval: number,
}

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      galleryPageSize: 12,
      allBooks: [],
      viewMode: ViewMode.Loading,
      singleBookPage: 0,
      slideshowPage: 0,
      currentBook: null,
      currentSlideshow: {
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
      viewMode: ViewMode.Listing
    })
  }

  fillBooks() {
    fetch(apiBaseUrl + "allbooks")
      .then(res => res.json())
      .then(data => {
        this.setState({ allBooks: data })
      });
  }

  resetSlideshow() {
    this.setState({
      viewMode: ViewMode.Listing,
      currentSlideshow: {
        pageCount: 0,
        books: []
      }
    })
  }

  updateBook(book : IBook) {
    fetch(apiBaseUrl + 'updatebook/' + book.id, {
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
              books[i] = data.book
              return { allBooks: books}
            })
          } 
        }
      }
    });
  }

  deleteBook(bookId : number) {
    console.log('delete book with id: ' + bookId)
    fetch(apiBaseUrl + 'deletebook/' + bookId, {
      method: 'delete'
    })
    .then(res => res.json())
    .then(data => {
      if (data.changes > 0) {
        console.log('removed book ID: ' + bookId)
        this.setState((state : AppState) : object | null => {
          return ({
            allBooks: state.allBooks.filter((b) => b.id !== bookId),
            currentBook: {},
            viewMode: ViewMode.Listing
          })
        })
        let bookInSlideshow = this.state.currentSlideshow.books.find((b) => b.id === bookId)
        if (bookInSlideshow !== undefined) {
          this.setState((state) => {
            return ({
              currentSlideshow: {
                pageCount: state.currentSlideshow.pageCount - bookInSlideshow!.pageCount,
                books: state.currentSlideshow.books.filter((b) => b.id !== bookId)
              }
            })
          })
        }
      }
    });
  }

  importBooks() {
    console.log("Importing Books")
    this.setState({ viewMode: ViewMode.Loading })
    fetch(apiBaseUrl + 'importbooks', {
      method: 'get',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        this.setState({ 
          allBooks: data.books,
          currentBook: null,
          currentSlideshow: {
            pageCount: 0,
            books: [],
          },
          viewMode: ViewMode.Listing
        })
      }
    });
  }

  viewBook(book : IBook) {
    this.setState({
      viewMode: ViewMode.SingleBook,
      currentBook: book,
      singleBookPage: 0
    })
  }

  viewCurrentBook() {
    if (this.state.currentBook && this.state.currentBook.title) {
      this.setState({
        viewMode: ViewMode.SingleBook
      })
    }
  }

  getEmptyQuery() : ISearchQuery {
    return {
      filled: false,
      artist: '',
      group: '',
      prefix: '',
      tag: '',
    }
  }
  
  viewSearchResults(query?: ISearchQuery) {
    if (query) {
      let newQuery = {...this.getEmptyQuery(), ...query}
      newQuery.filled = true
      this.setState({
        currentSearchQuery: newQuery,
        viewMode: ViewMode.SearchResults
      })
    } else if (this.state.currentSearchQuery.filled) {
      this.setState({
        viewMode: ViewMode.SearchResults
      })
    }
  }

  viewSlideshow() {
    if (this.state.currentSlideshow.pageCount > 0) {
      this.setState({
        viewMode: ViewMode.Slideshow
      })
    }
  }

  viewListing() {
    this.setState({
      viewMode: ViewMode.Listing
    })
  }

  addBookToSlideshow(book : IBook) {
    this.setState((state) => {
      return {
        currentSlideshow: {
          pageCount: state.currentSlideshow.pageCount + book.pageCount,
          books: [...state.currentSlideshow.books, book]
        }
      }
    })
  }

  removeBookFromSlideshow(index : number) {
    this.setState((state : AppState) : object => {
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
          viewMode: ViewMode.Listing,
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

  setSlideshowInterval(interval : number) {
    this.setState({ slideshowInterval: interval })
  }

  setSlideshowPage(n : number) {
    if (this.state.viewMode === ViewMode.SingleBook) {   
      this.setState({
        singleBookPage: n
      })
    }
    else if (this.state.viewMode === ViewMode.Slideshow) {
      this.setState({
        slideshowPage: n
      })
    }
  }

  render() {
    const navProps = {
      slideshowCount: this.state.currentSlideshow.books.length,
      viewMode: this.state.viewMode,
      viewListing: this.viewListing,
      viewSlideshow: this.viewSlideshow,
      viewCurrentBook: this.viewCurrentBook,
      viewSearchResults: this.viewSearchResults,
      importBooks: this.importBooks
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
      <div className="App">
        <Navigation {...navProps}>
        </Navigation>
        <MultiView {...this.state} {...handlers}></MultiView>
      </div>
    )
  }
}

export default App;
