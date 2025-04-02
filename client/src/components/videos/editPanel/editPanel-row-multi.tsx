import React, { Component } from "react";
import { scalarArrayCompare } from "../../../util/helpers";
import { VideosEditField } from "../../../util/enums";
import XImg from "../../../img/x.svg"
import PlusImg from "../../../img/plus-symbol.svg"
import Check2Img from "../../../img/check2.svg"
import PencilSquareImg from "../../../img/pencil-square.svg"

interface EditPanelRowProps<T> {
    editField: VideosEditField,
    tempValue: T[],
    valueRange?: T[],
    hideTextInput?: boolean,
    getDisplayString: (x: T | null) => string,
    getValueFromDisplayString: (str: string) => T | null,
    updateTempValue(field: VideosEditField, value: any): void,
    valueClick?: (v: string) => void
}

interface EditPanelRowState<T> {
    editMode: boolean,
    fieldValue: T | null,
    collection: T[]
}

class EditPanelRowMulti<T> extends Component<EditPanelRowProps<T>, EditPanelRowState<T>> {
    constructor(props: EditPanelRowProps<T>) {
        super(props);
        this.state = {
            editMode: false,
            fieldValue: null,
            collection: this.props.tempValue ?? []
        }
    }

    componentDidUpdate(prevProps: EditPanelRowProps<T>) {
        if (!scalarArrayCompare(prevProps.tempValue, this.props.tempValue)) {
            this.setState({
                collection: this.props.tempValue ?? [],
                fieldValue: null
            })
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
            this.addToCollection()
        }
    }

    addToCollection = () => {
        if (this.state.fieldValue) {
            this.setState({
                collection: [...this.state.collection, this.state.fieldValue],
                fieldValue: null
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
            fieldValue: null
        })
        this.toggleEditMode()
    }

    toggleEditMode = () => {
        this.setState({ editMode: !this.state.editMode })
    }

    removeFromCollection = (index: number) => {
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
                                    this.props.hideTextInput ? null :

                                    this.props.valueRange ?
                                    <div>
                                        <select className="edit-panel-row-dropdown" onChange={this.handleDropdownChange}>
                                            {
                                                this.props.valueRange.map((v, i) => {
                                                    return (<option key={i} value={this.props.getDisplayString(v)}>{this.props.getDisplayString(v)}</option>)
                                                })
                                            }
                                        </select>
                                        <button type="button" onClick={this.addToCollection}>
                                            <img className="svg-icon text-icon" src={PlusImg.toString()} alt="remove collection item"></img>
                                        </button>
                                    </div>
                                    :
                                    <div className="edit-panel-row-value-add">
                                    <input type="text"
                                        value={this.props.getDisplayString(this.state.fieldValue)}
                                        onChange={this.handleTextInputChange}
                                        onKeyDown={this.handleTextInputKey}>
                                    </input>
                                    <button type="button" onClick={this.addToCollection}>
                                        <img className="svg-icon text-icon" src={PlusImg.toString()} alt="remove collection item"></img>
                                    </button>
                                </div>

                                }
                                <div className="edit-panel-row-collection">
                                    {
                                        this.state.collection ? 
                                        this.state.collection.map((item, i) => {
                                            return <div className="edit-panel-row-collection-item" key={i}>
                                                <span className="item-value">
                                                    {this.props.getDisplayString(item)}
                                                </span>
                                                <span className="remove-button" onClick={() => this.removeFromCollection(i)} >
                                                    <img className="svg-icon text-icon" src={XImg.toString()} alt="remove collection item"></img>
                                                </span>
                                            </div>
                                        }) : null
                                    }
                                </div>
                            </div>
                            <div className="edit-panel-row-buttons">
                                <button type="button" onClick={this.confirmInput}>
                                    <img className="svg-icon-pink text-icon" src={Check2Img.toString()} alt="confirm"></img>
                                </button>
                                <button type="button" onClick={this.cancelInput}>
                                    <img className="svg-icon-pink text-icon" src={XImg.toString()} alt="cancel"></img>
                                </button>
                            </div>

                        </div>
                        :
                        <div className="edit-panel-row-inner">
                            <div className="edit-panel-row-value ">
                                {
                                    this.props.valueClick ? 
                                    <div className="click-items">
                                        {
                                            this.state.collection.map((item, i) => {
                                                return <span className="click-item clickable" onClick={() => this.props.valueClick!(this.props.getDisplayString(item))} key={i}>
                                                    {this.props.getDisplayString(item)}
                                                </span>
                                            })
                                        }
                                    </div>
                                    :
                                    this.state.collection.map((item, i) => {
                                        return <span key={i}>
                                            {
                                                i + 1 < this.state.collection.length ?
                                                    this.props.getDisplayString(item) + ", " :
                                                    this.props.getDisplayString(item)
                                            }
                                        </span>
                                    })
                                }
                            </div>
                            <div className="edit-panel-row-buttons">
                                <button type="button" onClick={this.toggleEditMode}>
                                    <img className="svg-icon-pink text-icon" src={PencilSquareImg.toString()} alt="edit value"></img>
                                </button>
                            </div>
                        </div>

                }
            </div>
        )
    }
}

export default EditPanelRowMulti