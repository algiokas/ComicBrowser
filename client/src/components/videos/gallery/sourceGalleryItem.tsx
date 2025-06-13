import IVideoSource from "../../../interfaces/videoSource";
import { BaseGalleryItemProps } from "../../shared/baseGalleryItem";

export interface SourceGalleryItemProps extends BaseGalleryItemProps<IVideoSource> {

}

const SourceGalleryItem = (props: SourceGalleryItemProps) => {
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
        <div className="sourcegallery" key={props.data.id}>
            <div className="sourcegallery-inner" onClick={props.bodyClickHandler ? bodyClick : undefined}>
                <img className="sourcegallery-image" src={props.imageUrl} alt={`${props.data.name} thumbnail`}></img>
                <div className="caption">
                    <div className="caption-text">
                        <span className="title">{props.data.name}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SourceGalleryItem