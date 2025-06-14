import React, { Component, useState } from "react";
import { VideosEditField } from "../../../util/enums";
import XImg from "../../../img/svg/x.svg"
import Check2Img from "../../../img/svg/check2.svg"
import PencilSquareImg from "../../../img/svg/pencil-square.svg"

interface EditPanelRowProps<T> {
    editField: VideosEditField,
    tempValue: T,
    valueRange?: T[],
    getDisplayString: (x: T) => string,
    getValueFromDisplayString: (str: string) => T,
    updateTempValue(field: VideosEditField, value: any): void,
    valueClick?: (v: string) => void
}

interface EditPanelRowState<T> {
    editMode: boolean,
    fieldValue: T
}

function EditPanelRow<T>(props: EditPanelRowProps<T>) {
    const [editMode, setEditMode] = useState<boolean>(false)
    const [fieldValue, setFieldValue] = useState<T>(props.tempValue)

    const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFieldValue(props.getValueFromDisplayString(e.target.value))
    }

    const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(props.getValueFromDisplayString(e.target.value))
    }

    const handleTextInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            confirmInput()
        }
    }

    const confirmInput = () => {
        props.updateTempValue(props.editField, fieldValue)
        toggleEditMode()
    }

    const cancelInput = () => {
        setFieldValue(props.tempValue)
        toggleEditMode()
    }

    const toggleEditMode = () => {
        setEditMode(!editMode)
    }

    return (
        <div className="edit-panel-row">
            <span className="edit-panel-row-label">{props.editField.toString()}:</span>
            {
                editMode ?
                    <div className="edit-panel-row-inner edit-mode">
                        {
                            props.valueRange ?
                                <div>
                                    <select className="edit-panel-row-dropdown" onChange={handleDropdownChange}>
                                        {
                                            props.valueRange.map((v, i) => {
                                                return (<option key={i} value={props.getDisplayString(v)}>{props.getDisplayString(v)}</option>)
                                            })
                                        }
                                    </select>
                                </div>
                                :
                                <div>
                                    <div className="edit-panel-row-value">
                                        <input type="text"
                                            value={props.getDisplayString(fieldValue)}
                                            onChange={handleTextInputChange}
                                            onKeyDown={handleTextInputKey}>
                                        </input>
                                    </div>
                                    <div className="edit-panel-row-buttons">
                                        <button type="button" onClick={confirmInput}>
                                            <img className="svg-icon-pink text-icon" src={Check2Img.toString()} alt="add to slideshow"></img>
                                        </button>
                                        <button type="button" onClick={cancelInput}>
                                            <img className="svg-icon-pink text-icon" src={XImg.toString()} alt="add to slideshow"></img>
                                        </button>
                                    </div>
                                </div>

                        }

                    </div> :
                    <div className="edit-panel-row-inner">
                        <span className="edit-panel-row-value">
                            {
                                props.valueClick ?
                                    <span className="click-item clickable" onClick={() => props.valueClick!(props.getDisplayString(props.tempValue))}>
                                        {props.getDisplayString(props.tempValue)}
                                    </span>
                                    : props.getDisplayString(props.tempValue)

                            }
                        </span>
                        <div className="edit-panel-row-buttons">
                            <button type="button" onClick={toggleEditMode}>
                                <img className="svg-icon-pink text-icon" src={PencilSquareImg.toString()} alt="add to slideshow"></img>
                            </button>
                        </div>
                    </div>
            }
        </div>
    )
}

export default EditPanelRow