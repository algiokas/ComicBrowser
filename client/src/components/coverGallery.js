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

class CoverGallery extends Component {
    constructor(props) {
        super(props)

        this.viewBook = props.viewBook.bind(this)
        this.addBookToSlideshow = props.addBookToSlideshow.bind(this)
        this.subTitleClick = props.subTitleClick.bind(this)
        this.totalPages = Math.floor(props.allBooks.length / props.pageSize)
        console.log(`total pages ${this.totalPages}`)
        let initialSortOrder = props.sortOrder ?? SortOrder.Random

        this.state = { 
            galleryPage: 0,
            currentPageSize: props.allBooks.length < props.pageSize ? props.allBooks.length : props.pageSize,
            bookList: [],
            totalPages: 0,
            sortOrder: initialSortOrder,
            filterQuery: props.query
        }

        if (props.query) {
            let filteredBooks = this.getFilteredBooks(props.allBooks, props.query)
            this.state.bookList = this.getSortedBooks(filteredBooks, initialSortOrder)
            
            this.state.totalPages = Math.floor(filteredBooks.length / props.pageSize)
            console.log(`1 totalPages = floor(${filteredBooks.length}/${props.pageSize})`)
        } else {
            this.state.bookList = this.getSortedBooks(props.allBooks, initialSortOrder)
            this.state.totalPages = Math.floor(props.allBooks.length / props.pageSize)
            console.log(`2 totalPages = floor(${props.allBooks.length}/${props.pageSize})`)
        }
    }

    blankLoadState(n) {
        let result = []
        for (let i =  0; i < n; i++) {
            result.push(false)
        }
        return result
    }



    componentDidUpdate(prevProps) {
        if (prevProps.allBooks !== this.props.allBooks || prevProps.query !== this.props.query) {
            if (this.props.query) {
                let filteredBooks = this.getFilteredBooks(this.props.allBooks, this.props.query)
                this.setState({
                    bookList: this.getSortedBooks(filteredBooks, this.state.sortOrder),
                    totalPages: Math.floor(filteredBooks.length / this.props.pageSize)
                })
                console.log(`3 totalPages = floor(${filteredBooks.length}/${this.props.pageSize})`)
            } else {
                this.setState({
                    bookList: this.getSortedBooks(this.props.allBooks, this.state.sortOrder),
                    totalPages: Math.floor(this.props.allBooks.length / this.props.pageSize)
                })
                console.log(`4 totalPages = floor(${this.props.allBooks.length}/${this.props.pageSize})`)
            }
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

    getFilteredBooks = (books, searchQuery) => {
        let results = books
        if (searchQuery.artist) {
            results = results.filter(book => {
                if (book.artists) {
                    return book.artists.some((a) => a.toLowerCase() === searchQuery.artist.toLowerCase())
                }
                return false
            })
        }
        if (searchQuery.group) {
            results = results.filter(book => {
                return book.group === searchQuery.group
            })
        }
        if (searchQuery.prefix) {
            results = results.filter(book => {
                return book.prefix === searchQuery.prefix
            })
        }
        if (searchQuery.tag) {
            results = results.filter(book => {
                if (book.tags) {
                    return book.tags.some((a) => a.toLowerCase() === searchQuery.tag.toLowerCase())
                }
                return false
            })
        }
        return results
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
        let pageStart = this.state.galleryPage * this.props.pageSize;
        let pageEnd = (this.state.galleryPage+1) * this.props.pageSize;
        return this.state.bookList.slice(pageStart, pageEnd)
    }

    getPageSize = (pageNum) => {
        if (pageNum < this.totalPages-1) {
            return this.props.pageSize
        } else {
            return this.state.bookList.length % this.props.pageSize
        }
    }

    setPage = (pageNum) => {
        this.setState({ 
            galleryPage : pageNum
        })
    }

    render() {
        return (
            <div className="container index-container dark-theme">
                <div className="container-header">
                    <PageSelect setPage={this.setPage} totalPages={this.state.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                    {
                        this.props.sortOrder ? null :
                            <div className="sort-select">
                                {
                                    Object.keys(SortOrder).map((key) => {
                                        return <div key={key} className={`sort-order ${this.state.sortOrder === SortOrder[key] ? "selected" : ""}`} 
                                            onClick={() => {this.sortBooks(key)}}>{key}</div>
                                    })
                                }
                            </div>
                    }

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
                    <PageSelect setPage={this.setPage} totalPages={this.state.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                </div>
            </div>
        )
    }
}

export default CoverGallery