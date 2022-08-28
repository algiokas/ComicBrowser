import React, { Component } from "react";
import Navigation from "./components/navigation";
import MainBody from "./components/mainBody";
import { slideshowToJSON } from "./helpers";
import './App.css';

const apiBaseUrl = "http://localhost:9000/api/";

export const ViewMode = Object.freeze({
  Listing: Symbol("Listing"),
  SingleBook: Symbol("SingleBook"),
  Slideshow: Symbol("Slideshow"),
})

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      galleryPageSize: 12,
      allBooks: [],
      viewMode: ViewMode.Listing,
      singleBookPage: 0,
      slideshowPage: 0,
      currentSlideshow: {
        pageCount: 0,
        books: [],
      },
      slideshowInterval: 5
    }
  }

  getAllBooks() {
    fetch(apiBaseUrl + "allBooks")
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
    console.log('save slideshow')
    fetch(apiBaseUrl + 'saveslideshow', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slideshowToJSON(this.state.currentSlideshow))
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
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

  componentDidMount() {
    this.getAllBooks();
  }

  render() {
    const handlers = {
      viewBook: this.viewBook,
      viewSlideshow: this.viewSlideshow,
      viewListing: this.viewListing,
      viewCurrentBook: this.viewCurrentBook,
      addBookToSlideshow: this.addBookToSlideshow,
      removeBookFromSlideshow: this.removeBookFromSlideshow,
      setSlideshowInterval: this.setSlideshowInterval,
      setSlideshowPage: this.setSlideshowPage,
      resetSlideshow: this.resetSlideshow,
      saveCurrentSlideshow: this.saveCurrentSlideshow
    }
    return (
      <div className="App">
        <Navigation
          handlers={handlers}
          slideshowCount={this.state.currentSlideshow.books.length}>
        </Navigation>
        <MainBody {...this.state} {...handlers}></MainBody>
      </div>
    )
  }
}

export default App;
