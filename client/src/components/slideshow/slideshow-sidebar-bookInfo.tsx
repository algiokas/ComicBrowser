import React, { Component } from "react";
import GalleryItem from "../coverGallery/galleryItem";
import Modal from "../shared/modal";
import EditPanel from "../editPanel/editPanel";
import IBook from "../../interfaces/book";
import ISearchQuery from "../../interfaces/searchQuery";
import { GetCoverPath } from "../../util/helpers";

interface BookInfoProps {
    book: IBook,
    addButtonHandler(book: IBook): void,
    unhidePage(pageNum: number): void,
    updateBook(book: IBook): void,
    deleteBook(bookId: number): void,
    viewSearchResults(query?: ISearchQuery): void
}

interface BookInfoState {
    inputRef: React.RefObject<HTMLInputElement>,
    showEditModal: boolean,
    tagToAdd: string
}

class BookInfo extends Component<BookInfoProps, BookInfoState> {
    constructor(props: BookInfoProps) {
        super(props);

        this.state = {
            inputRef: React.createRef<HTMLInputElement>(),
            showEditModal: false,
            tagToAdd: ""
        }
    }

    searchGroup(g: string): void {
        this.props.viewSearchResults({
            group: g
        })
    }

    searchArtist(a: string): void {
        this.props.viewSearchResults({
            artist: a
        })
    }

    searchPrefix(p: string): void {
        this.props.viewSearchResults({
            prefix: p
        })
    }

    searchTag(t: string): void {
        this.props.viewSearchResults({
            tag: t
        })
    }

    toggleEditModal(): void {
        this.setState((state) => {
            return ({ showEditModal: !state.showEditModal })
        })
    }

    render() {
        const searchHandlers = {
            searchGroup: this.searchGroup,
            searchArtist: this.searchArtist,
            searchPrefix: this.searchPrefix,
            searchTag: this.searchTag
        }
        return (
            <div className="book-info">
                <GalleryItem
                    index={0}
                    book={this.props.book}
                    coverUrl={GetCoverPath(this.props.book)}
                    subtitle={""}
                    addButtonHandler={this.props.addButtonHandler}/>
                <div className="edit-container">
                    <button type="button" className="edit-button" onClick={() => { this.toggleEditModal() }}>
                        Edit Book
                    </button>
                    <Modal modalId={"bookinfo-edit-modal"} displayModal={this.state.showEditModal} toggleModal={this.toggleEditModal}>
                        <EditPanel 
                            book={this.props.book}
                            updateBook={this.props.updateBook}
                            deleteBook={this.props.deleteBook}
                            toggleDisplay={this.toggleEditModal}
                            {...searchHandlers}/>
                    </Modal>
                </div>
                <div className="book-info-inner">
                    {
                        this.props.book.artGroup ?
                            <div className="book-info-line">
                                <span className="info-label">Group:</span>
                                <span className="info-item clickable" onClick={() => { this.searchGroup(this.props.book.artGroup) }}>
                                    {this.props.book.artGroup}
                                </span>
                            </div>
                            : null
                    }
                    {
                        this.props.book.artists.length > 0 ?
                            <div className="book-info-line">
                                <span className="info-label">Artists:</span>
                                <div className="info-items">
                                    {
                                        this.props.book.artists.map((artist, i) => {
                                            return <span className="info-item clickable" onClick={() => { this.searchArtist(artist) }} key={i}>
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
                        <span className="info-item">{this.props.book.pageCount}</span>
                    </div>
                    {
                        this.props.book.language ?
                            <div className="book-info-line">
                                <span className="info-label">Language:</span>
                                <span className="info-item">{this.props.book.language}</span>
                            </div>
                            : null
                    }
                    {
                        this.props.book.prefix ?
                            <div className="book-info-line">
                                <span className="info-label">Prefix:</span>
                                <span className="info-item clickable" onClick={() => { this.searchPrefix(this.props.book.prefix) }}>
                                    {this.props.book.prefix}
                                </span>
                            </div>
                            : null
                    }
                    <div className="book-info-line">
                        <span className="info-label">Tags:</span>
                        <div className="info-items">
                            {
                                this.props.book.tags && this.props.book.tags.length > 0 ?
                                    this.props.book.tags.map((tag, i) => {
                                        return <span className="info-item clickable" onClick={() => { this.searchTag(tag) }} key={i}>
                                            {tag}
                                        </span>
                                    }) : null
                            }
                        </div>
                    </div>
                    {
                        this.props.book.hiddenPages && this.props.book.hiddenPages.length ?
                            <div className="book-info-line">
                                <span className="info-label">Hidden Pages:</span>
                                <div className="info-items">
                                    {
                                        this.props.book.hiddenPages.map((page, i) => {
                                            return <span className="info-item clickable" onClick={() => { this.props.unhidePage(page) }} key={i}>
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
}

export default BookInfo