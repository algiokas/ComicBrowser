import { Component, useState } from "react";
import IActor from "../../../interfaces/actor";
import StarsImage from "../../../img/svg/stars.svg"

interface ActorDetailProps {
    actor: IActor,
    getActorImageUrl(actor: IActor): string,
    updateActor?: (actor: IActor) => void,
}

const ActorDetail = (props: ActorDetailProps) => {
    const [ primaryImageUrl, setPrimaryImageUrl ] = useState<string>(props.getActorImageUrl(props.actor))

    const favoriteClick = () => {
        if (props.updateActor) {
            console.log("toggle favorite for actor: " + props.actor.id)
            props.actor.isFavorite = !props.actor.isFavorite; //toggle value
            props.updateActor(props.actor)
        } else {
            console.error("updateActor function not found")
        }
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
                        <img src={primaryImageUrl}></img>
                    </div>
                </div>
            </div>
        )
}

export default ActorDetail