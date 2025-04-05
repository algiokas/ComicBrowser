import React, { Component } from "react";
import { GetCoverPath } from "../../../util/helpers";
import IBook from "../../../interfaces/book";
import StarsImage from "../../../img/stars.svg"
import PlusImg from "../../../img/plus-symbol.svg"
import MinusImg from "../../../img/minus-symbol.svg"
import GalleryItemOverlay from "./galleryItemOverlay";

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
  hideFavorites?: boolean
  overlayIcon?: React.FunctionComponent<React.SVGAttributes<SVGElement>>
}

interface GalleryItemState { }

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
        {
          this.props.overlayIcon ?
            <div className="gallery-overlay">
              <img className="svg-icon" src={this.props.overlayIcon.toString()}></img>
            </div> : null
        }
        <div className="gallery-inner" onClick={this.props.bodyClickHandler ? this.bodyClick : undefined}>
          <img className="gallery-image" src={this.props.coverUrl} alt={`${this.props.book.title} cover`}></img>
          <div className={this.props.book.isFavorite ? "caption favorite" : "caption"}>
            <div className="caption-text">
              <span className="subtitle" onClick={this.props.subTitleClickHandler ? this.subtitleClick : undefined}>
                {this.props.subtitle}
              </span>
              <span className="title">{this.props.book.title}</span>
            </div>
            <div className="favorite-icon" onClick={this.props.favoriteClickHandler ? this.favoriteClick : undefined} hidden={this.props.hideFavorites}>
              {
                this.props.book.isFavorite ?
                  <img className="svg-icon-favorite" src={StarsImage.toString()} alt="remove from favorites"></img>
                  :
                  <img className="svg-icon-disabled test" src={StarsImage.toString()} alt="add to favorites"></img>
              }
            </div>
          </div>
          {
            this.props.addButtonHandler ? (
              <button className="add-button" onClick={this.addButtonClick}>
                <img className="svg-icon" src={PlusImg.toString()} alt="add to slideshow"></img>
              </button>
            ) : null
          }
          {
            this.props.removeButtonHandler ? (
              <button className="add-button" onClick={this.removeButtonClick}>
                <img className="svg-icon" src={MinusImg.toString()} alt="remove from slideshow"></img>
              </button>
            ) : null
          }
        </div>
      </div>
    )
  }
}

export default GalleryItem