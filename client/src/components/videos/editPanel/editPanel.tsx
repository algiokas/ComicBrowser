import React, { Component } from "react";
import EditPanelRow from "./editPanel-row";
import EditPanelRowMulti from "./editPanel-row-multi";
import { VideosEditField } from "../../../util/enums";
import IVideo from "../../../interfaces/video";
import EditPanelRowStatic from "./editPanel-row-static";
import IActor from "../../../interfaces/actor";
import IVideoSource from "../../../interfaces/videoSource";

interface EditPanelProps {
    video: IVideo,
    allActors: IActor[],
    allSources: IVideoSource[],
    
    updateVideo(video: IVideo): void,
    deleteVideo(videoId: number): void,
    toggleDisplay(): void

    searchActor(a: string): void,
    searchSource(s: string): void,
    searchTag(t: string): void
}

interface EditFields {
    title: string,
    actors: IActor[],
    tags: string[],
    source: IVideoSource
}

interface EditPanelState {
    tempFields: EditFields,
    actorToAdd: string,
    tagToAdd: string,
    changesPending: boolean
}

class EditPanel extends Component<EditPanelProps, EditPanelState> {
    constructor(props: EditPanelProps) {
        super(props);

        this.state = {
            tempFields: {
                title: this.props.video.title,
                actors: this.props.video.actors,
                tags: this.props.video.tags,
                source: this.props.video.source,
            },
            actorToAdd: '',
            tagToAdd: '',
            changesPending: false
        }
    }

    arrayChangesPending = (temp: any[], original: any[]) => {
        if (!temp || !original) return false;
        if (temp.length !== original.length) return true;
        if (temp.length > 0) {
            for (let i = 0; i < temp.length; i++) {
                if (!original.includes(temp[i])) return true;
            }
        }
        return false;
    }

    checkPendingChanges = (tempFields: EditFields) => {
        if (tempFields.title !== this.props.video.title) return true;
        if (tempFields.source.id !== this.props.video.source.id) return true;

        if (this.arrayChangesPending(tempFields.actors, this.props.video.actors)) return true;
        if (this.arrayChangesPending(tempFields.tags, this.props.video.tags)) return true;

        return false;
    }

    resetPendingChanges = () => {
        this.setState({
            tempFields: {
                title: this.props.video.title,
                actors: this.props.video.actors,
                tags: this.props.video.tags,
                source: this.props.video.source,
            },
            changesPending: false
        })
    }

    updateTempValue = (field: VideosEditField, value: any) => {
        let fieldValues = this.state.tempFields
        switch (field) {
            case VideosEditField.Title:
                fieldValues.title = value
                break
            case VideosEditField.Actors:
                fieldValues.actors = value
                break
            case VideosEditField.Tags:
                fieldValues.tags = value
                break
            case VideosEditField.Source:
                fieldValues.source = value
                break
            default:
                console.log('invalid edit field')
        }
        this.setState({
            tempFields: fieldValues,
            changesPending: this.checkPendingChanges(fieldValues)
        })
    }

    saveVideoChanges = () => {
        console.log("saving changes to: " + this.props.video.title + " (ID: " + this.props.video.id + ")")

        let tempVideo = this.props.video

        tempVideo.title = this.state.tempFields.title
        tempVideo.actors = this.state.tempFields.actors
        tempVideo.tags = this.state.tempFields.tags
        tempVideo.source = this.state.tempFields.source

        console.log(tempVideo)

        this.props.updateVideo(tempVideo)
        this.props.toggleDisplay()
    }

    deleteVideo = () => {
        this.props.deleteVideo(this.props.video.id)
    }

    render() {
        return (
            <div className="edit-panel">
                <h3>Edit Video</h3>
                <h4>{"ID: " + this.props.video.id}</h4>
                <div className="edit-panel-inner">
                    <EditPanelRowStatic label={"Original Title"}
                        value={this.props.video.originalTitle}/>
                    <EditPanelRow<string> editField={VideosEditField.Title}
                        tempValue={this.state.tempFields.title}
                        getDisplayString={(s) => s}
                        getValueFromDisplayString={(s) => s}
                        updateTempValue={this.updateTempValue}/>
                    <EditPanelRowMulti<IActor> editField={VideosEditField.Actors}
                        tempValue={this.state.tempFields.actors}
                        updateTempValue={this.updateTempValue}
                        valueRange={this.props.allActors.sort((a, b) => a.name.localeCompare(b.name))}
                        valueClick={this.props.searchActor}
                        getDisplayString={(a) => a?.name ?? ''}
                        getValueFromDisplayString={(str) => {return this.props.allActors.find((a) => a.name == str) ?? null}}/>
                    <EditPanelRowMulti<string> editField={VideosEditField.Tags}
                        tempValue={this.state.tempFields.tags}
                        updateTempValue={this.updateTempValue}
                        valueClick={this.props.searchTag}
                        getDisplayString={(t) => t ?? ''}
                        getValueFromDisplayString={(t) => t}/>
                    <EditPanelRow<IVideoSource> editField={VideosEditField.Source}
                        tempValue={this.state.tempFields.source}
                        updateTempValue={this.updateTempValue}
                        valueRange={this.props.allSources.sort((a, b) => a.name.localeCompare(b.name))}
                        valueClick={this.props.searchSource}
                        getDisplayString={(source) => source.name}
                        getValueFromDisplayString={(sName) => this.props.allSources.find((s) => s.name == sName)!}/>
                </div>
                <div className="edit-panel-controls">
                    <button className="delete-button" onClick={this.deleteVideo} type="button">DELETE BOOK</button>
                    <button disabled={!this.state.changesPending} onClick={this.saveVideoChanges} type="button">Confirm Changes</button>
                    <button disabled={!this.state.changesPending} onClick={this.resetPendingChanges} type="button">Reset Changes</button>
                </div>
            </div>
        )
    }
}

export default EditPanel