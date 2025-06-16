import { useState } from "react";
import IBook from "../../../interfaces/book";
import { BooksEditField } from "../../../util/enums";
import EditPanelRow from "./editPanel-row";
import EditPanelRowMulti from "./editPanel-row-multi";
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

const EditPanel = (props: EditPanelProps) => {
    const [tempFields, setTempFields] = useState<EditFields>({
        title: props.book.title,
        group: props.book.artGroup,
        artists: props.book.artists,
        tags: props.book.tags,
        prefix: props.book.prefix,
        hiddenPages: props.book.hiddenPages,
    })
    const [changesPending, setChangesPending] = useState<boolean>(false)

    const arrayChangesPending = (temp: any[], original: any[]) => {
        if (temp.length !== original.length) return true;
        if (temp.length > 0) {
            for (let i = 0; i < temp.length; i++) {
                if (!original.includes(temp[i])) return true;
            }
        }
        return false;
    }

    const checkPendingChanges = (tempFields: EditFields) => {
        if (tempFields.title !== props.book.title) return true;
        if (tempFields.group !== props.book.artGroup) return true;

        if (arrayChangesPending(tempFields.artists, props.book.artists)) return true;
        if (arrayChangesPending(tempFields.tags, props.book.tags)) return true;
        if (arrayChangesPending(tempFields.hiddenPages, props.book.hiddenPages)) return true;

        return false;
    }

    const resetPendingChanges = () => {
        setTempFields({
            title: props.book.title,
            group: props.book.artGroup,
            artists: props.book.artists,
            tags: props.book.tags,
            prefix: props.book.prefix,
            hiddenPages: props.book.hiddenPages,
        })
        setChangesPending(false)
    }

    const updateTempValue = (field: BooksEditField, value: any) => {
        let fieldValues = tempFields
        switch (field) {
            case BooksEditField.Title:
                fieldValues.title = value
                break
            case BooksEditField.Group:
                fieldValues.group = value
                break
            case BooksEditField.Artists:
                fieldValues.artists = value
                break
            case BooksEditField.Tags:
                fieldValues.tags = value
                break
            case BooksEditField.Prefix:
                fieldValues.prefix = value
                break
            case BooksEditField.HiddenPages:
                fieldValues.hiddenPages = value
                break
            default:
                console.log('invalid edit field')
        }
        setTempFields(fieldValues)
        setChangesPending(checkPendingChanges(fieldValues))
    }

    const saveBookChanges = () => {
        console.log("saving changes to: " + props.book.title + " (ID: " + props.book.id + ")")

        let tempBook = props.book

        tempBook.title = tempFields.title
        tempBook.artGroup = tempFields.group
        tempBook.artists = tempFields.artists
        tempBook.tags = tempFields.tags
        tempBook.hiddenPages = tempFields.hiddenPages

        console.log(tempBook)

        props.updateBook(tempBook)
        props.toggleDisplay()
    }

    const deleteBook = () => {
        props.deleteBook(props.book.id)
    }

    return (
        <div className="edit-panel">
            <h3>Edit Book</h3>
            <h4>{"ID: " + props.book.id}</h4>
            <div className="edit-panel-inner">
                <EditPanelRowStatic label={"Original Title"}
                    value={props.book.originalTitle} />
                <EditPanelRow editField={BooksEditField.Title}
                    tempValue={tempFields.title}
                    updateTempValue={updateTempValue} />
                <EditPanelRow editField={BooksEditField.Group}
                    tempValue={tempFields.group}
                    updateTempValue={updateTempValue}
                    valueClick={props.searchGroup} />
                <EditPanelRowMulti editField={BooksEditField.Artists}
                    tempValue={tempFields.artists}
                    updateTempValue={updateTempValue}
                    valueClick={props.searchArtist} />
                <EditPanelRowMulti editField={BooksEditField.Tags}
                    tempValue={tempFields.tags}
                    updateTempValue={updateTempValue}
                    valueClick={props.searchTag} />
                <EditPanelRow editField={BooksEditField.Prefix}
                    tempValue={tempFields.prefix}
                    updateTempValue={updateTempValue}
                    valueClick={props.searchPrefix}
                ></EditPanelRow>
                <EditPanelRowMulti editField={BooksEditField.HiddenPages}
                    tempValue={tempFields.hiddenPages}
                    updateTempValue={updateTempValue}
                    hideTextInput={true} />
            </div>
            <div className="edit-panel-controls">
                <button className="delete-button" onClick={deleteBook} type="button">DELETE BOOK</button>
                <button disabled={!changesPending} onClick={saveBookChanges} type="button">Confirm Changes</button>
                <button disabled={!changesPending} onClick={resetPendingChanges} type="button">Reset Changes</button>
            </div>
        </div>
    )
}

export default EditPanel