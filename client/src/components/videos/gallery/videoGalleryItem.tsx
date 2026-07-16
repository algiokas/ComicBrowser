import React, { useEffect, useState } from "react";
import StarsImage from "../../../img/svg/stars.svg";
import TagsImage from "../../../img/svg/tags.svg";
import type { Actor } from "../../../types/actor";
import type { Video } from "../../../types/video";
import { getVideoThumbnailUrl } from "../../../api/urls";
import type { BaseGalleryItemProps } from "../../shared/baseGalleryItem";

type VideoGalleryItemProps = Omit<BaseGalleryItemProps<Video>, 'imageUrl'> & {
  imageUrl?: string,
  className?: string,
  children?: React.ReactNode,
  lazyload?: boolean
  secondaryClickIconUrl?: string,
  subTitleItemClickHandler?: (actor: Actor) => void,
  secondaryClickHandler?: (data: Video) => void,
  onImageLoad?: (idx: number) => void,
}

const VideoGalleryItem = (props: VideoGalleryItemProps) => {
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string>(props.imageUrl ?? '')

  useEffect(() => {
    const updateThumbnail = async () => {
      const thumbnailUrl = await getVideoThumbnailUrl(props.data)
      setThumbnailImageUrl(thumbnailUrl)
    }
    if (!props.imageUrl) {
      updateThumbnail()
    }
  }, [props.data])

  const bodyClick = (_e: React.MouseEvent) => {
    if (props.bodyClickHandler)
      props.bodyClickHandler(props.data, props.index)
  }

  const favoriteClick = (e: React.MouseEvent) => {
    if (props.favoriteClickHandler) {
      e.stopPropagation()
      props.favoriteClickHandler(props.data)
    }
  }
  const subtitleClick = (e: React.MouseEvent, actor: Actor) => {
    if (props.subTitleItemClickHandler) {
      e.stopPropagation()
      props.subTitleItemClickHandler(actor)
    }
  }
  const secondaryClick = (e: React.MouseEvent, video: Video) => {
    if (props.secondaryClickHandler) {
      e.stopPropagation()
      props.secondaryClickHandler(video)
    }
  }

  const tileClassName = [
    "video-gallery",
    props.data.isFavorite ? "favorite" : "",
    props.className ?? ""
  ].filter(Boolean).join(" ")

  return (
    <div className={tileClassName} key={props.data.title}>
      <div className="video-gallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
        <div className="video-gallery-image">
          {
            thumbnailImageUrl ?
              <img
                src={thumbnailImageUrl}
                alt={`${props.data.title} thumbnail`}
                onLoad={() => { if (props.onImageLoad) props.onImageLoad(props.index) }}
                loading={props.lazyload ? 'lazy' : 'eager'}>
              </img>
              : null
          }
        </div>
        <div className="favorite-icon" onClick={props.favoriteClickHandler ? favoriteClick : undefined}>
          {
            props.data.isFavorite ?
              <img className="svg-icon-favorite" src={StarsImage.toString()} alt="remove from favorites"></img>
              :
              <img className="svg-icon-disabled test" src={StarsImage.toString()} alt="add to favorites"></img>
          }
        </div>
        <div className="tags-icon">
          {
            props.data.tags.length > 0 ?
              <img className="svg-icon-red" src={TagsImage.toString()} alt="Video Tags"></img>
              :
              <img className="svg-icon-disabled" src={TagsImage.toString()} alt="Video Tags"></img>
          }
        </div>
        {
          props.children ? <div className="caption">{props.children}</div> :
            <div className="caption">
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
            </div>
        }
        {
          props.secondaryClickHandler ?
          <button className="secondary-button" onClick={(e) => secondaryClick(e, props.data)}>
            {
              props.secondaryClickIconUrl ? <img className="svg-icon" src={props.secondaryClickIconUrl}></img> : null
            }
          </button>
          : null
        }
      </div>
    </div>
  )

}

export default VideoGalleryItem
