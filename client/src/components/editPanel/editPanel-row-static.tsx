import React, { Component } from "react";
import { EditField } from "../../util/enums";

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
                                    <img className="svg-icon-pink text-icon" src="http://localhost:9000/data/images/pencil-square.svg"></img>
                                </button>
                            </div>
                        </div>
            </div>
        )
    }
}

export default EditPanelRowStatic