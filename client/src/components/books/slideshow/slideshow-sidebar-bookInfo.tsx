import React, { useState } from "react";
import type IBook from "../../../interfaces/book";
import type { IBookSearchQuery } from "../../../interfaces/searchQuery";
import { GetCoverPath } from "../../../util/helpers";
import Modal from "../../shared/modal";
import GalleryItem from "../coverGallery/galleryItem";
import EditPanel from "../editPanel/editPanel";

interface BookInfoProps {
    book: IBook,
    addButtonHandler(book: IBook): void,
    unhidePage(pageNum: number): void,
    updateBook(book: IBook): void,
    deleteBook(bookId: number): void,
    viewSearchResults(query?: IBookSearchQuery): void
}

interface BookInfoState {
    inputRef: React.RefObject<HTMLInputElement>,
    showEditModal: boolean,
    tagToAdd: string
}

const BookInfo = (props: BookInfoProps) => {
    const [tagToAdd, setTagToAdd] = useState<string>('')
    const [showEditModal, setShowEditModal] = useState<boolean>(false)

    const searchGroup = (g: string): void => {
        props.viewSearchResults({
            groups: g
        })
    }

    const searchArtist = (a: string): void => {
        props.viewSearchResults({
            artists: a
        })
    }

    const searchPrefix = (p: string): void => {
        props.viewSearchResults({
            prefix: p
        })
    }

    const searchTag = (t: string): void => {
        props.viewSearchResults({
            tags: t
        })
    }

    const toggleEditModal = (): void => {
        setShowEditModal(!showEditModal)
    }

    const favoriteClick = (book: IBook) => {
        console.log("toggle favorite for book: " + book.id)
        if (props.updateBook) {
            book.isFavorite = !book.isFavorite; //toggle value
            props.updateBook(book)
        }
    }

    const searchHandlers = {
        searchGroup: searchGroup,
        searchArtist: searchArtist,
        searchPrefix: searchPrefix,
        searchTag: searchTag
    }
    return (
        <div className="book-info">
            <GalleryItem
                index={0}
                book={props.book}
                coverUrl={GetCoverPath(props.book)}
                subtitle={""}
                addButtonHandler={props.addButtonHandler}
                favoriteClickHandler={favoriteClick} />
            <div className="edit-container">
                <button type="button" className="edit-button" onClick={() => { toggleEditModal() }}>
                    Edit Book
                </button>
                <Modal modalId={"bookinfo-edit-modal"} displayModal={showEditModal} toggleModal={toggleEditModal}>
                    <EditPanel
                        book={props.book}
                        updateBook={props.updateBook}
                        deleteBook={props.deleteBook}
                        toggleDisplay={toggleEditModal}
                        {...searchHandlers} />
                </Modal>
            </div>
            <div className="book-info-inner">
                {
                    props.book.artGroup ?
                        <div className="book-info-line">
                            <span className="info-label">Group:</span>
                            <span className="info-item clickable" onClick={() => { searchGroup(props.book.artGroup) }}>
                                {props.book.artGroup}
                            </span>
                        </div>
                        : null
                }
                {
                    props.book.artists.length > 0 ?
                        <div className="book-info-line">
                            <span className="info-label">Artists:</span>
                            <div className="info-items">
                                {
                                    props.book.artists.map((artist, i) => {
                                        return <span className="info-item clickable" onClick={() => { searchArtist(artist) }} key={i}>
                                            {artist}
                                        </span>
                                    })
                                }
                            </div>
                        </div>
                        : null
                }
                <div className="book-info-line">
                    <span className="info-label">Pages:</span>
                    <span className="info-item">{props.book.pageCount}</span>
                </div>
                {
                    props.book.language ?
                        <div className="book-info-line">
                            <span className="info-label">Language:</span>
                            <span className="info-item">{props.book.language}</span>
                        </div>
                        : null
                }
                {
                    props.book.prefix ?
                        <div className="book-info-line">
                            <span className="info-label">Prefix:</span>
                            <span className="info-item clickable" onClick={() => { searchPrefix(props.book.prefix) }}>
                                {props.book.prefix}
                            </span>
                        </div>
                        : null
                }
                <div className="book-info-line">
                    <span className="info-label">Tags:</span>
                    <div className="info-items">
                        {
                            props.book.tags && props.book.tags.length > 0 ?
                                props.book.tags.map((tag, i) => {
                                    return <span className="info-item clickable" onClick={() => { searchTag(tag) }} key={i}>
                                        {tag}
                                    </span>
                                }) : null
                        }
                    </div>
                </div>
                {
                    props.book.hiddenPages && props.book.hiddenPages.length ?
                        <div className="book-info-line">
                            <span className="info-label">Hidden Pages:</span>
                            <div className="info-items">
                                {
                                    props.book.hiddenPages.map((page, i) => {
                                        return <span className="info-item clickable" onClick={() => { props.unhidePage(page) }} key={i}>
                                            {page + 1}
                                        </span>
                                    })
                                }
                            </div>
                        </div>
                        : null
                }
            </div>
        </div>
    )
}

export default BookInfo