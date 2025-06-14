import React, { Component } from "react";
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

class EditPanelRow<T> extends Component<EditPanelRowProps<T>, EditPanelRowState<T>> {
    constructor(props: EditPanelRowProps<T>) {
        super(props);
        this.state = {
            editMode: false,
            fieldValue: this.props.tempValue
        }
    }

    handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({ fieldValue: this.props.getValueFromDisplayString(e.target.value) })
    }

    handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ fieldValue: this.props.getValueFromDisplayString(e.target.value) })
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
                            {
                                this.props.valueRange ?
                                    <div>
                                        <select className="edit-panel-row-dropdown" onChange={this.handleDropdownChange}>
                                            {
                                                this.props.valueRange.map((v, i) => {
                                                    return (<option key={i} value={this.props.getDisplayString(v)}>{this.props.getDisplayString(v)}</option>)
                                                })
                                            }
                                        </select>
                                    </div>
                                    :
                                    <div>
                                        <div className="edit-panel-row-value">
                                            <input type="text"
                                                value={this.props.getDisplayString(this.state.fieldValue)}
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
                                    </div>

                            }

                        </div> :
                        <div className="edit-panel-row-inner">
                            <span className="edit-panel-row-value">
                                {
                                    this.props.valueClick ?
                                        <span className="click-item clickable" onClick={() => this.props.valueClick!(this.props.getDisplayString(this.props.tempValue))}>
                                            {this.props.getDisplayString(this.props.tempValue)}
                                        </span>
                                        : this.props.getDisplayString(this.props.tempValue)

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