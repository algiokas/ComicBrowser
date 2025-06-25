import type IActor from "../../../interfaces/actor";
import type { BaseGalleryItemProps } from "../../shared/baseGalleryItem";
import StarsImage from "../../../img/svg/stars.svg"


interface ActorGalleryItemProps{
  index: number,
  actor: IActor,
  bodyClickHandler?: (data: IActor, index: number) => void,
  favoriteClickHandler?: (data: IActor) => void,
}

const ActorGalleryItem = (props: ActorGalleryItemProps) => {
  const bodyClick = (e: React.MouseEvent) => {
    if (props.bodyClickHandler)
      props.bodyClickHandler(props.actor, props.index)
  }

  const favoriteClick = (e: React.MouseEvent) => {
    if (props.favoriteClickHandler) {
      e.stopPropagation()
      props.favoriteClickHandler(props.actor)
    }
  }

  return (
    <div className="actorgallery" key={props.actor.id}>
      <div className="actorgallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
        <img className="actorgallery-image" src={props.actor.imageUrl} alt={`${props.actor.name} thumbnail`}></img>
        <div className={props.actor.isFavorite ? "caption favorite" : "caption"}>
          <div className="caption-text">
            <span className="title">{props.actor.name}</span>
          </div>
          <div className="favorite-icon" onClick={props.favoriteClickHandler ? favoriteClick : undefined}>
            {
              props.actor.isFavorite ?
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

export default ActorGalleryItem