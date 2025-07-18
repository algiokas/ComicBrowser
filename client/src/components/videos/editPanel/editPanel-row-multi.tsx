import React, { useEffect, useRef, useState } from "react";
import Check2Img from "../../../img/svg/check2.svg";
import PencilSquareImg from "../../../img/svg/pencil-square.svg";
import PlusImg from "../../../img/svg/plus-symbol.svg";
import XImg from "../../../img/svg/x.svg";
import { VideosEditField } from "../../../util/enums";

interface EditPanelRowProps<T> {
    editField: VideosEditField,
    tempValue: T[],
    valueRange?: T[],
    hideTextInput?: boolean,
    getDisplayString: (x: T | null) => string,
    getValueFromDisplayString: (str: string) => T | null,
    getValueFromTextInput?: (str: string) => T | null,
    updateTempValue(field: VideosEditField, value: any): void,
    valueClick?: (v: string) => void
}

function EditPanelRowMulti<T>(props: EditPanelRowProps<T>) {
    const [editMode, setEditMode] = useState<boolean>(false)
    const [fieldValue, setFieldValue] = useState<T | null>(null)
    const [collection, setCollection] = useState<T[]>(props.tempValue ?? [])

    const mountedRef = useRef(false)
    useEffect(() => {
        if (mountedRef.current) {
            setCollection(props.tempValue ?? [])
            setFieldValue(null)
        } else {
            mountedRef.current = true
        }

    }, [props.tempValue])

    const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = props.getValueFromDisplayString(e.target.value)
        if (selectedValue) {
            setCollection([...collection, selectedValue])
        }
    }

    const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (props.getValueFromTextInput) {
            setFieldValue(props.getValueFromTextInput(e.target.value))
        }
    }

    const handleTextInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addToCollection()
        }
    }

    const addToCollection = () => {
        if (fieldValue) {
            setCollection([...collection, fieldValue])
            setFieldValue(null)
        }
    }

    const confirmInput = () => {
        props.updateTempValue(props.editField, collection)
        toggleEditMode()
    }

    const cancelInput = () => {
        setCollection(props.tempValue ?? [])
        setFieldValue(null)
        toggleEditMode()
    }

    const toggleEditMode = () => {
        setEditMode(!editMode)
    }

    const removeFromCollection = (index: number) => {
        console.log('remove item at index ' + index)
        if (collection.length > 0) {
            setCollection(collection.filter((_, i) => i !== index))
        }
    }

    return (
        <div className="edit-panel-row multi-row">
            <span className="edit-panel-row-label">{props.editField.toString()}</span>
            {
                editMode ?
                    <div className="edit-panel-row-inner edit-mode">
                        <div className="edit-panel-row-value">
                            {
                                props.valueRange ?
                                    <select className="edit-panel-row-dropdown" onChange={handleDropdownChange} id={`${props.editField.toString().toLowerCase()}-dropdown`} >
                                        <option value=''>{`-- Select ${props.editField} --`}</option>
                                        {
                                            props.valueRange.map((v, i) => {
                                                if (!collection.some(item => props.getDisplayString(item) === props.getDisplayString(v))) {
                                                    return (<option key={i} value={props.getDisplayString(v)}>{props.getDisplayString(v)}</option>)
                                                }
                                            })
                                        }
                                    </select>
                                    : null
                            }
                            {
                                props.getValueFromTextInput ?
                                    <div className="edit-panel-row-value-add">
                                        <input type="text" id={`${props.editField.toString().toLowerCase()}-text-input`} 
                                            value={props.getDisplayString(fieldValue)}
                                            onChange={handleTextInputChange}
                                            onKeyDown={handleTextInputKey}>
                                        </input>
                                        <button type="button" onClick={addToCollection}>
                                            <img className="svg-icon text-icon" src={PlusImg.toString()} alt="remove collection item"></img>
                                        </button>
                                    </div>
                                    : null
                            }
                            <div className="edit-panel-row-collection">
                                {
                                    collection ?
                                        collection.map((item, i) => {
                                            return <div className="edit-panel-row-collection-item" key={i}>
                                                <span className="item-value">
                                                    {props.getDisplayString(item)}
                                                </span>
                                                <span className="remove-button" onClick={() => removeFromCollection(i)} >
                                                    <img className="svg-icon text-icon" src={XImg.toString()} alt="remove collection item"></img>
                                                </span>
                                            </div>
                                        }) : null
                                }
                            </div>
                        </div>
                        <div className="edit-panel-row-buttons">
                            <button type="button" onClick={confirmInput}>
                                <img className="svg-icon-pink text-icon" src={Check2Img.toString()} alt="confirm"></img>
                            </button>
                            <button type="button" onClick={cancelInput}>
                                <img className="svg-icon-pink text-icon" src={XImg.toString()} alt="cancel"></img>
                            </button>
                        </div>

                    </div>
                    :
                    <div className="edit-panel-row-inner">
                        <div className="edit-panel-row-value ">
                            {
                                props.valueClick ?
                                    <div className="click-items">
                                        {
                                            collection.map((item, i) => {
                                                return <span className="click-item clickable" onClick={() => props.valueClick!(props.getDisplayString(item))} key={i}>
                                                    {props.getDisplayString(item)}
                                                </span>
                                            })
                                        }
                                    </div>
                                    :
                                    collection.map((item, i) => {
                                        return <span key={i}>
                                            {
                                                i + 1 < collection.length ?
                                                    props.getDisplayString(item) + ", " :
                                                    props.getDisplayString(item)
                                            }
                                        </span>
                                    })
                            }
                        </div>
                        <div className="edit-panel-row-buttons">
                            <button type="button" onClick={toggleEditMode}>
                                <img className="svg-icon-pink text-icon" src={PencilSquareImg.toString()} alt="edit value"></img>
                            </button>
                        </div>
                    </div>

            }
        </div>
    )
}

export default EditPanelRowMulti