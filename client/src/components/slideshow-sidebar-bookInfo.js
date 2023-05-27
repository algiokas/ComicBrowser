import React, { Component } from "react";
import GalleryItem from "./galleryItem";

class BookInfo extends Component {
    constructor(props) {
        super(props);

        this.book = props.book
        this.inputRef = React.createRef()

        if (this.props.viewSearchResults) {
            this.viewSearchResults = this.props.viewSearchResults.bind(this)
        }
        if (this.props.unhidePage) {
            this.unhidePage = this.props.unhidePage.bind(this)
        }
        if (this.props.addTagToBook) {
            this.addTagToBook = this.props.addTagToBook.bind(this)
        }

        this.state = {
            showTagModal: false,
            tagToAdd: ""
        }
    }

    searchGroup = (g) => {
        this.viewSearchResults({
            group: g
        })
    }

    searchArtist = (a) => {
        this.viewSearchResults({
            artist: a
        })
    }

    searchPrefix = (p) => {
        this.viewSearchResults({
            prefix: p
        })
    }

    searchTag = (t) => {
        this.viewSearchResults({
            tag: t
        })
    }

    toggleTagModal = () => {
        if (!this.state.showTagModal && this.inputRef) {
            this.inputRef.current.focus()
        }
        this.setState((state) => {
            return { showTagModal: !state.showTagModal }
        })
    }

    handleTagInputChange = (e) => {
        this.setState({ tagToAdd: e.target.value })
    }

    handleTagInputKey = (e) => {
        if (e.key === 'Enter') {
            this.addTagToBook(this.state.tagToAdd)
            this.setState({ tagToAdd: '' })
        }
    }

    handleTagButtonClick = () => {
        this.addTagToBook(this.state.tagToAdd)
        this.setState({ tagToAdd: '' })
    }

    render() {
        return (
            <div className="book-info">
                <GalleryItem
                    book={this.props.book}
                    index={0}
                    addButtonHandler={this.props.addButtonHandler}>
                </GalleryItem>
                <div className="book-info-inner">
                    {
                        this.book.artGroup ?
                            <div className="book-info-line">
                                <span className="info-label">Group:</span>
                                <span className="info-item clickable" onClick={() => { this.searchGroup(this.book.artGroup) }}>
                                    {this.book.artGroup}
                                </span>
                            </div>
                            : null
                    }
                    {
                        this.book.artists.length > 0 ?
                            <div className="book-info-line">
                                <span className="info-label">Artists:</span>
                                <div className="info-items">
                                    {
                                        this.book.artists.map((artist, i) => {
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
                        <span className="info-item">{this.book.pageCount}</span>
                    </div>
                    {
                        this.book.language ?
                            <div className="book-info-line">
                                <span className="info-label">Language:</span>
                                <span className="info-item">{this.book.language}</span>
                            </div>
                            : null
                    }
                    {
                        this.book.prefix ?
                            <div className="book-info-line">
                                <span className="info-label">Prefix:</span>
                                <span className="info-item clickable" onClick={() => { this.searchPrefix(this.book.prefix) }}>
                                    {this.book.prefix}
                                </span>
                            </div>
                            : null
                    }
                    <div className="book-info-line">
                        <span className="info-label">Tags:</span>
                        <div className="info-items">
                            {
                                this.book.tags && this.book.tags.length > 0 ?
                                    this.book.tags.map((tag, i) => {
                                        return <span className="info-item clickable" onClick={() => { this.searchTag(tag) }} key={i}>
                                            {tag}
                                        </span>
                                    }) : null
                            }
                            <span className="info-icon" onClick={() => { this.toggleTagModal() }}>
                                <img className="svg-icon-pink text-icon" src="http://localhost:9000/data/images/plus-symbol.svg" alt="add to slideshow"></img>
                            </span>
                        </div>
                    </div>
                    <dialog id="tag-modal" 
                        className="modal-background"
                        open={this.state.showTagModal}
                        onClick={() => { this.toggleTagModal() }}>
                        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-dialog-inner">
                                <h3>Add New Tag</h3>
                                <div className="input-container">
                                    <input 
                                        type="text"
                                        value={this.state.tagToAdd}
                                        onChange={this.handleTagInputChange}
                                        onKeyDown={this.handleTagInputKey}
                                        ref={this.inputRef}>
                                    </input>
                                    <button type="buttton" onClick={() => { this.handleTagButtonClick() }}>Add</button>
                                </div>
                            </div>
                        </div>
                    </dialog>
                    {
                        this.book.hiddenPages ?
                            <div className="book-info-line">
                                <span className="info-label">Hidden Pages:</span>
                                <div className="info-items">
                                    {
                                        this.book.hiddenPages.map((page, i) => {
                                            return <span className="info-item clickable" onClick={() => { this.unhidePage(page) }} key={i}>
                                                {page}
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