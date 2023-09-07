import React, { Component } from "react";
import { GetCoverPath } from "../../util/helpers";
import IBook from "../../interfaces/book";

interface GalleryItemProps {
  index: number,
  book: IBook,
  coverUrl: string,
  subtitle: string,
  bodyClickHandler?: (book: IBook, bookIndex: number) => void,
  addButtonHandler?: (book: IBook) => void,
  removeButtonHandler?: (index: number) => void,
  subTitleClickHandler?: (book: IBook) => void,
  favoriteClickHandler?: (book: IBook) => void,
}

interface GalleryItemState {}

class GalleryItem extends Component<GalleryItemProps, GalleryItemState> {
  bodyClick = (e: React.MouseEvent) => {
    if (this.props.bodyClickHandler)
      this.props.bodyClickHandler(this.props.book, this.props.index)
  }

  addButtonClick = (e: React.MouseEvent) => {
    if (this.props.addButtonHandler) {
      e.stopPropagation()
      this.props.addButtonHandler(this.props.book)
    }
  }

  removeButtonClick = (e: React.MouseEvent) => {
    if (this.props.removeButtonHandler) {
      e.stopPropagation()
      this.props.removeButtonHandler(this.props.index)
    }
  }

  subtitleClick = (e: React.MouseEvent) => {
    if (this.props.subTitleClickHandler) {
      e.stopPropagation()
      this.props.subTitleClickHandler(this.props.book)
    }
  }

  favoriteClick = (e: React.MouseEvent) => {
    if (this.props.favoriteClickHandler) {
      e.stopPropagation()
      this.props.favoriteClickHandler(this.props.book)
    }
  }

  render() {
    return (
      <div className="gallery" key={this.props.book.title}>
        <div className="gallery-inner" onClick={this.props.bodyClickHandler ? this.bodyClick : undefined}>
          <img className="gallery-image" src={this.props.coverUrl} alt={`${this.props.book.title} cover`}></img>
          <div className={ this.props.book.isFavorite ? "caption favorite" : "caption"}>
            <div className="caption-text">
              <span className="subtitle" onClick={this.props.subTitleClickHandler ? this.subtitleClick : undefined}>
                {this.props.subtitle}
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