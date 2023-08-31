import React, { Component } from "react";

class EditPanelRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            fieldValue: this.props.tempValue
        }
    }

    handleTextInputChange = (e) => {
        this.setState({ fieldValue: e.target.value })
    }

    handleTextInputKey = (e) => {
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
                                    onKeyDown={this.handleTextInputKey}
                                    ref={this.inputRef}>
                                </input>
                            </div>
                            <div className="edit-panel-row-buttons">
                                <button type="button" onClick={this.confirmInput}>
                                    <img className="svg-icon-pink text-icon" src="http://localhost:9000/data/images/check2.svg" alt="add to slideshow"></img>
                                </button>
                                <button type="button" onClick={this.cancelInput}>
                                    <img className="svg-icon-pink text-icon" src="http://localhost:9000/data/images/x.svg" alt="add to slideshow"></img>
                                </button>
                            </div>
                        </div> :
                        <div className="edit-panel-row-inner">
                            <span className="edit-panel-row-value">
                                {this.props.tempValue}
                            </span>
                            <div className="edit-panel-row-buttons">
                                <button type="button" onClick={this.toggleEditMode}>
                                    <img className="svg-icon-pink text-icon" src="http://localhost:9000/data/images/pencil-square.svg" alt="add to slideshow"></img>
                                </button>
                            </div>
                        </div>
                }
            </div>
        )
    }
}

export default EditPanelRow