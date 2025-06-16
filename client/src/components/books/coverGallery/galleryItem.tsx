import React from "react";
import MinusImg from "../../../img/svg/minus-symbol.svg";
import PlusImg from "../../../img/svg/plus-symbol.svg";
import StarsImage from "../../../img/svg/stars.svg";
import type IBook from "../../../interfaces/book";

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

const GalleryItem = (props: GalleryItemProps) => {
  const bodyClick = (e: React.MouseEvent) => {
    if (props.bodyClickHandler)
      props.bodyClickHandler(props.book, props.index)
  }

  const addButtonClick = (e: React.MouseEvent) => {
    if (props.addButtonHandler) {
      e.stopPropagation()
      props.addButtonHandler(props.book)
    }
  }

  const removeButtonClick = (e: React.MouseEvent) => {
    if (props.removeButtonHandler) {
      e.stopPropagation()
      props.removeButtonHandler(props.index)
    }
  }

  const subtitleClick = (e: React.MouseEvent) => {
    if (props.subTitleClickHandler) {
      e.stopPropagation()
      props.subTitleClickHandler(props.book)
    }
  }

  const favoriteClick = (e: React.MouseEvent) => {
    if (props.favoriteClickHandler) {
      e.stopPropagation()
      props.favoriteClickHandler(props.book)
    }
  }

  return (
    <div className="gallery" key={props.book.title}>
      {
        props.overlayIcon ?
          <div className="gallery-overlay">
            <img className="svg-icon" src={props.overlayIcon.toString()}></img>
          </div> : null
      }
      <div className="gallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
        <img className="gallery-image" src={props.coverUrl} alt={`${props.book.title} cover`}></img>
        <div className={props.book.isFavorite ? "caption favorite" : "caption"}>
          <div className="caption-text">
            <span className="subtitle" onClick={props.subTitleClickHandler ? subtitleClick : undefined}>
              {props.subtitle}
            </span>
            <span className="title">{props.book.title}</span>
          </div>
          <div className="favorite-icon" onClick={props.favoriteClickHandler ? favoriteClick : undefined} hidden={props.hideFavorites}>
            {
              props.book.isFavorite ?
                <img className="svg-icon-favorite" src={StarsImage.toString()} alt="remove from favorites"></img>
                :
                <img className="svg-icon-disabled test" src={StarsImage.toString()} alt="add to favorites"></img>
            }
          </div>
        </div>
        {
          props.addButtonHandler ? (
            <button className="add-button" onClick={addButtonClick}>
              <img className="svg-icon" src={PlusImg.toString()} alt="add to slideshow"></img>
            </button>
          ) : null
        }
        {
          props.removeButtonHandler ? (
            <button className="add-button" onClick={removeButtonClick}>
              <img className="svg-icon" src={MinusImg.toString()} alt="remove from slideshow"></img>
            </button>
          ) : null
        }
      </div>
    </div>
  )
}

export default GalleryItem