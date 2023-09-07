import React, { Component } from "react";
import CoverGallery from "./coverGallery/coverGallery";
import Slideshow from "./slideshow/slideshow";
import LoadingView from "./loadingView";
import { ViewMode } from "../util/enums";
import { SortOrder } from "../util/enums";
import { AppState } from "../App";
import IBook from "../interfaces/book";
import ISearchQuery from "../interfaces/searchQuery";

interface MultiViewProps extends AppState {
    viewBook(book: IBook): void,
    viewSlideshow(): void,
    viewListing(): void,
    viewCurrentBook(): void,
    viewSearchResults(query?: ISearchQuery): void,
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
            case ViewMode.Listing:
                return(
                    <CoverGallery 
                        allBooks={this.props.allBooks} 
                        pageSize={this.props.galleryPageSize} 
                        {...galleryHandlers}/>
                )
            case ViewMode.SearchResults:
                return (
                    <CoverGallery
                        sortOrder={SortOrder.Title}
                        query={this.props.currentSearchQuery} 
                        allBooks={this.props.allBooks} 
                        pageSize={this.props.galleryPageSize} 
                        showFilters={true}
                        {...galleryHandlers}/>
                )
            case ViewMode.SingleBook:
                let singleBook = {
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
            case ViewMode.Slideshow:
                return (
                    <Slideshow
                        slideshow={this.props.currentSlideshow}
                        currentPage={this.props.slideshowPage}
                        viewMode={this.props.viewMode}
                        {...slideshowHandlers}/>
                )
            case ViewMode.Loading:
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