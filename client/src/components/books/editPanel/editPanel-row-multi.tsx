import React, { useEffect, useRef, useState } from "react";
import { BooksEditField } from "../../../util/enums";
import XImg from "../../../img/svg/x.svg"
import PlusImg from "../../../img/svg/plus-symbol.svg"
import Check2Img from "../../../img/svg/check2.svg"
import PencilSquareImg from "../../../img/svg/pencil-square.svg"

interface EditPanelRowProps {
    editField: BooksEditField,
    tempValue: any[],
    hideTextInput?: boolean,
    updateTempValue(field: BooksEditField, value: any): void,
    valueClick?: (v: string) => void
}

const EditPanelRowMulti = (props: EditPanelRowProps) => {
    const [collection, setCollection] = useState<any[]>(props.tempValue ?? [])
    const [fieldValue, setFieldValue] = useState<string>('')
    const [editMode, setEditMode] = useState<boolean>(false)

    const mountedRef = useRef(false)
    useEffect(() => {
        if (mountedRef.current) {
            setCollection(props.tempValue ?? [])
            setFieldValue('')
        } else {
            mountedRef.current = true
        }

    }, [props.tempValue])

    const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(e.target.value)
    }

    const handleTextInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addToCollection()
        }
    }

    const addToCollection = () => {
        if (fieldValue) {
            setCollection([...collection, fieldValue])
            setFieldValue('')
        }
    }

    const confirmInput = () => {
        props.updateTempValue(props.editField, collection)
        toggleEditMode()
    }

    const cancelInput = () => {
        setCollection(props.tempValue ?? [])
        setFieldValue('')
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
                                props.hideTextInput ? null :
                                    <div className="edit-panel-row-value-add">
                                        <input type="text"
                                            value={fieldValue}
                                            onChange={handleTextInputChange}
                                            onKeyDown={handleTextInputKey}>
                                        </input>
                                        <button type="button" onClick={addToCollection}>
                                            <img className="svg-icon text-icon" src={PlusImg.toString()} alt="remove collection item"></img>
                                        </button>
                                    </div>
                            }
                            <div className="edit-panel-row-collection">
                                {
                                    collection ?
                                        collection.map((item, i) => {
                                            return <div className="edit-panel-row-collection-item" key={i}>
                                                <span className="item-value">
                                                    {item}
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
                                                return <span className="click-item clickable" onClick={() => props.valueClick!(item)} key={i}>
                                                    {item}
                                                </span>
                                            })
                                        }
                                    </div>
                                    :
                                    collection.map((item, i) => {
                                        return <span key={i}>
                                            {
                                                i + 1 < collection.length ?
                                                    item + ", " :
                                                    item
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