import React, { Component } from "react";
import { scalarArrayCompare } from "./../util/helpers";

class EditPanelRowMulti extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            fieldValue: '',
            collection: this.props.tempValue ?? []
        }
        this.hideTextInput = this.props.hideTextInput ?? false
    }

    componentDidUpdate(prevProps) {
        if (!scalarArrayCompare(prevProps.tempValue, this.props.tempValue)) {
            this.setState({
                collection: this.props.tempValue ?? [],
                fieldValue: ''
            })
        }
    }

    handleTextInputChange = (e) => {
        this.setState({ fieldValue: e.target.value })
    }

    handleTextInputKey = (e) => {
        if (e.key === 'Enter') {
            this.addToCollection()
        }
    }

    addToCollection = () => {
        if (this.state.fieldValue) {
            this.setState({
                collection: [...this.state.collection, this.state.fieldValue],
                fieldValue: ''
            })
        }
    }

    confirmInput = () => {
        this.props.updateTempValue(this.props.editField, this.state.collection)
        this.toggleEditMode()
    }

    cancelInput = () => {
        this.setState({
            collection: this.props.tempValue ?? [],
            fieldValue: ''
        })
        this.toggleEditMode()
    }

    toggleEditMode = () => {
        this.setState({ editMode: !this.state.editMode })
    }

    removeFromCollection = (index) => {
        console.log('remove item at index ' + index)
        if (this.state.collection.length > 0) {
            this.setState({ collection: this.state.collection.filter((_, i) => i !== index) })
        }
    }


    render() {
        return (
            <div className="edit-panel-row multi-row">
                <span className="edit-panel-row-label">{this.props.editField.toString()}</span>
                {
                    this.state.editMode ?
                        <div className="edit-panel-row-inner edit-mode">
                            <div className="edit-panel-row-value">
                                {
                                    this.hideTextInput ? null :
                                        <div className="edit-panel-row-value-add">
                                            <input type="text"
                                                value={this.state.fieldValue}
                                                onChange={this.handleTextInputChange}
                                                onKeyDown={this.handleTextInputKey}
                                                ref={this.inputRef}>
                                            </input>
                                            <button type="button" onClick={this.addToCollection}>
                                                <img className="svg-icon text-icon" src="http://localhost:9000/data/images/plus-symbol.svg" alt="remove collection item"></img>
                                            </button>
                                        </div>
                                }
                                <div className="edit-panel-row-collection">
                                    {
                                        this.state.collection ? 
                                        this.state.collection.map((item, i) => {
                                            return <div className="edit-panel-row-collection-item" key={i}>
                                                <span className="item-value">
                                                    {item}
                                                </span>
                                                <span className="remove-button" onClick={() => this.removeFromCollection(i)} >
                                                    <img className="svg-icon text-icon" src="http://localhost:9000/data/images/x.svg" alt="remove collection item"></img>
                                                </span>
                                            </div>
                                        }) : null
                                    }
                                </div>
                            </div>
                            <div className="edit-panel-row-buttons">
                                <button type="button" onClick={this.confirmInput}>
                                    <img className="svg-icon-pink text-icon" src="http://localhost:9000/data/images/check2.svg" alt="confirm"></img>
                                </button>
                                <button type="button" onClick={this.cancelInput}>
                                    <img className="svg-icon-pink text-icon" src="http://localhost:9000/data/images/x.svg" alt="cancel"></img>
                                </button>
                            </div>

                        </div>
                        :
                        <div className="edit-panel-row-inner">
                            <div className="edit-panel-row-value ">
                                {
                                    this.state.collection ? 
                                    this.state.collection.map((item, i) => {
                                        return <span key={i}>
                                            {
                                                i + 1 < this.state.collection.length ?
                                                    item + ", " :
                                                    item
                                            }
                                        </span>
                                    }) : null
                                }
                            </div>
                            <div className="edit-panel-row-buttons">
                                <button type="button" onClick={this.toggleEditMode}>
                                    <img className="svg-icon-pink text-icon" src="http://localhost:9000/data/images/pencil-square.svg" alt="edit value"></img>
                                </button>
                            </div>
                        </div>

                }
            </div>
        )
    }
}

export default EditPanelRowMulti