import React, { Component } from "react";
import { BooksEditField } from "../../../util/enums";
import XImg from "../../../img/x.svg"
import Check2Img from "../../../img/check2.svg"
import PencilSquareImg from "../../../img/pencil-square.svg"

interface EditPanelRowProps {
    editField: BooksEditField,
    tempValue: any,
    updateTempValue(field: BooksEditField, value: any): void,
    valueClick?: (v: string) => void
}

interface EditPanelRowState {
    editMode: boolean,
    fieldValue: any
}

class EditPanelRow extends Component<EditPanelRowProps, EditPanelRowState> {
    constructor(props: EditPanelRowProps) {
        super(props);
        this.state = {
            editMode: false,
            fieldValue: this.props.tempValue
        }
    }

    handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ fieldValue: e.target.value })
    }

    handleTextInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            this.confirmInput()
        }
    }

    confirmInput = () => {
        this.props.updateTempValue(this.props.editField, this.state.fieldValue)
        this.toggleEditMode()
    }

    cancelInput = () => {
        this.setState({ fieldValue: this.props.tempValue })
        this.toggleEditMode()
    }

    toggleEditMode = () => {
        this.setState({ editMode: !this.state.editMode })
    }


    render() {
        return (
            <div className="edit-panel-row">
                <span className="edit-panel-row-label">{this.props.editField.toString()}:</span>
                {
                    this.state.editMode ?
                        <div className="edit-panel-row-inner edit-mode">
                            <div className="edit-panel-row-value">
                                <input type="text"
                                    value={this.state.fieldValue}
                                    onChange={this.handleTextInputChange}
                                    onKeyDown={this.handleTextInputKey}>
                                </input>
                            </div>
                            <div className="edit-panel-row-buttons">
                                <button type="button" onClick={this.confirmInput}>
                                    <img className="svg-icon-pink text-icon" src={Check2Img.toString()} alt="add to slideshow"></img>
                                </button>
                                <button type="button" onClick={this.cancelInput}>
                                    <img className="svg-icon-pink text-icon" src={XImg.toString()} alt="add to slideshow"></img>
                                </button>
                            </div>
                        </div> :
                        <div className="edit-panel-row-inner">
                            <span className="edit-panel-row-value">
                                {
                                    this.props.valueClick && this.props.tempValue.toString() !== '' ?
                                    <span className="click-item clickable" onClick={() => this.props.valueClick!(this.props.tempValue)}>
                                        {this.props.tempValue}
                                    </span>
                                    : this.props.tempValue

                                }
                            </span>
                            <div className="edit-panel-row-buttons">
                                <button type="button" onClick={this.toggleEditMode}>
                                    <img className="svg-icon-pink text-icon" src={PencilSquareImg.toString()} alt="add to slideshow"></img>
                                </button>
                            </div>
                        </div>
                }
            </div>
        )
    }
}

export default EditPanelRow