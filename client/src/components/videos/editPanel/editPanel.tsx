import React, { Component, useState } from "react";
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

const EditPanel = (props: EditPanelProps) => {
    const [tempFields, setTempFields] = useState<EditFields>({
        title: props.video.title,
        actors: props.video.actors,
        tags: props.video.tags,
        source: props.video.source
    })
    const [changesPending, setChangesPending] = useState<boolean>(false)

    const arrayChangesPending = (temp: any[], original: any[]) => {
        if (!temp || !original) return false;
        if (temp.length !== original.length) return true;
        if (temp.length > 0) {
            for (let i = 0; i < temp.length; i++) {
                if (!original.includes(temp[i])) return true;
            }
        }
        return false;
    }

    const checkPendingChanges = (tempFields: EditFields) => {
        if (tempFields.title !== props.video.title) return true;
        if (tempFields.source.id !== props.video.source.id) return true;

        if (arrayChangesPending(tempFields.actors, props.video.actors)) return true;
        if (arrayChangesPending(tempFields.tags, props.video.tags)) return true;

        return false;
    }

    const resetPendingChanges = () => {
        setTempFields({
                title: props.video.title,
                actors: props.video.actors,
                tags: props.video.tags,
                source: props.video.source,
            })
        setChangesPending(false)
    }

    const updateTempValue = (field: VideosEditField, value: any) => {
        let fieldValues = tempFields
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
        setTempFields(fieldValues)
        setChangesPending(checkPendingChanges(fieldValues))
    }

    const saveVideoChanges = () => {
        console.log("saving changes to: " + props.video.title + " (ID: " + props.video.id + ")")

        let tempVideo = props.video

        tempVideo.title = tempFields.title
        tempVideo.actors = tempFields.actors
        tempVideo.tags = tempFields.tags
        tempVideo.source = tempFields.source

        console.log(tempVideo)

        props.updateVideo(tempVideo)
        props.toggleDisplay()
    }

    const deleteVideo = () => {
        props.deleteVideo(props.video.id)
    }

    return (
        <div className="edit-panel">
            <h3>Edit Video</h3>
            <h4>{"ID: " + props.video.id}</h4>
            <div className="edit-panel-inner">
                <EditPanelRowStatic label={"Original Title"}
                    value={props.video.originalTitle} />
                <EditPanelRow<string> editField={VideosEditField.Title}
                    tempValue={tempFields.title}
                    getDisplayString={(s) => s}
                    getValueFromDisplayString={(s) => s}
                    updateTempValue={updateTempValue} />
                <EditPanelRowMulti<IActor> editField={VideosEditField.Actors}
                    tempValue={tempFields.actors}
                    updateTempValue={updateTempValue}
                    valueRange={props.allActors.sort((a, b) => a.name.localeCompare(b.name))}
                    valueClick={props.searchActor}
                    getDisplayString={(a) => a?.name ?? ''}
                    getValueFromDisplayString={(str) => { return props.allActors.find((a) => a.name == str) ?? null }} />
                <EditPanelRowMulti<string> editField={VideosEditField.Tags}
                    tempValue={tempFields.tags}
                    updateTempValue={updateTempValue}
                    valueClick={props.searchTag}
                    getDisplayString={(t) => t ?? ''}
                    getValueFromDisplayString={(t) => t} />
                <EditPanelRow<IVideoSource> editField={VideosEditField.Source}
                    tempValue={tempFields.source}
                    updateTempValue={updateTempValue}
                    valueRange={props.allSources.sort((a, b) => a.name.localeCompare(b.name))}
                    valueClick={props.searchSource}
                    getDisplayString={(source) => source.name}
                    getValueFromDisplayString={(sName) => props.allSources.find((s) => s.name == sName)!} />
            </div>
            <div className="edit-panel-controls">
                <button className="delete-button" onClick={deleteVideo} type="button">DELETE BOOK</button>
                <button disabled={!changesPending} onClick={saveVideoChanges} type="button">Confirm Changes</button>
                <button disabled={!changesPending} onClick={resetPendingChanges} type="button">Reset Changes</button>
            </div>
        </div>
    )
}

export default EditPanel