import React, { Component } from "react";
import CoverGallery, { SortOrder } from "./coverGallery";
import Slideshow from "./slideshow";
import LoadingView from "./loadingView";
import { ViewMode } from "../App";

class MultiView extends Component {
    render() {
        switch(this.props.viewMode) {
            case ViewMode.Listing:
                return(
                    <CoverGallery 
                        allBooks={this.props.allBooks} 
                        pageSize={this.props.galleryPageSize} 
                        viewBook={this.props.viewBook}
                        updateBook={this.props.updateBook}
                        subTitleClick={this.props.viewAuthor}
                        addBookToSlideshow={this.props.addBookToSlideshow}>
                    </CoverGallery>
                )
            case ViewMode.SingleBook:
                let singleBook = {
                    pageCount: this.props.currentBook.pageCount,
                    books: [ this.props.currentBook ],
                }
                return(
                    <Slideshow
                        slideshow={singleBook}
                        currentPage={this.props.singleBookPage}
                        viewMode={this.props.viewMode}
                        interval={this.props.slideshowInterval}
                        setSlideshowInterval={this.props.setSlideshowInterval}
                        setCurrentPage={this.props.setSlideshowPage}
                        addButtonHandler={this.props.addBookToSlideshow}
                        updateBook={this.props.updateBook}
                        viewSearchResults={this.props.viewSearchResults}
                    ></Slideshow>
                )
            case ViewMode.Slideshow:
                return (
                    <Slideshow
                        slideshow={this.props.currentSlideshow}
                        currentPage={this.props.slideshowPage}
                        viewMode={this.props.viewMode}
                        interval={this.props.slideshowInterval}
                        setSlideshowInterval={this.props.setSlideshowInterval}
                        setCurrentPage={this.props.setSlideshowPage}
                        removeButtonHandler={this.props.removeBookFromSlideshow}
                        emptySlideShow={this.props.resetSlideshow}
                        saveCurrentSlideshow={this.props.saveCurrentSlideshow}
                    ></Slideshow>
                )
            case ViewMode.SearchResults:
                return (
                    <CoverGallery
                        sortOrder={SortOrder.Title}
                        query={this.props.currentSearchQuery} 
                        allBooks={this.props.allBooks} 
                        pageSize={this.props.galleryPageSize} 
                        viewBook={this.props.viewBook}
                        subTitleClick={this.props.viewAuthor}
                        updateBook={this.props.updateBook}
                        addBookToSlideshow={this.props.addBookToSlideshow}
                        showFilters={true}>
                    </CoverGallery>
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