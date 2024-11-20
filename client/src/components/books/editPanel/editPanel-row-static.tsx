import React, { Component } from "react";
import PencilSquareImg from "../../../img/pencil-square.svg"

interface EditPanelRowProps {
    label: string,
    value: any,
    valueClick?: (v: string) => void
}

interface EditPanelRowState {
}

class EditPanelRowStatic extends Component<EditPanelRowProps, EditPanelRowState> {
    render() {
        return (
            <div className="edit-panel-row">
                <span className="edit-panel-row-label">{this.props.label}:</span>
                <div className="edit-panel-row-inner">
                            <span className="edit-panel-row-value">
                                {
                                    this.props.valueClick ?
                                    <span className="click-item clickable" onClick={() => this.props.valueClick!(this.props.value)}>
                                        {this.props.value}
                                    </span>
                                    : this.props.value

                                }
                            </span>
                            <div className="edit-panel-row-buttons">
                                <button type="button" style={{visibility: 'hidden'}}>
                                    <img className="svg-icon-pink text-icon" src={PencilSquareImg.toString()} alt="edit value"></img>
                                </button>
                            </div>
                        </div>
            </div>
        )
    }
}

export default EditPanelRowStatic