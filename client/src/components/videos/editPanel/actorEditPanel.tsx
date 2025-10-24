import { useContext, useState } from "react"
import EditPanelRow from "./editPanel-row"
import EditPanelRowMulti from "./editPanel-row-multi"
import { VideosAppContext } from "../videosAppContext"
import { ActorsEditField } from "../../../util/enums"
import type { Actor } from "../../../types/actor"
import type { ActorTag } from "../../../types/tags"


interface ActorEditPanelProps {
    actor: Actor,
    toggleDisplay(): void
}

interface ActorEditFields {
    name: string,
    birthYear: number,
    tags: ActorTag[],
}

const ActorEditPanel = (props: ActorEditPanelProps) => {
    const appContext = useContext(VideosAppContext)
    const [tempFields, setTempFields] = useState<ActorEditFields>({
        name: props.actor.name,
        birthYear: props.actor.birthYear,
        tags: props.actor.tags,
    })
    const [changesPending, setChangesPending] = useState<boolean>(false)

    const arrayChangesPending = (temp: any[], original: any[]) => {
        if (!temp && original) return true;
        if (temp && !original) return true;
        if (!temp && !original) return false;
        if (temp.length !== original.length) return true;
        if (temp.length > 0) {
            for (let i = 0; i < temp.length; i++) {
                if (!original.includes(temp[i])) return true;
            }
        }
        return false;
    }

    const checkPendingChanges = (tempFields: ActorEditFields) => {
        if (tempFields.name !== props.actor.name) return true;
        if (tempFields.birthYear !== props.actor.birthYear) return true;
        if (arrayChangesPending(tempFields.tags, props.actor.tags)) return true;

        return false;
    }

    const resetPendingChanges = () => {
        setTempFields({
            name: props.actor.name,
            birthYear: props.actor.birthYear,
            tags: props.actor.tags,
        })
        setChangesPending(false)
    }

    const updateTempValue = (field: ActorsEditField, value: any) => {
        let fieldValues = { ...tempFields }
        switch (field) {
            case ActorsEditField.Name:
                fieldValues.name = value
                break
            case ActorsEditField.BirthYear:
                fieldValues.birthYear = value
                break
            case ActorsEditField.Tags:
                fieldValues.tags = value
                break
            default:
                console.log('invalid edit field')
        }
        setTempFields(fieldValues)
        setChangesPending(checkPendingChanges(fieldValues))
    }

    const saveActorChanges = () => {
        console.log("saving changes to: " + props.actor.name + " (ID: " + props.actor.id + ")")

        let tempActor = props.actor

        tempActor.name = tempFields.name
        tempActor.birthYear = tempFields.birthYear
        tempActor.tags = tempFields.tags

        appContext.updateActor(tempActor)
        props.toggleDisplay()
    }

    return (
        <div className="edit-panel">
            <h3>Edit Actor</h3>
            <h4>{"ID: " + props.actor.id}</h4>
            <div className="edit-panel-inner">
                <EditPanelRow<string> editField={ActorsEditField.Name}
                    tempValue={tempFields.name}
                    getDisplayString={(s) => s}
                    getValueFromDisplayString={(s) => s}
                    updateTempValue={updateTempValue} />
                <EditPanelRow<number> editField={ActorsEditField.BirthYear}
                    tempValue={tempFields.birthYear}
                    getDisplayString={(s) => s.toString()}
                    getValueFromDisplayString={(s) => Number(s)}
                    updateTempValue={updateTempValue} />
                <EditPanelRowMulti<ActorTag> editField={ActorsEditField.Tags}
                    tempValue={tempFields.tags}
                    updateTempValue={updateTempValue}
                    valueRange={appContext.allActorTags.sort((a, b) => a.name.localeCompare(b.name))}
                    getDisplayString={(t) => t?.name ?? ''}
                    getValueFromDisplayString={(str) => { return appContext.allActorTags.find((t) => t.name == str) ?? null }}
                    getValueFromTextInput={(str) => { return { id: -1, name: str, tagType: 'actor' } }}
                />
            </div>
            <div className="edit-panel-controls">
                <button disabled={!changesPending} onClick={saveActorChanges} type="button">Confirm Changes</button>
                <button disabled={!changesPending} onClick={resetPendingChanges} type="button">Reset Changes</button>
            </div>
        </div>
    )
}

export default ActorEditPanel