
import { BaseGalleryItemProps } from "../../shared/baseGalleryItem";
import { ICollection } from "../../../interfaces/slideshow";

const CollectionGalleryItem = (props: BaseGalleryItemProps<ICollection>) => {
  const bodyClick = (e: React.MouseEvent) => {
    if (props.bodyClickHandler)
      props.bodyClickHandler(props.data, props.index)
  }

  return (
    <div className="gallery" key={props.data.id}>
      <div className="gallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
        <img className="gallery-image" src={props.imageUrl} alt={`${props.data.name} thumbnail`}></img>
        <div className="caption">
          <div className="caption-text">
            <span className="title">{props.data.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionGalleryItem