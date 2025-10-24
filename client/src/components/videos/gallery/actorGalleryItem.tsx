import type { Actor } from "../../../types/actor";
import StarsImage from "../../../img/svg/stars.svg"


interface ActorGalleryItemProps {
  index: number,
  actor: Actor,
  bodyClickHandler?: (data: Actor, index: number) => void,
  favoriteClickHandler?: (data: Actor) => void,
  children?: React.ReactNode
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
        {
          props.children ? <div className="caption">{props.children}</div> :
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
        }
      </div>
    </div>
  )
}

export default ActorGalleryItem