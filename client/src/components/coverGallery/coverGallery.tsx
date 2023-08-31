import React, { Component } from "react";
import GalleryItem from "./galleryItem";
import PageSelect from "../shared/pageSelect";
import { getBookAuthor } from "../../util/helpers";
import FilterInfo from "./filterInfo";
import SortControls from "./sortControls";
import Book from "../../interfaces/book";
import { SortOrder } from "../../util/enums";

interface CoverGalleryProps {
    allBooks: Book[],
    pageSize: number,
    viewBook(): void,


}

class CoverGallery extends Component {
    constructor(props) {
        super(props)

        this.viewBook = props.viewBook.bind(this)
        this.addBookToSlideshow = props.addBookToSlideshow.bind(this)
        this.viewSearchResults = props.viewSearchResults.bind(this)
        this.totalPages = this.getTotalPages(props.allBooks)

        let initialSortOrder = props.sortOrder ?? SortOrder.Favorite

        this.state = { 
            galleryPage: 0,
            currentPageSize: props.allBooks.length < props.pageSize ? props.allBooks.length : props.pageSize,
            bookList: [],
            totalPages: 0,
            sortOrder: initialSortOrder,
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
            return Math.max(1, Math.ceil(books.length / this.props.pageSize))
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
                    bookList: this.getSortedBooks(this.props.allBooks, SortOrder.Favorite),
                    totalPages: this.getTotalPages(this.props.allBooks),
                    sortOrder: SortOrder.Favorite
                })
            }
        }
    }

    getSortedBooks = (books, sortOrder) => {
        let sortedCopy = [...books]
        switch (sortOrder) {
            case SortOrder.Title:
                sortedCopy.sort((a, b) => {
                    return a.title.localeCompare(b.title)
                })
                break
            case SortOrder.Author:
                sortedCopy.sort((a, b) => {
                    let aAuthor = getBookAuthor(a)
                    let bAuthor = getBookAuthor(b)
                    return aAuthor.localeCompare(bAuthor)      
                })               
                break
            case SortOrder.Artist:
                    sortedCopy.sort((a, b) => {
                        let aArtists = a.artists.join(',')
                        let bArtists = b.artists.join(',')
                        return aArtists.localeCompare(bArtists)
                    })
                    break
            case SortOrder.ID:
                sortedCopy.sort((a, b) => {
                    return a.id - b.id
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
                    //Date.parse can return NaN
                    if (!adate) adate = 0
                    if (!bdate) bdate = 0
                    return bdate - adate
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

    subTitleClick = (book) => {
        let subtitle = this.getItemSubtitle(book)
        if (subtitle === book.artGroup) {
            this.viewSearchResults({ group: subtitle })
        }
        else {
            this.viewSearchResults({ artist: subtitle })
        }      
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
            <div className="gallery-container dark-theme">
                <div className="gallery-container-header">
                    {
                        this.props.showFilters && this.props.query && this.props.query.filled ?
                        <FilterInfo filterQuery={this.props.query}></FilterInfo>
                        : null
                    }
                    <PageSelect 
                        setPage={this.setPage} 
                        totalPages={this.state.totalPages} 
                        currentPage={this.state.galleryPage}>            
                    </PageSelect>
                    {
                        this.props.sortOrder ? null :
                        <SortControls sortOrder={this.state.sortOrder}
                            bookList={this.state.bookList}
                            pageSize={this.props.pageSize}
                            sortBooks={this.sortBooks}
                            setPage={this.setPage}>
                        </SortControls>
                    }
                </div>
                <div className="gallery-container-inner">
                    {this.getCurrentPage().map((object, i) => {
                        return <GalleryItem 
                            key={i}
                            book={object} 
                            bodyClickHandler={this.props.viewBook} 
                            addButtonHandler={this.addBookToSlideshow} 
                            getSubtitle={this.getItemSubtitle}
                            subTitleClickHandler={this.subTitleClick}
                            favoriteClickHandler={this.favoriteClick}
                        ></GalleryItem>
                    })

                    }
                </div>
                <div className="gallery-container-footer">
                    <PageSelect setPage={this.setPage} totalPages={this.state.totalPages} currentPage={this.state.galleryPage}></PageSelect>
                </div>
            </div>
        )
    }
}

export default CoverGallery