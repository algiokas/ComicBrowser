import { useContext, useState } from "react";
import StarsImage from "../../../img/svg/stars.svg";
import CameraIcon from "../../../img/svg/camera.svg";
import type { Actor } from "../../../types/actor";
import { getActorAge, getActorVideoCount } from "../../../util/videoUtils";
import Modal from "../../shared/modal";
import ActorEditPanel from "../editPanel/actorEditPanel";
import { VideosAppContext } from "../../../context/videosAppContext";
import type { TagType } from "../../../util/enums";
import type { VideosAppTag } from "../../../types/tags";

interface ActorDetailProps {
    actor: Actor,
}

const ActorDetail = (props: ActorDetailProps) => {
    const [showActorEditModal, setShowActorEditModal] = useState<boolean>(false)

    const appContext = useContext(VideosAppContext)

    const favoriteClick = () => {
        props.actor.isFavorite = !props.actor.isFavorite; //toggle value
        appContext.updateActor(props.actor)
    }

    const toggleEditModal = () => {
        setShowActorEditModal(prev => !prev)
    }

    const searchTag = (tagName: string) => {
        console.log(tagName)
    }

    const generateTagImage = (e: React.MouseEvent, tag: VideosAppTag, tagType: TagType): void => {
    }

    return (
        <div className={`actor-detail ${props.actor.isFavorite ? "favorite" : ""}`}>
            <div className="actor-detail-header">
                <h2 className="actor-detail-name">{props.actor.name}</h2>
                <div className="favorite-icon" onClick={() => favoriteClick()}>
                    {
                        props.actor.isFavorite ?
                            <img className="svg-icon-favorite" src={StarsImage.toString()} alt="remove from favorites"></img>
                            :
                            <img className="svg-icon-disabled test" src={StarsImage.toString()} alt="add to favorites"></img>
                    }
                </div>
            </div>
            <div className="actor-detail-inner">
                <div className="actor-detail-image">
                    <img src={props.actor.imageUrl}></img>
                </div>
                <div className="actor-detail-info">
                    <div className="actor-detail-info-row">
                        <span className="actor-detail-info-label">Videos: </span>
                        <span className="actor-detail-info-value">{getActorVideoCount(props.actor, appContext.allVideos)}</span>
                    </div>
                    <div className="actor-detail-info-row">
                        <span className="actor-detail-info-label">Age: </span>
                        <span className="actor-detail-info-value">{getActorAge(props.actor)}</span>
                    </div>
                    <div className="tags-list">
                        {
                            props.actor.tags.toSorted((a, b) => a.name.localeCompare(b.name)).map((tag, i) => {
                                return (
                                    <div key={i} className="player-tag info-item clickable" onClick={() => searchTag(tag.name)}>
                                        <span>{tag.name}</span>
                                        <div className="image-gen" onClick={(e) => generateTagImage(e, tag, 'Video')}>
                                            <img className="svg-icon-favorite" src={CameraIcon.toString()} alt={"Generate image for " + tag.name}></img>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="actor-detail-edit">
                    <button type="button" className="actor-detail-edit-button" onClick={() => { toggleEditModal() }}>
                        Edit Actor
                    </button>
                    <Modal modalId={"bookinfo-edit-modal"} displayModal={showActorEditModal} toggleModal={toggleEditModal}>
                        <ActorEditPanel
                            actor={props.actor}
                            toggleDisplay={toggleEditModal} />
                    </Modal>
                </div>
            </div>
        </div>
    )
}

export default ActorDetail