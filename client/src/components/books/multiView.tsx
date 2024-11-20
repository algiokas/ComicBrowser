import React, { Component } from "react";
import CoverGallery from "./coverGallery/coverGallery";
import Slideshow from "./slideshow/slideshow";
import LoadingView from "./loadingView";
import { BooksViewMode } from "../../util/enums";
import { BooksSortOrder } from "../../util/enums";
import { AppState } from "../../App";
import IBook from "../../interfaces/book";
import { IBookSearchQuery }from "../../interfaces/searchQuery";
import { BooksAppState } from "./booksApp";

interface MultiViewProps extends BooksAppState {
    viewBook(book: IBook): void,
    viewSlideshow(): void,
    viewListing(): void,
    viewCurrentBook(): void,
    viewSearchResults(query?: IBookSearchQuery): void,
    addBookToSlideshow(book : IBook): void,
    removeBookFromSlideshow(index : number): void,
    setSlideshowInterval(interval : number): void,
    setSlideshowPage(n : number): void,
    resetSlideshow(): void,
    updateBook(book : IBook): void,
    deleteBook(bookId : number) : void,
    importBooks(): void,
}

interface MultiViewState{}

class MultiView extends Component<MultiViewProps, MultiViewState> {
    render() {
        const galleryHandlers = {
            viewBook: this.props.viewBook,
            updateBook: this.props.updateBook,
            viewSearchResults: this.props.viewSearchResults,
            addBookToSlideshow: this.props.addBookToSlideshow
        }

        const slideshowHandlers = {
            setCurrentPage: this.props.setSlideshowPage,
            addButtonHandler: this.props.addBookToSlideshow,
            removeButtonHandler: this.props.removeBookFromSlideshow,
            emptySlideshow: this.props.resetSlideshow,
            updateBook: this.props.updateBook,
            deleteBook: this.props.deleteBook,
            viewSearchResults: this.props.viewSearchResults
        }
        switch(this.props.viewMode) {
            case BooksViewMode.Listing:
                return(
                    <CoverGallery 
                        allBooks={this.props.allBooks} 
                        pageSize={this.props.galleryPageSize} 
                        {...galleryHandlers}/>
                )
            case BooksViewMode.SearchResults:
                return (
                    <CoverGallery
                        sortOrder={BooksSortOrder.Title}
                        query={this.props.currentSearchQuery} 
                        allBooks={this.props.allBooks} 
                        pageSize={this.props.galleryPageSize} 
                        showFilters={true}
                        {...galleryHandlers}/>
                )
            case BooksViewMode.SingleBook:
                let singleBook = {
                    id: null,
                    name: "",
                    pageCount: this.props.currentBook?.pageCount ?? 0,
                    books: [ this.props.currentBook! ],
                }
                return(
                    <Slideshow
                        slideshow={singleBook}
                        currentPage={this.props.singleBookPage}
                        viewMode={this.props.viewMode}
                        {...slideshowHandlers}/>
                )
            case BooksViewMode.Slideshow:
                return (
                    <Slideshow
                        slideshow={this.props.currentSlideshow}
                        currentPage={this.props.slideshowPage}
                        viewMode={this.props.viewMode}
                        {...slideshowHandlers}/>
                )
            case BooksViewMode.Loading:
                return (
                    <LoadingView></LoadingView>
                )           
            default:
                console.log("INVALID VIEWMODE")
                return(<p>VIEWMODE ERROR</p>)
        }
    }
}

export default MultiView