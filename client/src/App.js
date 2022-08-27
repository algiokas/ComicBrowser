import React, { Component } from "react";
import SlideShow from "./components/slideShow";
import BookGallery from "./components/bookGallery";
import logo from './logo.svg';
import './App.css';

const apiBaseUrl = "http://localhost:9000/api/";

const ViewMode = Object.freeze({
	Summer: Symbol("summer"),
	Autumn: Symbol("autumn"),
	Winter: Symbol("winter"),
	Spring: Symbol("spring")
})

class App extends Component {
  constructor(props) {
    super(props);

    this.galleryPageSize = 12
    this.state = {
      allBooks: [],
      showSlideshow: false,
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
    this.setState({
      showSlideshow: false,
      currentSlideshow: {
        pageCount: 0,
        books: []
      }
    })
  }

  viewBook = (book) => {
    console.log('view book')
    this.setState({
      showSlideshow: true,
      currentSlideshow: {
        pageCount: book.pageCount,
        books: [book]
      }
    })
  }

  viewSlideshow = () => {
    if (this.state.currentSlideshow.pageCount > 0) {
      this.setState({
        showSlideshow: true
      })
    } 
  }

  viewListing = () => {
    this.setState({
      showSlideshow: false
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
    console.log(this.state.currentSlideshow)
  }

  setSlideshowInterval = (interval) => {
    this.setState({ slideshowInterval: interval })
  }

  componentDidMount() {
    this.getAllBooks();
  }

  render() {
    return (
      <div className="App">
        <nav role="navigation">
          <div className="logo">
            <img src={logo} alt="Logo" onClick={this.viewListing} />
          </div>
          <div className="nav-items">
            <div className="nav-item" onClick={this.viewListing}>Listing</div>
            <div className="nav-item" onClick={this.viewSlideshow}>
              Slideshow <span className="slideshow-count">{this.state.currentSlideshow.books.length}</span> 
            </div>
          </div>
        </nav>
        {
          this.state.showSlideshow ?
            <SlideShow slideShow={this.state.currentSlideshow} interval={this.state.slideshowInterval} setSlideshowInterval={this.setSlideshowInterval}></SlideShow> :
            <BookGallery allBooks={this.state.allBooks} pageSize={this.galleryPageSize} viewBook={this.viewBook} addBookToSlideshow={this.addBookToSlideshow}></BookGallery>
        }
      </div>
    )
  }
}

export default App;
