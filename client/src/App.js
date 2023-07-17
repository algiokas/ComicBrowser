import React, { Component } from "react";
import Navigation from "./components/navigation";
import MultiView from "./components/multiView";
import { slideshowToJSON } from "./util/helpers";
import './App.css';

const apiBaseUrl = "http://localhost:9000/api/";

export const ViewMode = Object.freeze({
  Loading: Symbol("Loading"),
  Listing: Symbol("Listing"),
  SingleBook: Symbol("SingleBook"),
  Slideshow: Symbol("Slideshow"),
  SearchResults: Symbol("SearchResults")
})

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      galleryPageSize: 12,
      allBooks: [],
      viewMode: ViewMode.Loading,
      singleBookPage: 0,
      slideshowPage: 0,
      currentBook: {},
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

  componentDidUpdate(prevProps, prevState) {
    console.log('update artist listing')
    if (prevState.allBooks !== this.state.allBooks) {

    }
  }

  fillBooks() {
    fetch(apiBaseUrl + "allbooks")
      .then(res => res.json())
      .then(data => {
        this.setState({ allBooks: data })
      });
  }

  resetSlideshow = () => {
    this.setState({
      viewMode: ViewMode.Listing,
      currentSlideshow: {
        pageCount: 0,
        books: []
      }
    })
  }

  saveCurrentSlideshow = () => {
    fetch(apiBaseUrl + 'saveslideshow', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slideshowToJSON(this.state.currentSlideshow))
    })
    .then(res => res.json())
    .then(data => {
      console.log('save slideshow')
      console.log(data)
    });
  }

  updateBook = (book) => {
    fetch(apiBaseUrl + 'updatebook/' + book.id, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
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

  importBooks = () => {
    fetch(apiBaseUrl + 'importbooks', {
      method: 'get',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
      if (data) {
        this.setState({ 
          allBooks: data.books,
          currentBook: {},
          currentSlideshow: {
            pageCount: 0,
            books: [],
          }
        })
      }
    });
  }

  viewBook = (book) => {
    this.setState({
      viewMode: ViewMode.SingleBook,
      currentBook: book,
      singleBookPage: 0
    })
  }

  viewCurrentBook = () => {
    if (this.state.currentBook && this.state.currentBook.title) {
      this.setState({
        viewMode: ViewMode.SingleBook
      })
    }
  }

  getEmptyQuery = () => {
    return {
      filled: false,
      artist: '',
      group: '',
      prefix: '',
      tag: '',
    }
  }
  
  viewSearchResults = (query) => {
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

  viewArtist = (book) => {
    this.setState({
      viewMode: ViewMode.SearchResults,
      currentSearchQuery: {
        filled: true,
        artist: book.artists[0]
      },
    })
  }

  viewSlideshow = () => {
    if (this.state.currentSlideshow.pageCount > 0) {
      this.setState({
        viewMode: ViewMode.Slideshow
      })
    }
  }

  viewListing = () => {
    this.setState({
      viewMode: ViewMode.Listing
    })
  }

  addBookToSlideshow = (book) => {
    this.setState((state) => {
      return {
        currentSlideshow: {
          pageCount: state.currentSlideshow.pageCount + book.pageCount,
          books: [...state.currentSlideshow.books, book]
        }
      }
    })
  }

  removeBookFromSlideshow = (index) => {
    this.setState((state) => {
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
    })
  }

  setSlideshowInterval = (interval) => {
    this.setState({ slideshowInterval: interval })
  }

  setSlideshowPage = (n) => {
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
    const handlers = {
      viewBook: this.viewBook,
      viewAuthor: this.viewArtist,
      viewSlideshow: this.viewSlideshow,
      viewListing: this.viewListing,
      viewCurrentBook: this.viewCurrentBook,
      viewSearchResults: this.viewSearchResults,
      addBookToSlideshow: this.addBookToSlideshow,
      removeBookFromSlideshow: this.removeBookFromSlideshow,
      setSlideshowInterval: this.setSlideshowInterval,
      setSlideshowPage: this.setSlideshowPage,
      resetSlideshow: this.resetSlideshow,
      saveCurrentSlideshow: this.saveCurrentSlideshow,
      updateBook: this.updateBook,
      importBooks: this.importBooks
    }

    return (
      <div className="App">
        <Navigation
          handlers={handlers}
          slideshowCount={this.state.currentSlideshow.books.length}
          viewMode={this.state.viewMode}>
        </Navigation>
        <MultiView {...this.state} {...handlers}></MultiView>
      </div>
    )
  }
}

export default App;
