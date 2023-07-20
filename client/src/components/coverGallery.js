import React, { Component } from "react";
import GalleryItem from "./galleryItem";
import PageSelect from "./pageSelect";
import { getBookAuthor } from "../util/helpers";
import FilterInfo from "./filterInfo";

export const SortOrder = Object.freeze({
    Favorite: Symbol("Favorite"),
    Random: Symbol("Random"),
    Title: Symbol("AlphaTitle"),
    Author: Symbol("AlphaAuthor"),
    Artist: Symbol("AlphaArtist"),
    ID: Symbol("ID"),
    Date: Symbol("Date")
})

class CoverGallery extends Component {
    constructor(props) {
        super(props)

        this.viewBook = props.viewBook.bind(this)
        this.addBookToSlideshow = props.addBookToSlideshow.bind(this)
        this.subTitleClick = props.subTitleClick.bind(this)
        this.totalPages = this.getTotalPages(props.allBooks)

        let initialSortOrder = props.sortOrder ?? SortOrder.Favorite

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
            
            this.state.totalPages = this.getTotalPages(filteredBooks)
        } else {
            this.state.bookList = this.getSortedBooks(props.allBooks, initialSortOrder)
            this.state.totalPages = this.getTotalPages(this.props.allBooks)
        }
    }

    blankLoadState(n) {
        let result = []
        for (let i =  0; i < n; i++) {
            result.push(false)
        }
        return result
    }

    getTotalPages = (books) => {
        if (books) {
            return Math.max(1, Math.floor(books.length / this.props.pageSize))
        }
        return 1
    }

    componentDidUpdate(prevProps) {
        if (prevProps.allBooks !== this.props.allBooks || prevProps.query !== this.props.query) {
            if (this.props.query) {
                let filteredBooks = this.getFilteredBooks(this.props.allBooks, this.props.query)
                this.setState({
                    galleryPage: 0,
                    bookList: this.getSortedBooks(filteredBooks, this.state.sortOrder),
                    totalPages: this.getTotalPages(filteredBooks)
                })
            } else {
                this.setState({
                    galleryPage: 0,
                    bookList: this.getSortedBooks(this.props.allBooks, this.state.sortOrder),
                    totalPages: this.getTotalPages(this.props.allBooks)
                })
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
            case SortOrder.Favorite:
                sortedCopy.sort((a, b) => {
                    return 0.5 - Math.random()
                })
                let favorites = sortedCopy.filter(b => b.isFavorite)
                let other = sortedCopy.filter(b => !b.isFavorite)
                sortedCopy = favorites.concat(other)
                break
            case SortOrder.Date:
                sortedCopy.sort((a, b) => {
                    let adate = Date.parse(a.addedDate)
                    let bdate = Date.parse(b.addedDate)
                    if (adate && bdate) {
                        return bdate - adate
                    }
                    return 0
                })
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
                return book.artGroup === searchQuery.group
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
                galleryPage: 0,
                bookList: this.getSortedBooks(this.props.allBooks, newOrder),
                sortOrder: newOrder
            })
        }
    }

    getItemSubtitle = (book) => {
        if (this.state.sortOrder === SortOrder.Author) {
            return getBookAuthor(book)
        }
        try {
            let test = book.artists.join(',')
            return test
        } catch (err) {
            return ''
        }
        //return book.artists.join(',')
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

    favoriteClick = (book) => {
        console.log("toggle favorite for book: " + book.id)
        if (this.props.updateBook) {
            book.isFavorite = !book.isFavorite; //toggle value
            this.props.updateBook(book)
        }
    }

    render() {
        return (
            <div className="container index-container dark-theme">
                <div className="container-header">
                    {
                        this.props.showFilters && this.state.filterQuery && this.state.filterQuery.filled ?
                        <FilterInfo filterQuery={this.state.filterQuery}></FilterInfo>
                        : null
                    }
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
                            favoriteClickHandler={this.favoriteClick}
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