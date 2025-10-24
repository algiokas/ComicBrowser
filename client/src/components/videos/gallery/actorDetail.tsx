import { useContext, useState } from "react";
import StarsImage from "../../../img/svg/stars.svg";
import type { Actor } from "../../../types/actor";
import { getActorAge, getActorVideoCount } from "../../../util/videoUtils";
import Modal from "../../shared/modal";
import ActorEditPanel from "../editPanel/actorEditPanel";
import { VideosAppContext } from "../videosAppContext";

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

    return (
        <div className={`actordetail ${props.actor.isFavorite ? "favorite" : ""}`}>
            <div className="actordetail-header">
                <h2 className="actordetail-name">{props.actor.name}</h2>
                <div className="favorite-icon" onClick={() => favoriteClick()}>
                    {
                        props.actor.isFavorite ?
                            <img className="svg-icon-favorite" src={StarsImage.toString()} alt="remove from favorites"></img>
                            :
                            <img className="svg-icon-disabled test" src={StarsImage.toString()} alt="add to favorites"></img>
                    }
                </div>
            </div>
            <div className="actordetail-inner">
                <div className="actordetail-image">
                    <img src={props.actor.imageUrl}></img>
                </div>
                <div className="actordetail-info">
                    <div className="actordetail-info-row">
                        <span className="actordetail-info-label">Videos: </span>
                        <span className="actordetail-info-value">{getActorVideoCount(props.actor, appContext.allVideos)}</span>
                    </div>
                    <div className="actordetail-info-row">
                        <span className="actordetail-info-label">Age: </span>
                        <span className="actordetail-info-value">{getActorAge(props.actor)}</span>
                    </div>
                </div>
                <div className="actordetail-edit">
                    <button type="button" onClick={() => { toggleEditModal() }}>
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