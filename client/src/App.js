import React, { Component } from "react";
import Navigation from "./components/navigation";
import MainBody from "./components/mainBody";
import './App.css';

const apiBaseUrl = "http://localhost:9000/api/";

export const ViewMode = Object.freeze({
	Listing: Symbol("Listing"),
	SingleBook: Symbol("SingleBook"),
	Slideshow: Symbol("SlideShow"),
})

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      galleryPageSize: 12,
      allBooks: [],
      viewMode: ViewMode.Listing,
      currentBook: {},
      currentSlideshow: {
        pageCount: 0,
        books: []
      },
      slideshowInterval: 5
    }
  }

  getAllBooks() {
    console.log('getting books')
    fetch(apiBaseUrl + "allBooks")
      .then(res => res.json())
      .then(data => {
        console.log(`got ${data.length} books`)
        this.setState({ allBooks: data })
      });
  }

  resetSlideShow = () => {
    console.log('reset slideshow')
    this.setState({
      viewMode: ViewMode.Listing,
      currentSlideshow: {
        pageCount: 0,
        books: []
      }
    })
  }

  viewBook = (book) => {
    console.log('view book')
    this.setState({
      viewMode: ViewMode.SingleBook,
      currentBook: book,
    })
  }

  viewCurrentBook = () => {
    console.log('view current book')
    if (this.state.currentBook.title) {
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
    console.log('add to slideshow')
    this.setState((state) => {
      return {
        currentSlideshow: {
          pageCount: state.currentSlideshow.pageCount + book.pageCount,
          books: [...state.currentSlideshow.books, book]
        }
      }
    })

  }

  setSlideshowInterval = (interval) => {
    this.setState({ slideshowInterval: interval })
  }

  componentDidMount() {
    this.getAllBooks();
  }

  render() {
    const handlers = {
      resetSlideShow: this.resetSlideShow,
      viewBook: this.viewBook,
      viewSlideshow: this.viewSlideshow,
      viewListing: this.viewListing,
      viewCurrentBook: this.viewCurrentBook,
      addBookToSlideshow: this.addBookToSlideshow,
      setSlideshowInterval: this.setSlideshowInterval,
    }
    console.log("Render App")
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
