import React, { Component } from "react";
import SlideShow from "./components/slideShow";
import BookGallery from "./components/bookGallery";
import logo from './logo.svg';
import './App.css';

const apiBaseUrl = "http://localhost:9000/api/";

class App extends Component {
  constructor(props) {
    super(props);

    this.galleryPageSize = 12
    this.state = {
      allBooks: [],
      selectedBook: {},
      slideshowInterval: 5
    }
  }

  getAllBooks() {
    console.log('getting books')
    fetch(apiBaseUrl + "allBooks")
      .then(res => res.json())
      .then(data => {
        this.setState({ allBooks: data })
      });
  }

  resetCurrentBook = () => {
    this.setState({ selectedBook: {} })
  }

  setCurrentBook = (book) => {
    this.setState({ selectedBook: book })
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
            <img src={logo} />
          </div>
          <div className="nav-items">
            <div className="nav-item" onClick={this.resetCurrentBook}>Listing</div>
          </div>
        </nav>
        {
          this.state.selectedBook.title ?
            <SlideShow book={this.state.selectedBook} interval={this.state.slideshowInterval} setSlideshowInterval={this.setSlideshowInterval}></SlideShow> :
            <BookGallery allBooks={this.state.allBooks} pageSize={this.galleryPageSize} setCurrentBook={this.setCurrentBook}></BookGallery>
        }
      </div>
    )
  }
}

export default App;
