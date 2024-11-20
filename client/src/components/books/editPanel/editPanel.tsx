import React, { Component } from "react";
import EditPanelRow from "./editPanel-row";
import EditPanelRowMulti from "./editPanel-row-multi";
import { EditField } from "../../../util/enums";
import IBook from "../../../interfaces/book";
import EditPanelRowStatic from "./editPanel-row-static";

interface EditPanelProps {
    book: IBook,
    updateBook(book: IBook): void,
    deleteBook(bookId: number): void,
    toggleDisplay(): void

    searchGroup(g: string): void,
    searchArtist(a: string): void,
    searchPrefix(p: string): void,
    searchTag(t: string): void
}

interface EditFields {
    title: string,
    group: string,
    artists: string[],
    tags: string[],
    prefix: string,
    hiddenPages: number[]
}

interface EditPanelState {
    tempFields: EditFields,
    artistToAdd: string,
    tagToAdd: string,
    changesPending: boolean
}

class EditPanel extends Component<EditPanelProps, EditPanelState> {
    constructor(props: EditPanelProps) {
        super(props);

        this.state = {
            tempFields: {
                title: this.props.book.title,
                group: this.props.book.artGroup,
                artists: this.props.book.artists,
                tags: this.props.book.tags,
                prefix: this.props.book.prefix,
                hiddenPages: this.props.book.hiddenPages,
            },
            artistToAdd: '',
            tagToAdd: '',
            changesPending: false
        }
    }

    arrayChangesPending = (temp: any[], original: any[]) => {
        if (temp.length !== original.length) return true;
        if (temp.length > 0) {
            for (let i = 0; i < temp.length; i++) {
                if (!original.includes(temp[i])) return true;
            }
        }
        return false;
    }

    checkPendingChanges = (tempFields: EditFields) => {
        if (tempFields.title !== this.props.book.title) return true;
        if (tempFields.group !== this.props.book.artGroup) return true;

        if (this.arrayChangesPending(tempFields.artists, this.props.book.artists)) return true;
        if (this.arrayChangesPending(tempFields.tags, this.props.book.tags)) return true;
        if (this.arrayChangesPending(tempFields.hiddenPages, this.props.book.hiddenPages)) return true;

        return false;
    }

    resetPendingChanges = () => {
        this.setState({
            tempFields: {
                title: this.props.book.title,
                group: this.props.book.artGroup,
                artists: this.props.book.artists,
                tags: this.props.book.tags,
                prefix: this.props.book.prefix,
                hiddenPages: this.props.book.hiddenPages,
            },
            changesPending: false
        })
    }

    updateTempValue = (field: EditField, value: any) => {
        let fieldValues = this.state.tempFields
        switch (field) {
            case EditField.Title:
                fieldValues.title = value
                break
            case EditField.Group:
                fieldValues.group = value
                break
            case EditField.Artists:
                fieldValues.artists = value
                break
            case EditField.Tags:
                fieldValues.tags = value
                break
            case EditField.Prefix:
                fieldValues.prefix = value
                break
            case EditField.HiddenPages:
                fieldValues.hiddenPages = value
                break
            default:
                console.log('invalid edit field')
        }
        this.setState({
            tempFields: fieldValues,
            changesPending: this.checkPendingChanges(fieldValues)
        })
    }

    saveBookChanges = () => {
        console.log("saving changes to: " + this.props.book.title + " (ID: " + this.props.book.id + ")")

        let tempBook = this.props.book

        tempBook.title = this.state.tempFields.title
        tempBook.artGroup = this.state.tempFields.group
        tempBook.artists = this.state.tempFields.artists
        tempBook.tags = this.state.tempFields.tags
        tempBook.hiddenPages = this.state.tempFields.hiddenPages

        console.log(tempBook)

        this.props.updateBook(tempBook)
        this.props.toggleDisplay()
    }

    deleteBook = () => {
        this.props.deleteBook(this.props.book.id)
    }

    render() {
        return (
            <div className="edit-panel">
                <h3>Edit Book</h3>
                <h4>{"ID: " + this.props.book.id}</h4>
                <div className="edit-panel-inner">
                    <EditPanelRowStatic label={"Original Title"}
                        value={this.props.book.originalTitle}/>
                    <EditPanelRow editField={EditField.Title}
                        tempValue={this.state.tempFields.title}
                        updateTempValue={this.updateTempValue}/>
                    <EditPanelRow editField={EditField.Group}
                        tempValue={this.state.tempFields.group}
                        updateTempValue={this.updateTempValue}
                        valueClick={this.props.searchGroup}/>
                    <EditPanelRowMulti editField={EditField.Artists}
                        tempValue={this.state.tempFields.artists}
                        updateTempValue={this.updateTempValue}
                        valueClick={this.props.searchArtist}/>
                    <EditPanelRowMulti editField={EditField.Tags}
                        tempValue={this.state.tempFields.tags}
                        updateTempValue={this.updateTempValue}
                        valueClick={this.props.searchTag}/>
                    <EditPanelRow editField={EditField.Prefix}
                        tempValue={this.state.tempFields.prefix}
                        updateTempValue={this.updateTempValue}
                        valueClick={this.props.searchPrefix}
                    ></EditPanelRow>
                    <EditPanelRowMulti editField={EditField.HiddenPages}
                        tempValue={this.state.tempFields.hiddenPages}
                        updateTempValue={this.updateTempValue}
                        hideTextInput={true}/>
                </div>
                <div className="edit-panel-controls">
                    <button className="delete-button" onClick={this.deleteBook} type="button">DELETE BOOK</button>
                    <button disabled={!this.state.changesPending} onClick={this.saveBookChanges} type="button">Confirm Changes</button>
                    <button disabled={!this.state.changesPending} onClick={this.resetPendingChanges} type="button">Reset Changes</button>
                </div>
            </div>
        )
    }
}

export default EditPanel