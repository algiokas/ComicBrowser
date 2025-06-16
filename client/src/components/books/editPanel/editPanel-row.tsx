import React, { useState } from "react";
import { BooksEditField } from "../../../util/enums";
import XImg from "../../../img/svg/x.svg"
import Check2Img from "../../../img/svg/check2.svg"
import PencilSquareImg from "../../../img/svg/pencil-square.svg"

interface EditPanelRowProps {
    editField: BooksEditField,
    tempValue: any,
    updateTempValue(field: BooksEditField, value: any): void,
    valueClick?: (v: string) => void
}

const EditPanelRow = (props: EditPanelRowProps) => {
    const [fieldValue, setFieldValue] = useState<any>(props.tempValue)
    const [editMode, setEditMode] = useState<boolean>(false)

    const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(e.target.value)
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
                        <div className="edit-panel-row-value">
                            <input type="text"
                                value={fieldValue}
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
                    </div> :
                    <div className="edit-panel-row-inner">
                        <span className="edit-panel-row-value">
                            {
                                props.valueClick && props.tempValue.toString() !== '' ?
                                    <span className="click-item clickable" onClick={() => props.valueClick!(props.tempValue)}>
                                        {props.tempValue}
                                    </span>
                                    : props.tempValue

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