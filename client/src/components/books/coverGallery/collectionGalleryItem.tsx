
import BaseGalleryItem, { BaseGalleryItemProps, BaseGalleryItemState } from "../../shared/baseGalleryItem";
import StarsImage from "../../../img/stars.svg"
import { ICollection } from "../../../interfaces/slideshow";


interface CollectionGalleryItemProps extends BaseGalleryItemProps<ICollection>{}

interface CollectionGalleryItemState extends BaseGalleryItemState<ICollection>{}

class CollectionGalleryItem extends BaseGalleryItem<ICollection, CollectionGalleryItemProps, CollectionGalleryItemState> {
  render() {
    return (
      <div className="gallery" key={this.props.data.id}>
        <div className="gallery-inner" onClick={this.props.bodyClickHandler ? this.bodyClick : undefined}>
          <img className="gallery-image" src={this.props.imageUrl} alt={`${this.props.data.name} thumbnail`}></img>
          <div className="caption">
            <div className="caption-text">
              <span className="title">{this.props.data.name}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default CollectionGalleryItem