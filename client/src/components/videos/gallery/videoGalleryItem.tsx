import React from "react";
import StarsImage from "../../../img/svg/stars.svg";
import type IActor from "../../../interfaces/actor";
import type IVideo from "../../../interfaces/video";
import type { BaseGalleryItemProps } from "../../shared/baseGalleryItem";



interface VideoGalleryItemProps extends BaseGalleryItemProps<IVideo> {
  subTitleItemClickHandler?: (actor: IActor) => void,
}

const VideoGalleryItem = (props: VideoGalleryItemProps) => {
  const bodyClick = (e: React.MouseEvent) => {
    if (props.bodyClickHandler)
      props.bodyClickHandler(props.data, props.index)
  }

  const favoriteClick = (e: React.MouseEvent) => {
    if (props.favoriteClickHandler) {
      e.stopPropagation()
      props.favoriteClickHandler(props.data)
    }
  }
  const subtitleClick = (e: React.MouseEvent, actor: IActor) => {
    if (props.subTitleItemClickHandler) {
      e.stopPropagation()
      props.subTitleItemClickHandler(actor)
    }
  }

  return (
    <div className="videogallery" key={props.data.title}>
      <div className="videogallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
        <div className="videogallery-image">
          <img src={props.imageUrl} alt={`${props.data.title} thumbnail`}></img>
        </div>
        <div className={props.data.isFavorite ? "caption favorite" : "caption"}>
          <div className="caption-text">
            <span className="subtitle">
              {
                props.data.actors.map((actor, i) => {
                  return (
                    <span key={i} onClick={(e) => subtitleClick(e, actor)}>{actor.name}</span>
                  )
                })
              }
            </span>
            <span className="title">{props.data.title}</span>
          </div>
          <div className="favorite-icon" onClick={props.favoriteClickHandler ? favoriteClick : undefined}>
            {
              props.data.isFavorite ?
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

export default VideoGalleryItem