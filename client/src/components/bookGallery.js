import React, { Component } from "react";
import GalleryItem from "./galleryItem";
import PageSelect from "./pageSelect";

export const SortOrder = Object.freeze({
    Random: Symbol("Random"),
    Title: Symbol("AlphaTitle"),
    Author: Symbol("AlphaAuthor"),
    ID: Symbol("ID")
})
  
const defaultSortOrder = SortOrder.Random

class BookGallery extends Component {
    constructor(props) {
        super(props)
   
        this.allBooks = props.allBooks
        this.viewBook = props.viewBook.bind(this)
        this.addBookToSlideshow = props.addBookToSlideshow.bind(this)
        this.pageSize = props.pageSize
        this.totalPages = Math.floor(props.allBooks.length / this.pageSize)

        this.state = { 
            galleryPage: 0,
            bookList: this.getSortedBooks(props.allBooks, defaultSortOrder),
            sortOrder: defaultSortOrder
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
                    let aAuthor = a.group ?? a.artists[0]
                    let bAuthor = b.group ?? b.artists[0]
                    if (aAuthor && bAuthor) {
                        return aAuthor.localeCompare(bAuthor)
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
            console.log(`sort books: ${order}`)
            this.setState({
                bookList: this.getSortedBooks(this.allBooks, newOrder),
                sortOrder: newOrder
            })
        }
    }

    getCurrentPage = () => {
        let pageStart = this.state.galleryPage * this.pageSize;
        let pageEnd = (this.state.galleryPage+1) * this.pageSize;

        return this.state.bookList.slice(pageStart, pageEnd)
    }

    previousPage = () => {
        if (this.state.galleryPage > 0) {
            this.setState((state) => {
                return {galleryPage: state.galleryPage - 1};
            });
        }
    }

    nextPage = () => {
        if (this.state.galleryPage < this.totalPages-1) {
            this.setState((state) => {
                return {galleryPage: state.galleryPage + 1};
            });
        }
    }

    render() {
        return (
            <div className="container index-container dark-theme">
                <div className="container-header">
                    <PageSelect previousPage={this.previousPage} nextPage={this.nextPage} totalPages={this.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                    <div className="sort-select">
                        {
                            Object.keys(SortOrder).map((key) => {
                                return <div className={`sort-order ${this.state.sortOrder === SortOrder[key] ? "selected" : ""}`} 
                                    onClick={() => {this.sortBooks(key)}}>{key}</div>
                            })
                        }
                    </div>
                </div>
                <div className="container-inner">
                    {this.getCurrentPage().map((object, i) => {
                        return <GalleryItem book={object} bodyClickHandler={this.viewBook} addButtonHandler={this.addBookToSlideshow} ></GalleryItem>
                    })
                    }
                </div>
                <div className="container-footer">
                    <PageSelect previousPage={this.previousPage} nextPage={this.nextPage} totalPages={this.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                </div>
            </div>
        )
    }
}

export default BookGallery