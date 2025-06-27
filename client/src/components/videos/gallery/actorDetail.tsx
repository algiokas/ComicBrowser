import { useContext } from "react";
import StarsImage from "../../../img/svg/stars.svg";
import type IActor from "../../../interfaces/actor";
import { VideosAppContext } from "../videosAppContext";

interface ActorDetailProps {
    actor: IActor,
}

const ActorDetail = (props: ActorDetailProps) => {
    const appContext = useContext(VideosAppContext)

    const favoriteClick = () => {
        props.actor.isFavorite = !props.actor.isFavorite; //toggle value
        appContext.updateActor(props.actor)
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
                        <span className="actordetail-info-value">{props.actor.videos.length}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActorDetail