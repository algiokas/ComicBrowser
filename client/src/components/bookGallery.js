import React, { Component } from "react";
import GalleryItem from "./galleryItem";
import PageSelect from "./pageSelect";
import { getBookAuthor } from "../util/helpers";

export const SortOrder = Object.freeze({
    Random: Symbol("Random"),
    Title: Symbol("AlphaTitle"),
    Author: Symbol("AlphaAuthor"),
    Artist: Symbol("AlphaArtist"),
    ID: Symbol("ID")

})
  
const defaultSortOrder = SortOrder.Random


class BookGallery extends Component {
    constructor(props) {
        super(props)

        this.viewBook = props.viewBook.bind(this)
        this.addBookToSlideshow = props.addBookToSlideshow.bind(this)
        this.subTitleClick = props.subTitleClick.bind(this)
        this.pageSize = props.pageSize
        this.totalPages = Math.floor(props.allBooks.length / this.pageSize)

        this.state = { 
            galleryPage: 0,
            bookList: this.getSortedBooks(props.allBooks, defaultSortOrder),
            sortOrder: defaultSortOrder
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.allBooks !== this.props.allBooks) {
            this.setState({
                bookList: this.getSortedBooks(this.props.allBooks, this.state.sortOrder)
            })
        }
    }

    getSortedBooks = (books, sortOrder) => {
        let sortedCopy = [...books]
        switch (sortOrder) {
            case SortOrder.Title:
                sortedCopy.sort((a, b) => {
                    if (a.title && b.title) {
                        return a.title.localeCompare(b.title)
                    }
                    return 0
                })
                break
            case SortOrder.Author:
                sortedCopy.sort((a, b) => {
                    let aAuthor = getBookAuthor(a)
                    let bAuthor = getBookAuthor(b)
                    if (aAuthor && bAuthor) {
                        let authorCompare = aAuthor.localeCompare(bAuthor)
                        if (authorCompare === 0) {
                            return a.title.localeCompare(b.title)
                        }
                        return authorCompare
                    }
                    return 0
                    
                })               
                break
            case SortOrder.Artist:
                    sortedCopy.sort((a, b) => {
                        let aArtists = a.artists.join(',')
                        let bArtists = b.artists.join(',')
                        if (aArtists && bArtists) {
                            let artistCompare = aArtists.localeCompare(bArtists)
                            if (artistCompare === 0) {
                                return a.title.localeCompare(b.title)
                            }
                            return artistCompare
                        }
                        return 0
                    })
                    break
            case SortOrder.ID:
                sortedCopy.sort((a, b) => {
                    if (a.id && b.id) {
                        return a.id - b.id
                    }
                    return 0
                })
                break
            case SortOrder.Random:
                sortedCopy.sort((a, b) => {
                    return 0.5 - Math.random()
                })
                break
            default:
                console.log("getSortedBooks - Invalid Sort Order")
        }
        return sortedCopy
    }

    sortBooks = (order) =>  {
        let newOrder = SortOrder[order]
        if (SortOrder.hasOwnProperty(order) && (this.state.sortOrder !== newOrder || newOrder === SortOrder.Random)) {
            this.setState({
                bookList: this.getSortedBooks(this.props.allBooks, newOrder),
                sortOrder: newOrder
            })
        }
    }

    getItemSubtitle = (book) => {
        if (this.state.sortOrder === SortOrder.Author) {
            return getBookAuthor(book)
        }       
        return book.artists.join(',')
    }

    getCurrentPage = () => {
        let pageStart = this.state.galleryPage * this.pageSize;
        let pageEnd = (this.state.galleryPage+1) * this.pageSize;
        return this.state.bookList.slice(pageStart, pageEnd)
    }

    setPage = (page) => {
        this.setState({ galleryPage : page })
    }

    render() {
        return (
            <div className="container index-container dark-theme">
                <div className="container-header">
                    <PageSelect setPage={this.setPage} totalPages={this.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                    <div className="sort-select">
                        {
                            Object.keys(SortOrder).map((key) => {
                                return <div key={key} className={`sort-order ${this.state.sortOrder === SortOrder[key] ? "selected" : ""}`} 
                                    onClick={() => {this.sortBooks(key)}}>{key}</div>
                            })
                        }
                    </div>
                </div>
                <div className="container-inner">
                    {this.getCurrentPage().map((object, i) => {
                        return <GalleryItem 
                            key={i}
                            book={object} 
                            bodyClickHandler={this.viewBook} 
                            addButtonHandler={this.addBookToSlideshow} 
                            getSubtitle={this.getItemSubtitle}
                            subTitleClickHandler={this.subTitleClick}
                        ></GalleryItem>
                    })

                    }
                </div>
                <div className="container-footer">
                    <PageSelect setPage={this.setPage} totalPages={this.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                </div>
            </div>
        )
    }
}

export default BookGallery