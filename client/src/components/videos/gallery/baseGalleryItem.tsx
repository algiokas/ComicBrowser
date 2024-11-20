import React, { Component } from "react";
import IVideo from "../../../interfaces/video";

export interface BaseGalleryItemProps<T> {
  index: number,
  data: T,
  imageUrl: string,
  bodyClickHandler?: (data: T, index: number) => void,
  favoriteClickHandler?: (data: T) => void,
}

export interface BaseGalleryItemState<T> {}

class BaseGalleryItem<T, P extends BaseGalleryItemProps<T>, S extends BaseGalleryItemState<T>> extends Component<P, S> {
  bodyClick = (e: React.MouseEvent) => {
    if (this.props.bodyClickHandler)
      this.props.bodyClickHandler(this.props.data, this.props.index)
  }

  favoriteClick = (e: React.MouseEvent) => {
    if (this.props.favoriteClickHandler) {
      e.stopPropagation()
      this.props.favoriteClickHandler(this.props.data)
    }
  }
}

export default BaseGalleryItem