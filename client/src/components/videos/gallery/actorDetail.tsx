import React from "react";
import { Component } from "react";
import IVideo from "../../../interfaces/video";
import { IVideoSearchQuery } from "../../../interfaces/searchQuery";
import IActor from "../../../interfaces/actor";
import { getActorImageUrl } from "../../../util/helpers";

interface ActorDetailProps {
    actor: IActor,
    getActorImageUrl(actor: IActor): string,

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
    render() {
        return (
            <div className="actordetail">
                <div className="actordetail-header">
                    <h2 className="actordetail-name">{this.props.actor.name}</h2>
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