import React from "react";
import BaseGalleryItem, { BaseGalleryItemProps, BaseGalleryItemState } from "./baseGalleryItem";
import IVideo from "../../../interfaces/video";
import IActor from "../../../interfaces/actor";
import StarsImage from "../../../img/stars.svg"



interface VideoGalleryItemProps extends BaseGalleryItemProps<IVideo> {
  subTitleItemClickHandler?: (actor: IActor) => void,
}

interface VideoGalleryItemState extends BaseGalleryItemState<IVideo>{}

class VideoGalleryItem extends BaseGalleryItem<IVideo, VideoGalleryItemProps, VideoGalleryItemState> {
  subtitleClick = (e: React.MouseEvent, actor: IActor) => {
    if (this.props.subTitleItemClickHandler) {
      e.stopPropagation()
      this.props.subTitleItemClickHandler(actor)
    }
  }
  render() {
    return (
      <div className="videogallery" key={this.props.data.title}>
        <div className="videogallery-inner" onClick={this.props.bodyClickHandler ? this.bodyClick : undefined}>
          <div className="videogallery-image">
            <img src={this.props.imageUrl} alt={`${this.props.data.title} thumbnail`}></img>
          </div>
          <div className={ this.props.data.isFavorite ? "caption favorite" : "caption"}>
            <div className="caption-text">
              <span className="subtitle">
                {
                  this.props.data.actors.map((actor, i) => {
                    return (
                      <span key={i} onClick={(e) => this.subtitleClick(e, actor)}>{actor.name}</span>
                    )
                  })
                }
              </span>
              <span className="title">{this.props.data.title}</span>
            </div>
            <div className="favorite-icon" onClick={this.props.favoriteClickHandler ? this.favoriteClick : undefined}>
              {
                this.props.data.isFavorite ?
                <img className="svg-icon-favorite" src={StarsImage.toString()} alt="remove from favorites"></img>
                :
                <img className="svg-icon-disabled test" src={StarsImage.toString()} alt="add to favorites"></img>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default VideoGalleryItem