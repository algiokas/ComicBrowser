import React, { Component } from "react";
import { scalarArrayCompare } from "../../../util/helpers";
import { EditField } from "../../../util/enums";
import XImg from "../../../img/x.svg"
import PlusImg from "../../../img/plus-symbol.svg"
import Check2Img from "../../../img/check2.svg"
import PencilSquareImg from "../../../img/pencil-square.svg"

interface EditPanelRowProps {
    editField: EditField,
    tempValue: any[],
    hideTextInput?: boolean,
    updateTempValue(field: EditField, value: any): void,
    valueClick?: (v: string) => void
}

interface EditPanelRowState {
    editMode: boolean,
    fieldValue: string,
    collection: any[]
}

class EditPanelRowMulti extends Component<EditPanelRowProps, EditPanelRowState> {
    constructor(props: EditPanelRowProps) {
        super(props);
        this.state = {
            editMode: false,
            fieldValue: '',
            collection: this.props.tempValue ?? []
        }
    }

    componentDidUpdate(prevProps: EditPanelRowProps) {
        if (!scalarArrayCompare(prevProps.tempValue, this.props.tempValue)) {
            this.setState({
                collection: this.props.tempValue ?? [],
                fieldValue: ''
            })
        }
    }

    handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ fieldValue: e.target.value })
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
                                        <div className="edit-panel-row-value-add">
                                            <input type="text"
                                                value={this.state.fieldValue}
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
                                                    {item}
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
                                                return <span className="click-item clickable" onClick={() => this.props.valueClick!(item)} key={i}>
                                                    {item}
                                                </span>
                                            })
                                        }
                                    </div>
                                    :
                                    this.state.collection.map((item, i) => {
                                        return <span key={i}>
                                            {
                                                i + 1 < this.state.collection.length ?
                                                    item + ", " :
                                                    item
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