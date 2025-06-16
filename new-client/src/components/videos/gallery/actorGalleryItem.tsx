import type IActor from "../../../interfaces/actor";
import type { BaseGalleryItemProps } from "../../shared/baseGalleryItem";
import StarsImage from "../../../img/svg/stars.svg"


interface ActorGalleryItemProps extends BaseGalleryItemProps<IActor> {}

const ActorGalleryItem = (props: ActorGalleryItemProps) => {
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

  return (
    <div className="actorgallery" key={props.data.id}>
      <div className="actorgallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
        <img className="actorgallery-image" src={props.imageUrl} alt={`${props.data.name} thumbnail`}></img>
        <div className={props.data.isFavorite ? "caption favorite" : "caption"}>
          <div className="caption-text">
            <span className="title">{props.data.name}</span>
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

export default ActorGalleryItem