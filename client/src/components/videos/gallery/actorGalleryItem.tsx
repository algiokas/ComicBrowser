import IActor from "../../../interfaces/actor";
import BaseGalleryItem, { BaseGalleryItemProps, BaseGalleryItemState } from "./baseGalleryItem";
import StarsImage from "../../../img/stars.svg"


interface ActorGalleryItemProps extends BaseGalleryItemProps<IActor>{

}

interface ActorGalleryItemState extends BaseGalleryItemState<IActor>{}

class ActorGalleryItem extends BaseGalleryItem<IActor, ActorGalleryItemProps, ActorGalleryItemState> {

  render() {
    return (
      <div className="actorgallery" key={this.props.data.id}>
        <div className="actorgallery-inner" onClick={this.props.bodyClickHandler ? this.bodyClick : undefined}>
          <img className="actorgallery-image" src={this.props.imageUrl} alt={`${this.props.data.name} thumbnail`}></img>
          <div className={ this.props.data.isFavorite ? "caption favorite" : "caption"}>
            <div className="caption-text">
              <span className="title">{this.props.data.name}</span>
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

export default ActorGalleryItem