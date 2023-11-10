import React, { Component } from "react";
import GalleryItem from "./galleryItem";
import PageSelect from "../shared/pageSelect";
import { GetCoverPath, getBookAuthor } from "../../util/helpers";
import FilterInfo from "./filterInfo";
import SortControls from "./sortControls";
import { SortOrder } from "../../util/enums";
import IBook from "../../interfaces/book";
import ISearchQuery from "../../interfaces/searchQuery";

interface CoverGalleryProps {
    allBooks: IBook[],
    pageSize: number,

    sortOrder?: SortOrder,
    query?: ISearchQuery,
    showFilters?: boolean,

    viewBook(book: IBook): void,
    updateBook(book: IBook): void,
    viewSearchResults(query?: ISearchQuery): void
    addBookToSlideshow(book : IBook): void
}

interface CoverGalleryState {
    galleryPage: number,
    currentPageSize: number,
    bookList: IBook[],
    totalPages: number,
    sortOrder: SortOrder
}

class CoverGallery extends Component<CoverGalleryProps, CoverGalleryState> {
    constructor(props: CoverGalleryProps) {
        super(props)

        // this.totalPages = this.getTotalPages(props.allBooks)

        let initialSortOrder = props.sortOrder ?? SortOrder.Favorite

        let initialState: CoverGalleryState = {
            galleryPage: 0,
            currentPageSize: props.allBooks.length < props.pageSize ? props.allBooks.length : props.pageSize,
            bookList: [],
            totalPages: 0,
            sortOrder: initialSortOrder
        }

        if (props.query) {
            let filteredBooks = this.getFilteredBooks(props.allBooks, props.query)
            initialState.bookList = this.getSortedBooks(filteredBooks, initialSortOrder)
            initialState.totalPages = this.getTotalPages(filteredBooks)
        } else {
            initialState.bookList = this.getSortedBooks(props.allBooks, initialSortOrder)
            initialState.totalPages = this.getTotalPages(props.allBooks)
        }
        this.state = initialState
    }

    componentDidUpdate(prevProps: CoverGalleryProps) {
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

    
    getTotalPages = (books: IBook[]): number => {
        if (books) {
            return Math.max(1, Math.ceil(books.length / this.props.pageSize))
        }
        return 1
    }

    getSortedBooks = (books: IBook[], sortOrder: SortOrder): IBook[] => {
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
                    return b.addedDate.getTime() - a.addedDate.getTime()
                })
            default:
                console.log("getSortedBooks - Invalid Sort Order")
        }
        return sortedCopy
    }

    getFilteredBooks = (books: IBook[], searchQuery: ISearchQuery): IBook[] => {
        let results = books
        if (searchQuery.artist) {
            results = results.filter(book => {
                if (book.artists) {
                    let match = book.artists.filter((a) => a.toLowerCase() === searchQuery.artist!.toLowerCase())
                    if (match.length > 0) {
                        return true
                    }
                    //return book.artists.some((a) => a.toLowerCase() === searchQuery.artist!.toLowerCase())
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
                    return book.tags.some((a) => a.toLowerCase() === searchQuery.tag!.toLowerCase())
                }
                return false
            })
        }
        return results
    }

    sortBooks = (order: SortOrder) => {
        if (this.state.sortOrder !== order || order === SortOrder.Random || order === SortOrder.Favorite){
            this.setState({
                galleryPage: 0,
                bookList: this.getSortedBooks(this.props.allBooks, order),
                sortOrder: order
            })
        }
    }

    getItemSubtitle = (book: IBook): string => {
        if (this.state.sortOrder === SortOrder.Author) {
            return getBookAuthor(book)
        }
        return book.artists.join(',')
    }

    getCurrentGalleryPage = (): IBook[] => {
        let pageStart = this.state.galleryPage * this.props.pageSize;
        let pageEnd = (this.state.galleryPage+1) * this.props.pageSize;
        return this.state.bookList.slice(pageStart, pageEnd)
    }

    getPageSize = (pageNum: number): number => {
        if (pageNum < this.state.totalPages-1) {
            return this.props.pageSize
        } else {
            return this.state.bookList.length % this.props.pageSize
        }
    }

    setPage = (pageNum: number) => {
        this.setState({ 
            galleryPage : pageNum
        })
    }

    bodyClick = (book: IBook, bookIndex: number) => {
        this.props.viewBook(book)
    }

    subTitleClick = (book: IBook) => {
        let subtitle = this.getItemSubtitle(book)
        if (subtitle === book.artGroup) {
            this.props.viewSearchResults({ group: subtitle })
        }
        else {
            this.props.viewSearchResults({ artist: subtitle })
        }      
    }

    favoriteClick = (book: IBook) => {
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
                        currentPage={this.state.galleryPage}/>
                    {
                        this.props.sortOrder ? null :
                        <SortControls sortOrder={this.state.sortOrder}
                            bookList={this.state.bookList}
                            pageSize={this.props.pageSize}
                            sortBooks={this.sortBooks}
                            setPage={this.setPage}/>
                    }
                </div>
                <div className="gallery-container-inner">
                    {this.getCurrentGalleryPage().map((book, i) => {

                        return <GalleryItem 
                            index={i}
                            book={book}
                            coverUrl={GetCoverPath(book)}
                            subtitle={this.getItemSubtitle(book)}
                            addButtonHandler={this.props.addBookToSlideshow} 
                            bodyClickHandler={this.bodyClick}
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