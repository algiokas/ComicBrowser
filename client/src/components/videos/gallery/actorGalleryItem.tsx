import type { Actor } from "../../../types/actor";
import StarsImage from "../../../img/svg/stars.svg"
import TagsImage from "../../../img/svg/tags.svg";
import type { BaseGalleryItemProps } from "../../shared/baseGalleryItem";

interface ActorGalleryItemProps extends BaseGalleryItemProps<Actor> {
  children?: React.ReactNode,
  infoLabel?: string;
  infoValue?: string;
}

const ActorGalleryItem = (props: ActorGalleryItemProps) => {
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

  const tileClassName = props.data.isFavorite ? "actor-gallery favorite" : "actor-gallery"

  return (
    <div className={tileClassName} key={props.data.id}>
      <div className="actor-gallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
        {
          props.infoLabel && props.infoValue ?
            <div className="actor-gallery-info-display">
              <span className="info-label">{props.infoLabel}</span>
              <span className="info-value">{props.infoValue}</span>
            </div>
            : null
        }

        <div className="actor-gallery-image">
          <img src={props.imageUrl} alt={`${props.data.name} thumbnail`}></img>
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
                <span className="title">{props.data.name}</span>
              </div>
            </div>
        }
      </div>
    </div>
  )
}

export default ActorGalleryItem