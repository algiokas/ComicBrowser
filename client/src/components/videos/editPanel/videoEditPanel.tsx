import { useContext, useState } from "react";
import type IActor from "../../../interfaces/actor";
import type IVideo from "../../../interfaces/video";
import type IVideoSource from "../../../interfaces/videoSource";
import { VideosEditField } from "../../../util/enums";
import EditPanelRow from "./editPanel-row";
import EditPanelRowMulti from "./editPanel-row-multi";
import EditPanelRowStatic from "./editPanel-row-static";
import { VideosAppContext } from "../videosAppContext";
import type { IVideoTag } from "../../../interfaces/video";

interface VideoEditPanelProps {
    video: IVideo,
    toggleDisplay(): void

    searchActor(a: string): void,
    searchSource(s: string): void,
    searchTag(t: string): void
}

interface VideoEditFields {
    title: string,
    actors: IActor[],
    tags: IVideoTag[],
    source: IVideoSource
}

const VideoEditPanel = (props: VideoEditPanelProps) => {
    const appContext = useContext(VideosAppContext)
    const [tempFields, setTempFields] = useState<VideoEditFields>({
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

    const checkPendingChanges = (tempFields: VideoEditFields) => {
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
        let fieldValues = { ...tempFields }
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

        appContext.updateVideo(tempVideo)
        props.toggleDisplay()
    }

    const deleteVideo = () => {
        appContext.deleteVideo(props.video.id)
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
                    valueRange={appContext.allActors.sort((a, b) => a.name.localeCompare(b.name))}
                    valueClick={props.searchActor}
                    getDisplayString={(a) => a?.name ?? ''}
                    getValueFromDisplayString={(str) => { return appContext.allActors.find((a) => a.name == str) ?? null }} />
                <EditPanelRowMulti<IVideoTag> editField={VideosEditField.Tags}
                    tempValue={tempFields.tags}
                    updateTempValue={updateTempValue}
                    valueRange={appContext.allVideoTags.sort((a, b) => a.name.localeCompare(b.name))}
                    valueClick={props.searchTag}
                    getDisplayString={(t) => t?.name ?? ''}
                    getValueFromDisplayString={(str) => { return appContext.allVideoTags.find((t) => t.name == str) ?? null }}
                    getValueFromTextInput={(str) => { return { id: -1, name: str }}}
                    />
                <EditPanelRow<IVideoSource> editField={VideosEditField.Source}
                    tempValue={tempFields.source}
                    updateTempValue={updateTempValue}
                    valueRange={appContext.allSources.sort((a, b) => a.name.localeCompare(b.name))}
                    valueClick={props.searchSource}
                    getDisplayString={(source) => source.name}
                    getValueFromDisplayString={(sName) => appContext.allSources.find((s) => s.name == sName)!} />
            </div>
            <div className="edit-panel-controls">
                <button className="delete-button" onClick={deleteVideo} type="button">DELETE VIDEO</button>
                <button disabled={!changesPending} onClick={saveVideoChanges} type="button">Confirm Changes</button>
                <button disabled={!changesPending} onClick={resetPendingChanges} type="button">Reset Changes</button>
            </div>
        </div>
    )
}

export default VideoEditPanel