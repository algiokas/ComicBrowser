import React, { useEffect, useState } from "react";
import StarsImage from "../../../img/svg/stars.svg";
import TagsImage from "../../../img/svg/tags.svg";
import type IActor from "../../../interfaces/actor";
import type IVideo from "../../../interfaces/video";
import { getVideoThumbnailUrl } from "../../../util/helpers";

interface VideoGalleryItemProps {
  index: number,
  video: IVideo,
  bodyClickHandler?: (data: IVideo, index: number) => void,
  favoriteClickHandler?: (data: IVideo) => void,
  subTitleItemClickHandler?: (actor: IActor) => void,
  onImageLoad?: (idx: number) => void
}

const VideoGalleryItem = (props: VideoGalleryItemProps) => {
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string>('')

  useEffect(() => {
    const updateThumbnail = async () => {
      const thumbnailUrl = await getVideoThumbnailUrl(props.video)
      setThumbnailImageUrl(thumbnailUrl)
    }
    updateThumbnail()
  }, [props.video])

  const bodyClick = (e: React.MouseEvent) => {
    if (props.bodyClickHandler)
      props.bodyClickHandler(props.video, props.index)
  }

  const favoriteClick = (e: React.MouseEvent) => {
    if (props.favoriteClickHandler) {
      e.stopPropagation()
      props.favoriteClickHandler(props.video)
    }
  }
  const subtitleClick = (e: React.MouseEvent, actor: IActor) => {
    if (props.subTitleItemClickHandler) {
      e.stopPropagation()
      props.subTitleItemClickHandler(actor)
    }
  }

  return (
    <div className="videogallery" key={props.video.title}>
      <div className="videogallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
        <div className="videogallery-image">
          {
            thumbnailImageUrl ?
              <img
                src={thumbnailImageUrl}
                alt={`${props.video.title} thumbnail`}
                onLoad={() => { if (props.onImageLoad) props.onImageLoad(props.index)}}>
              </img>
              : null
          }
        </div>
        <div className={props.video.isFavorite ? "caption favorite" : "caption"}>
          <div className="tags-icon">
            {
              props.video.tags.length > 0 ?
              <img className="svg-icon-red" src={TagsImage.toString()} alt="Video Tags"></img>
              :
              <img className="svg-icon-disabled" src={TagsImage.toString()} alt="Video Tags"></img>
            }
          </div>
          <div className="caption-text">
            <span className="subtitle">
              {
                props.video.actors.map((actor, i) => {
                  return (
                    <span key={i} onClick={(e) => subtitleClick(e, actor)}>{actor.name}</span>
                  )
                })
              }
            </span>
            <span className="title">{props.video.title}</span>
          </div>
          <div className="favorite-icon" onClick={props.favoriteClickHandler ? favoriteClick : undefined}>
            {
              props.video.isFavorite ?
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