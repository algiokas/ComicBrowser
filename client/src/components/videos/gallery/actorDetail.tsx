import { Component } from "react";
import IActor from "../../../interfaces/actor";
import StarsImage from "../../../img/stars.svg"

interface ActorDetailProps {
    actor: IActor,
    getActorImageUrl(actor: IActor): string,
    updateActor?: (actor: IActor) => void,
}

interface ActorDetailState {
    primaryImageUrl: string
}

class ActorDetail extends Component<ActorDetailProps, ActorDetailState> {
    constructor(props: ActorDetailProps) {
        super(props)

        this.state = {
            primaryImageUrl: props.getActorImageUrl(props.actor)
        }
    }

    favoriteClick = () => {
        if (this.props.updateActor) {
            console.log("toggle favorite for actor: " + this.props.actor.id)
            this.props.actor.isFavorite = !this.props.actor.isFavorite; //toggle value
            this.props.updateActor(this.props.actor)
        } else {
            console.error("updateActor function not found")
        }
    }


    render() {
        return (
            <div className={`actordetail ${this.props.actor.isFavorite ? "favorite" : ""}`}>
                <div className="actordetail-header">
                    <h2 className="actordetail-name">{this.props.actor.name}</h2>
                    <div className="favorite-icon" onClick={() => this.favoriteClick()}>
                    {
                        this.props.actor.isFavorite ?
                        <img className="svg-icon-favorite" src={StarsImage.toString()} alt="remove from favorites"></img>
                        :
                        <img className="svg-icon-disabled test" src={StarsImage.toString()} alt="add to favorites"></img>
                    }
                    </div>
                </div>
                <div className="actordetail-inner">
                    <div className="actordetail-image">
                        <img src={this.props.getActorImageUrl(this.props.actor)}></img>
                    </div>
                </div>
            </div>
        )
    }
}

export default ActorDetail