import React, { Component } from "react";
import PencilSquareImg from "../../../img/svg/pencil-square.svg"

interface EditPanelRowProps {
    label: string,
    value: any,
    valueClick?: (v: string) => void
}

const EditPanelRowStatic = (props: EditPanelRowProps) => {
    return (
        <div className="edit-panel-row">
            <span className="edit-panel-row-label">{props.label}:</span>
            <div className="edit-panel-row-inner">
                <span className="edit-panel-row-value">
                    {
                        props.valueClick ?
                            <span className="click-item clickable" onClick={() => props.valueClick!(props.value)}>
                                {props.value}
                            </span>
                            : props.value

                    }
                </span>
                <div className="edit-panel-row-buttons">
                    <button type="button" style={{ visibility: 'hidden' }}>
                        <img className="svg-icon-pink text-icon" src={PencilSquareImg.toString()} alt="edit value"></img>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditPanelRowStatic