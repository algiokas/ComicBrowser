import React, { Component } from "react";
import { GetCoverPath } from "../util/helpers";

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
    if (props.getSubtitle) {
      this.getSubtitle = props.getSubtitle.bind(this)
    }
    if (props.subTitleClickHandler) {
      this.subTitleClickHandler = props.subTitleClickHandler.bind(this)
    }
    if (props.favoriteClickHandler) {
      this.favoriteClickHandler = props.favoriteClickHandler.bind(this)
    }
  }

  bodyClick = (e) => {
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

  subtitleClick = (e) => {
    e.stopPropagation()
    this.subTitleClickHandler(this.props.book)
  }

  favoriteClick = (e) => {
    e.stopPropagation()
    this.favoriteClickHandler(this.props.book)
  }

  getSubtitleText = (book) => {
    if (this.getSubtitle) {
      return this.getSubtitle(book)
    }
    return ""
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.book.title !== prevProps.book.title) {
      this.setState({ coverUrl: GetCoverPath(this.props.book) })
    }
  }

  render() {
    return (
      <div className="gallery" key={this.props.book.title}>
        <div className="gallery-inner" onClick={this.props.bodyClickHandler ? this.bodyClick : undefined}>
          <img className="gallery-image" src={this.state.coverUrl} alt={`${this.props.book.title} cover`}></img>
          <div className={ this.props.book.isFavorite ? "caption favorite" : "caption"}>
            <div className="caption-text">
              <span className="subtitle" onClick={this.props.subTitleClickHandler ? this.subtitleClick : undefined}>
                {this.getSubtitleText(this.props.book)}
              </span>
              <span className="title">{this.props.book.title}</span>
            </div>
            <div className="favorite-icon" onClick={this.props.favoriteClickHandler ? this.favoriteClick : undefined}>
              {
                this.props.book.isFavorite ?
                <img className="svg-icon-favorite" src="http://localhost:9000/data/images/stars.svg" alt="remove from favorites"></img>
                :
                <img className="svg-icon-disabled test" src="http://localhost:9000/data/images/stars.svg" alt="add to favorites"></img>
              }
            </div>
          </div>
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
      </div>
    )
  }
}

export default GalleryItem