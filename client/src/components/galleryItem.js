import React, { Component } from "react";
import { GetCoverPath } from "../helpers";

class GalleryItem extends Component {
    constructor(props) {
      super(props)
      this.state = { coverUrl: GetCoverPath(props.book) }
      this.viewBook = props.viewBook.bind(this)
      this.addBookToSlideshow = props.addBookToSlideshow.bind(this)
    }

    addButtonClick = (e) => {
      console.log('add to slideshow')
      e.stopPropagation()
      this.addBookToSlideshow(this.props.book)
    }

    componentDidUpdate(prevProps, prevState) {
      if (this.props.book.title !== prevProps.book.title) {
        this.setState({ coverUrl: GetCoverPath(this.props.book) })
      }
    }

    render() {
        return (
          <div className="gallery" key={this.props.book.title} onClick={() => this.viewBook(this.props.book)}>
            <img className="gallery-image" src={this.state.coverUrl} alt={`${this.props.book.title} cover`}></img>
            <div className="caption">{this.props.book.title}</div>
            <button className="add-button" onClick={this.addButtonClick}>
              <img className="svg-icon" src="http://localhost:9000/data/images/plus-symbol.svg" alt="add to slideshow"></img>
            </button>
          </div>
        )
      }
}

export default GalleryItem