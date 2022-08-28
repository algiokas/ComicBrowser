import React, { Component } from "react";
import { GetCoverPath } from "../helpers";

class GalleryItem extends Component {
    constructor(props) {
      super(props)
      this.state = { coverUrl: GetCoverPath(props.book) }

      if (props.viewBook) {
        this.viewBook = props.viewBook.bind(this)
      }
      if (props.addButtonHandler) {
        this.addButtonHandler = props.addButtonHandler.bind(this)
      }
      if (props.removeButtonHandler) {
        this.removeButtonHandler = props.removeButtonHandler.bind(this)
      }
      if (props.bodyClickHandler) {
        this.bodyClickHandler = props.bodyClickHandler.bind(this)
      }
    }

    bodyClick = (e) => {
      console.log(`body click ${this.props.book.title}`)
      this.bodyClickHandler(this.props.book, this.props.index)
    }

    addButtonClick = (e) => {
      e.stopPropagation()
      this.addButtonHandler(this.props.book)
    }

    removeButtonClick = (e) => {
      e.stopPropagation()
      this.removeButtonHandler(this.props.index)
    }

    componentDidUpdate(prevProps, prevState) {
      if (this.props.book.title !== prevProps.book.title) {
        this.setState({ coverUrl: GetCoverPath(this.props.book) })
      }
    }

    render() {
        return (
          <div className="gallery" key={this.props.book.title} onClick={this.props.bodyClickHandler ? this.bodyClick : undefined}>
            <img className="gallery-image" src={this.state.coverUrl} alt={`${this.props.book.title} cover`}></img>
            <div className="caption">{this.props.book.title}</div>
            {
              this.props.addButtonHandler ? (
                <button className="add-button" onClick={this.addButtonClick}>
                  <img className="svg-icon" src="http://localhost:9000/data/images/plus-symbol.svg" alt="add to slideshow"></img>
                </button>
              ) : null
            }
            {
              this.props.removeButtonHandler ? (
                <button className="add-button" onClick={this.removeButtonClick}>
                  <img className="svg-icon" src="http://localhost:9000/data/images/minus-symbol.svg" alt="remove from slideshow"></img>
                </button>
              ) : null
            }
          </div>
        )
      }
}

export default GalleryItem